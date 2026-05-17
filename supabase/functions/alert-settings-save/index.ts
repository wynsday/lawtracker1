/**
 * alert-settings-save — persist a user's AlertConfig to the DB.
 *
 * POST <AlertConfig JSON body>
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

  const settings = await req.json().catch(() => null)
  if (!settings || typeof settings !== 'object') {
    return json({ ok: false, reason: 'invalid body' }, 400)
  }

  const { error } = await supabase.from('user_alert_settings').upsert({
    user_id:    user.id,
    settings,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) return json({ ok: false, reason: error.message }, 500)
  return json({ ok: true })
})
