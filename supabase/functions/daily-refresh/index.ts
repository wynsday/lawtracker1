/**
 * Daily Refresh Edge Function
 * Runs at 3 AM US Eastern (8:00 UTC EST / 7:00 UTC EDT).
 * Currently marks all bills as touched (updated_at = now()).
 * Replace the stub below with LegiScan API calls when ready.
 *
 * Deploy:  supabase functions deploy daily-refresh
 * Schedule via SQL Editor:
 *   select cron.schedule(
 *     'daily-refresh',
 *     '0 8 * * *',
 *     $$select net.http_post(
 *       url := 'https://<project-ref>.supabase.co/functions/v1/daily-refresh',
 *       headers := '{"Authorization":"Bearer <service-role-key>"}'::jsonb
 *     )$$
 *   );
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl     = Deno.env.get('SUPABASE_URL')!
const secretKey       = Deno.env.get('SUPABASE_SECRET_KEY')!

Deno.serve(async (_req: Request) => {
  const supabase = createClient(supabaseUrl, secretKey)

  // ── LegiScan stub ────────────────────────────────────────────────────
  // When you add LegiScan integration, replace this block:
  //
  //   const apiKey = Deno.env.get('LEGISCAN_API_KEY')!
  //   const res    = await fetch(
  //     `https://api.legiscan.com/?key=${apiKey}&op=getMasterList&state=MI`
  //   )
  //   const data = await res.json()
  //   // … diff against existing bills and upsert changes …
  //
  // For now, just record that a refresh ran by touching updated_at.
  // ─────────────────────────────────────────────────────────────────────

  const { error } = await supabase
    .from('bills')
    .update({ updated_at: new Date().toISOString() })
    .in('state', ['MI', 'US'])

  if (error) {
    console.error('Refresh error:', error.message)
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const ts = new Date().toISOString()
  console.log(`daily-refresh completed at ${ts}`)
  return new Response(JSON.stringify({ ok: true, refreshed_at: ts }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
