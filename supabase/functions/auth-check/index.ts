/**
 * auth-check — determine whether this device needs passcode or password.
 *
 * POST { username: string }
 * Cookie: wsp_session (read automatically — not expected in request body)
 *
 * Response:
 *   { ok: true,  mode: 'passcode' | 'password', locked: boolean }
 *   { ok: false, error: string }
 *
 * mode === 'passcode'  → cookie token matches account and is not expired
 * mode === 'password'  → no cookie, expired session, or account locked
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, getCookie, SESSION_COOKIE } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const body = await req.json().catch(() => null)
  if (!body?.username) return json({ ok: false, error: 'username required' }, 400)

  const { data: account, error } = await supabase
    .from('accounts')
    .select('session_token, session_expires_at, passcode_locked')
    .eq('username', body.username)
    .maybeSingle()

  if (error || !account) return json({ ok: false, error: 'not found' }, 404)

  if (account.passcode_locked) {
    return json({ ok: true, mode: 'password', locked: true })
  }

  const cookieToken = getCookie(req, SESSION_COOKIE)
  const recognized  =
    cookieToken &&
    account.session_token === cookieToken &&
    account.session_expires_at &&
    new Date(account.session_expires_at) > new Date()

  return json({ ok: true, mode: recognized ? 'passcode' : 'password', locked: false })
})
