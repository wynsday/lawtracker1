/**
 * notifications-read — mark all (or specific) notifications as read.
 *
 * POST {}                          → mark all read
 * POST { ids: ['uuid', ...] }      → mark specific notifications read
 *
 * Requires: wsp_session cookie
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, resolveSession } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const user = await resolveSession(req, supabase)
  if (!user) return json({ ok: false, reason: 'unauthorized' }, 401)

  const body = await req.json().catch(() => ({}))
  const ids: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined

  let query = supabase
    .from('user_notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (ids && ids.length > 0) query = query.in('id', ids)

  const { error } = await query
  if (error) return json({ ok: false, reason: error.message }, 500)
  return json({ ok: true })
})
