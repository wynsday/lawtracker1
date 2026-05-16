/**
 * local-official-submit
 *
 * Accepts a verified session and inserts a user-submitted local official
 * into the local_officials table.
 *
 * POST body: { role, name, phone?, email?, county?, state, since?, term_ends? }
 *
 * 200  { ok: true, id: string }
 * 400  { ok: false, reason: 'missing_fields' | 'invalid_role' }
 * 401  { ok: false, reason: 'no_cookie' | 'unauthorized' }
 * 500  { ok: false, reason: 'db_error' }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, getCookie, SESSION_COOKIE } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SECRET_KEY')!,
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return json({ ok: false, reason: 'method_not_allowed' }, 405)

  // -- Validate session cookie --------------------------------------------------

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

  // -- Parse and validate body --------------------------------------------------

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, reason: 'missing_fields' }, 400)
  }

  const role        = typeof body.role  === 'string' ? body.role.trim()  : ''
  const name        = typeof body.name  === 'string' ? body.name.trim()  : ''
  const state       = typeof body.state === 'string' ? body.state.trim().toUpperCase() : ''
  const phone       = typeof body.phone       === 'string' ? body.phone.trim()       : null
  const email       = typeof body.email       === 'string' ? body.email.trim()       : null
  const county      = typeof body.county      === 'string' ? body.county.trim()      : null
  const since       = typeof body.since       === 'string' && body.since.trim()      ? body.since.trim()      : null
  const term_ends   = typeof body.term_ends   === 'string' && body.term_ends.trim()  ? body.term_ends.trim()  : null

  if (!role || !name || !state) {
    return json({ ok: false, reason: 'missing_fields' }, 400)
  }

  // -- Upsert -------------------------------------------------------------------

  const { data: inserted, error: insertError } = await supabase
    .from('local_officials')
    .upsert(
      {
        role,
        name,
        state,
        phone:        phone        || null,
        email:        email        || null,
        county:       county       || null,
        since:        since        || null,
        term_ends:    term_ends    || null,
        submitted_by: account.id,
      },
      { onConflict: 'role,state,submitted_by' },
    )
    .select('id')
    .single()

  if (insertError) {
    console.error('[local-official-submit] upsert error:', insertError.message)
    return json({ ok: false, reason: 'db_error' }, 500)
  }

  return json({ ok: true, id: inserted.id })
})
