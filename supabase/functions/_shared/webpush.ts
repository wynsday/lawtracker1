/**
 * Web Push encryption — RFC 8291 (aes128gcm) + RFC 8292 (VAPID).
 * Implemented using the Web Crypto API only; no npm dependencies.
 */

export interface PushTarget {
  endpoint: string
  p256dh:   string   // base64url user-agent public key (65 bytes uncompressed P-256)
  auth_key: string   // base64url auth secret (16 bytes)
}

export interface VapidConfig {
  publicKey:  string  // base64url uncompressed P-256 public key
  privateKey: string  // base64url PKCS8 P-256 private key
  subject:    string  // mailto: or https: URI
}

// ── Encoding helpers ──────────────────────────────────────────────────────────

function b64uEncode(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64uDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - str.length % 4) % 4)
  const bin = atob(padded)
  return Uint8Array.from({ length: bin.length }, (_, i) => bin.charCodeAt(i))
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const a of arrays) { out.set(a, off); off += a.length }
  return out
}

// ── HKDF-SHA-256 ──────────────────────────────────────────────────────────────

async function hkdf(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const key  = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    key, len * 8,
  )
  return new Uint8Array(bits)
}

// ── Content encryption (RFC 8291 §3) ─────────────────────────────────────────

async function encryptPayload(
  plaintext: Uint8Array,
  userPublicKey: Uint8Array,
  authSecret: Uint8Array,
): Promise<{ body: Uint8Array; serverPublicKey: Uint8Array; salt: Uint8Array }> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Ephemeral server ECDH key pair
  const serverKP = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'],
  )
  const serverPublicKey = new Uint8Array(await crypto.subtle.exportKey('raw', serverKP.publicKey))

  // Import user's public key for ECDH
  const userKey = await crypto.subtle.importKey(
    'raw', userPublicKey, { name: 'ECDH', namedCurve: 'P-256' }, false, [],
  )

  // ECDH shared secret
  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: userKey }, serverKP.privateKey, 256),
  )

  // PRK (RFC 8291 §3.3)
  const authInfo = concat(enc.encode('WebPush: info\x00'), userPublicKey, serverPublicKey)
  const prk      = await hkdf(ecdhSecret, authSecret, authInfo, 32)

  // Content encryption key + nonce
  const cek   = await hkdf(prk, salt, enc.encode('Content-Encoding: aes128gcm\x00'), 16)
  const nonce = await hkdf(prk, salt, enc.encode('Content-Encoding: nonce\x00'), 12)

  // Encrypt: plaintext + 0x02 padding delimiter
  const cekKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: 128 },
      cekKey,
      concat(plaintext, new Uint8Array([2])),
    ),
  )

  // RFC 8188 header: salt(16) | rs(u32 BE=4096) | idlen(1=65) | serverPublicKey(65) | ciphertext
  const rs = new Uint8Array(4)
  new DataView(rs.buffer).setUint32(0, 4096, false)
  const body = concat(salt, rs, new Uint8Array([65]), serverPublicKey, ciphertext)

  return { body, serverPublicKey, salt }
}

// ── VAPID JWT (RFC 8292) ──────────────────────────────────────────────────────

async function makeVapidJwt(endpoint: string, vapid: VapidConfig): Promise<string> {
  const enc    = new TextEncoder()
  const origin = new URL(endpoint).origin

  const header  = b64uEncode(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = b64uEncode(enc.encode(JSON.stringify({
    aud: origin,
    exp: Math.floor(Date.now() / 1000) + 43_200,  // 12 h
    sub: vapid.subject,
  })))

  const privKey = await crypto.subtle.importKey(
    'pkcs8', b64uDecode(vapid.privateKey).buffer,
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'],
  )

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privKey,
    enc.encode(`${header}.${payload}`),
  )

  return `${header}.${payload}.${b64uEncode(new Uint8Array(sig))}`
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendWebPush(
  sub: PushTarget,
  payload: string,
  vapid: VapidConfig,
): Promise<void> {
  const userPublicKey = b64uDecode(sub.p256dh)
  const authSecret    = b64uDecode(sub.auth_key)

  const { body } = await encryptPayload(
    new TextEncoder().encode(payload),
    userPublicKey,
    authSecret,
  )

  const jwt = await makeVapidJwt(sub.endpoint, vapid)

  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Authorization':    `vapid t=${jwt},k=${vapid.publicKey}`,
      'Content-Type':     'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL':              '86400',
    },
    body,
  })

  // 201 = accepted, 200/204 = also OK; 410/404 = subscription expired
  if (!res.ok && res.status !== 201) {
    const text = await res.text().catch(() => '')
    throw new Error(`Push ${res.status}: ${text}`)
  }
}
