/**
 * auth-sensitive — re-verify a full password before any sensitive action.
 * An active session cookie is required in addition to the correct password.
 *
 * POST { username: string, password: string }
 * Cookie: wsp_session (read automatically — not expected in request body)
 *
 * Success: { ok: true }
 * Failure: { ok: false, error: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, verifyCredential, getCookie, SESSION_COOKIE } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SECRET_KEY')!,
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const body = await req.json().catch(() => null)
  if (!body?.username || !body?.password) {
    return json({ ok: false, error: 'username and password are required' }, 400)
  }

  const cookieToken = getCookie(req, SESSION_COOKIE)
  if (!cookieToken) return json({ ok: false, error: 'no active session' }, 401)

  const { data: account, error } = await supabase
    .from('accounts')
    .select('id, password_hash, session_token, session_expires_at')
    .eq('username', body.username)
    .maybeSingle()

  if (error || !account) return json({ ok: false, error: 'invalid credentials' }, 401)

  // Require cookie token to match DB — prevents replaying a stolen token for a different user
  if (account.session_token !== cookieToken) {
    return json({ ok: false, error: 'invalid session' }, 401)
  }
  if (!account.session_expires_at || new Date(account.session_expires_at) <= new Date()) {
    return json({ ok: false, error: 'session expired' }, 401)
  }

  if (!account.password_hash) {
    return json({ ok: false, error: 'no password set on this account' }, 400)
  }

  const valid = await verifyCredential(body.password, account.password_hash)
  return json({ ok: valid }, valid ? 200 : 401)
})
