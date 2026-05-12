/**
 * auth-signout — invalidate the current session.
 * Required because httpOnly cookies cannot be cleared by JavaScript.
 *
 * POST (empty body)
 * Cookie: wsp_session
 *
 * Success: { ok: true }  + Set-Cookie clears wsp_session
 * Always returns 200 — even if no cookie was present, the result is the same.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, getCookie, clearSessionCookie, SESSION_COOKIE } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SECRET_KEY')!,
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const token = getCookie(req, SESSION_COOKIE)

  // Clear the session from the DB so the token cannot be replayed
  if (token) {
    await supabase
      .from('accounts')
      .update({ session_token: null, session_expires_at: null })
      .eq('session_token', token)
  }

  return new Response(
    JSON.stringify({ ok: true }),
    {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie() },
    },
  )
})
