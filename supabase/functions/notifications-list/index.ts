/**
 * notifications-list — return the 50 most recent notifications for the current user.
 *
 * POST (empty body)
 * Returns: { notifications: UserNotification[] }
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

  const { data, error } = await supabase
    .from('user_notifications')
    .select('id, bill_id, type, title, body, read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return json({ ok: false, reason: error.message }, 500)
  return json({ ok: true, notifications: data ?? [] })
})
