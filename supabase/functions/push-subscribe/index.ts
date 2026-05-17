/**
 * push-subscribe — store or remove a Web Push subscription for the current user.
 *
 * POST { endpoint, keys: { p256dh, auth } }           → subscribe
 * POST { action: 'unsubscribe', endpoint }             → unsubscribe
 *
 * Requires: wsp_session cookie (validated server-side)
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

  if (body.action === 'unsubscribe') {
    if (!body.endpoint) return json({ ok: false, reason: 'missing endpoint' }, 400)
    await supabase.from('push_subscriptions').delete().eq('endpoint', body.endpoint)
    return json({ ok: true })
  }

  const { endpoint, keys } = body
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return json({ ok: false, reason: 'invalid subscription object' }, 400)
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id:  user.id,
    endpoint,
    p256dh:   keys.p256dh,
    auth_key: keys.auth,
  }, { onConflict: 'endpoint' })

  if (error) return json({ ok: false, reason: error.message }, 500)
  return json({ ok: true })
})
