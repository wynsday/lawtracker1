/**
 * Generate VAPID keys for Web Push.
 * Run once: node scripts/gen-vapid.mjs
 *
 * Copy the output into your .env and Supabase secrets as instructed.
 */

function base64url(bytes) {
  return Buffer.from(bytes).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify'],
)

const publicKeyRaw    = new Uint8Array(await crypto.subtle.exportKey('raw',   keyPair.publicKey))
const privateKeyPkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey))

const pub  = base64url(publicKeyRaw)
const priv = base64url(privateKeyPkcs8)

console.log('─────────────────────────────────────────')
console.log('VAPID keys generated. Copy these values:')
console.log('─────────────────────────────────────────')
console.log()
console.log('Add to .env:')
console.log(`  VITE_VAPID_PUBLIC_KEY=${pub}`)
console.log()
console.log('Set as Supabase secrets:')
console.log(`  supabase secrets set VAPID_PRIVATE_KEY=${priv}`)
console.log(`  supabase secrets set VAPID_SUBJECT=mailto:your@email.com`)
console.log(`  supabase secrets set FROM_EMAIL=alerts@yourdomain.com`)
console.log(`  supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx`)
console.log('─────────────────────────────────────────')
