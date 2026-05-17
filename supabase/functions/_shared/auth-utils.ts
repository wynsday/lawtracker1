// Shared utilities for all auth edge functions

export const SESSION_DAYS        = 45
export const MAX_PASSCODE_ATTEMPTS = 5
export const SESSION_COOKIE      = 'wsp_session'
export const COOKIE_MAX_AGE      = SESSION_DAYS * 24 * 60 * 60  // seconds

// ALLOWED_ORIGIN must be set as a Supabase secret:
//   supabase secrets set ALLOWED_ORIGIN=https://yourapp.com
// Credentials mode requires a specific origin — '*' is rejected by browsers.
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? ''
const IS_HTTP = ALLOWED_ORIGIN.startsWith('http://')
// SameSite=None required for cross-origin credentialed requests (Vercel → Supabase).
// SameSite=${SAME_SITE} is blocked by browsers on cross-origin POSTs.
const SAME_SITE = IS_HTTP ? 'Lax' : 'None'

export const CORS = {
  'Access-Control-Allow-Origin':      ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers':     'Content-Type, Authorization',
  'Access-Control-Allow-Methods':     'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

export function sessionExpiry(): string {
  const d = new Date()
  d.setDate(d.getDate() + SESSION_DAYS)
  return d.toISOString()
}

export function newSessionToken(): string {
  return crypto.randomUUID()
}

// Returns the value of a named cookie from the request, or null.
export function getCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim())
  }
  return null
}

// Builds a Set-Cookie string for a persistent 45-day session.
export function makeSessionCookie(token: string): string {
  const sec = IS_HTTP ? '' : ' Secure;'
  return `${SESSION_COOKIE}=${token}; HttpOnly;${sec} SameSite=${SAME_SITE}; Max-Age=${COOKIE_MAX_AGE}; Path=/`
}

// Builds a Set-Cookie string that immediately expires the session cookie.
export function clearSessionCookie(): string {
  const sec = IS_HTTP ? '' : ' Secure;'
  return `${SESSION_COOKIE}=; HttpOnly;${sec} SameSite=${SAME_SITE}; Max-Age=0; Path=/`
}

// Builds a Set-Cookie string for a browser-session-only cookie (no Max-Age).
export function makeSessionCookieShort(token: string): string {
  const sec = IS_HTTP ? '' : ' Secure;'
  return `${SESSION_COOKIE}=${token}; HttpOnly;${sec} SameSite=${SAME_SITE}; Path=/`
}

// ── Session resolution ────────────────────────────────────────────────────────

export interface SessionUser {
  id:       string
  username: string
  email:    string | null
  role:     string
  tier:     number
}

// Validates wsp_session cookie against the DB. Pass in an already-created
// service-role Supabase client. Returns null if cookie is missing/expired.
// deno-lint-ignore no-explicit-any
export async function resolveSession(req: Request, supabase: any): Promise<SessionUser | null> {
  const token = getCookie(req, SESSION_COOKIE)
  if (!token) return null
  const { data } = await supabase
    .from('accounts')
    .select('id, username, email, role, tier, session_token, session_expires_at')
    .eq('session_token', token)
    .maybeSingle()
  if (!data) return null
  if (data.session_token !== token) return null
  if (!data.session_expires_at || new Date(data.session_expires_at) <= new Date()) return null
  return { id: data.id, username: data.username, email: data.email ?? null, role: data.role, tier: data.tier }
}

// ── PBKDF2-SHA256 with random salt. Stored as "saltHex:hashHex". ──────────────
export async function hashCredential(credential: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(credential),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  )
  const toHex = (arr: Uint8Array) =>
    Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${toHex(salt)}:${toHex(new Uint8Array(bits))}`
}

export async function verifyCredential(input: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(input),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  )
  const newHex = Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return newHex === hashHex
}
