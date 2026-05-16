/**
 * local-official-verify
 *
 * Marks a local_officials row as verified by the current user.
 * One verification per user per official (unique constraint).
 * Increments verification_count on success.
 *
 * POST body: { official_id: string }
 *
 * 200  { ok: true, already_verified: boolean }
 * 400  { ok: false, reason: 'missing_fields' }
 * 401  { ok: false, reason: 'no_cookie' | 'unauthorized' }
 * 500  { ok: false, reason: 'db_error' }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, getCookie, SESSION_COOKIE } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ ok: false, reason: 'method_not_allowed' }, 405)

  // -- Validate session ---------------------------------------------------------

  const token = getCookie(req, SESSION_COOKIE)
  if (!token) return json({ ok: false, reason: 'no_cookie' }, 401)

  const { data: account, error: sessionError } = await supabase
    .from('accounts')
    .select('id, session_token, session_expires_at')
    .eq('session_token', token)
    .maybeSingle()

  if (sessionError || !account) return json({ ok: false, reason: 'unauthorized' }, 401)
  if (account.session_token !== token) return json({ ok: false, reason: 'unauthorized' }, 401)
  if (!account.session_expires_at || new Date(account.session_expires_at) <= new Date()) {
    return json({ ok: false, reason: 'unauthorized' }, 401)
  }

  // -- Parse body ---------------------------------------------------------------

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json({ ok: false, reason: 'missing_fields' }, 400) }

  const official_id = typeof body.official_id === 'string' ? body.official_id.trim() : ''
  if (!official_id) return json({ ok: false, reason: 'missing_fields' }, 400)

  // -- Insert verification (unique constraint prevents duplicates) ---------------

  const { error: insertError } = await supabase
    .from('local_official_verifications')
    .insert({ official_id, verified_by: account.id })

  if (insertError) {
    if (insertError.code === '23505') {
      return json({ ok: true, already_verified: true })
    }
    console.error('[local-official-verify] insert error:', insertError.message)
    return json({ ok: false, reason: 'db_error' }, 500)
  }

  // -- Increment verification count ---------------------------------------------

  const { data: current } = await supabase
    .from('local_officials')
    .select('verification_count')
    .eq('id', official_id)
    .single()

  const { error: updateError } = await supabase
    .from('local_officials')
    .update({ verification_count: (current?.verification_count ?? 0) + 1 })
    .eq('id', official_id)

  if (updateError) {
    console.error('[local-official-verify] update error:', updateError.message)
  }

  return json({ ok: true, already_verified: false })
})
