/**
 * notify-send — generate and dispatch daily notifications.
 *
 * Called by daily-refresh after bill updates. For each user with alerts
 * enabled, checks which updated bills match their preferences, writes
 * user_notifications records, sends email via Resend, and sends Web Push
 * to all registered devices.
 *
 * Secrets required:
 *   RESEND_API_KEY         — Resend API key
 *   FROM_EMAIL             — verified sender address (e.g. alerts@yourdomain.com)
 *   VAPID_PUBLIC_KEY       — base64url ECDSA P-256 public key
 *   VAPID_PRIVATE_KEY      — base64url PKCS8 P-256 private key
 *   VAPID_SUBJECT          — mailto: or https: URI
 */

import { createClient }             from 'https://esm.sh/@supabase/supabase-js@2'
import { sendWebPush, type PushTarget, type VapidConfig } from '../_shared/webpush.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'alerts@3ampipeline.org'

const VAPID: VapidConfig = {
  publicKey:  Deno.env.get('VAPID_PUBLIC_KEY')  ?? '',
  privateKey: Deno.env.get('VAPID_PRIVATE_KEY') ?? '',
  subject:    Deno.env.get('VAPID_SUBJECT')     ?? '',
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AlertConfig {
  enabled:    boolean
  channels:   { inApp: boolean; email: boolean; push: boolean }
  issues:     string[]
  keywords:   string[]
  movement:   { anyBill: boolean; watching: boolean; alerting: boolean }
  actNow:     { urgent: boolean; movingSoon: boolean }
}

interface Bill {
  id:       number
  name:     string
  stage:    number
  urgency:  string
  issues:   string[]
  bill_desc: string
}

interface UserRow {
  id:       string
  email:    string | null
  settings: AlertConfig
}

// ── Email ─────────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) { console.warn('[notify] RESEND_API_KEY not set — skipping email'); return }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  })
  if (!res.ok) {
    console.error('[notify] Resend error:', res.status, await res.text().catch(() => ''))
  }
}

function buildEmailHtml(bills: Bill[], reasons: Map<number, string[]>): string {
  const rows = bills.map(b => {
    const why = (reasons.get(b.id) ?? []).join(', ')
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2840">${b.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2840;color:#9090b0">${why}</td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html><html><body style="background:#1a1830;color:#e0e0f0;font-family:sans-serif;margin:0;padding:24px">
<div style="max-width:560px;margin:0 auto">
  <h1 style="font-size:20px;color:#b090e0;margin:0 0 4px">3AM Pipeline</h1>
  <p style="color:#9090b0;font-size:13px;margin:0 0 20px">Your legislative update</p>
  <table style="width:100%;border-collapse:collapse;background:#242240;border-radius:10px;overflow:hidden">
    <thead>
      <tr style="background:#2e2a50">
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#9090b0;font-weight:600">Bill</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#9090b0;font-weight:600">Why you're seeing this</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="color:#9090b0;font-size:11px;margin-top:20px">
    Manage your alert settings at <a href="https://3ampipeline.org/alerts/settings" style="color:#b090e0">3ampipeline.org</a>
  </p>
</div></body></html>`
}

// ── Per-user matching ─────────────────────────────────────────────────────────

function matchBills(
  updatedBills: Bill[],
  watchedIds:   Set<number>,
  alertedIds:   Set<number>,
  cfg:          AlertConfig,
): { matched: Bill[]; reasons: Map<number, string[]> } {
  const reasons = new Map<number, string[]>()

  for (const bill of updatedBills) {
    const why: string[] = []

    if (cfg.movement.alerting && alertedIds.has(bill.id))   why.push('You have alerts on')
    if (cfg.movement.watching && watchedIds.has(bill.id))   why.push('You\'re watching')
    if (cfg.movement.anyBill)                               why.push('Bill activity')
    if (cfg.actNow.urgent     && bill.urgency === 'urgent') why.push('Time-sensitive')
    if (cfg.actNow.movingSoon && bill.urgency === 'months') why.push('Moving soon')

    if (cfg.keywords.length > 0) {
      const haystack = `${bill.name} ${bill.bill_desc}`.toLowerCase()
      for (const kw of cfg.keywords) {
        if (haystack.includes(kw.toLowerCase())) { why.push(`Keyword: ${kw}`); break }
      }
    }

    if (cfg.issues.length > 0 && bill.issues.some(i => cfg.issues.includes(i))) {
      why.push('Matching topic')
    }

    if (why.length > 0) reasons.set(bill.id, why)
  }

  return {
    matched: updatedBills.filter(b => reasons.has(b.id)),
    reasons,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  const since = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()

  // Fetch bills updated in the last 25 hours
  const { data: updatedBills, error: billsErr } = await supabase
    .from('bills')
    .select('id, name, stage, urgency, issues, bill_desc')
    .gt('updated_at', since)

  if (billsErr) {
    console.error('[notify] bills fetch error:', billsErr.message)
    return new Response(JSON.stringify({ ok: false, error: billsErr.message }), { status: 500 })
  }

  if (!updatedBills || updatedBills.length === 0) {
    console.log('[notify] No bills updated in last 25h — skipping')
    return new Response(JSON.stringify({ ok: true, notified: 0 }))
  }

  console.log(`[notify] ${updatedBills.length} updated bills`)

  // Fetch users with alert settings enabled
  const { data: userSettings, error: usersErr } = await supabase
    .from('user_alert_settings')
    .select('user_id, settings')
    .eq('settings->>enabled', 'true')

  if (usersErr || !userSettings || userSettings.length === 0) {
    console.log('[notify] No users with enabled alert settings')
    return new Response(JSON.stringify({ ok: true, notified: 0 }))
  }

  const userIds = userSettings.map((u: { user_id: string }) => u.user_id)

  // Fetch accounts (email) for those users
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, email')
    .in('id', userIds)

  const emailMap = new Map<string, string | null>(
    (accounts ?? []).map((a: { id: string; email: string | null }) => [a.id, a.email])
  )

  // Fetch bill statuses for all relevant users
  const { data: statuses } = await supabase
    .from('bill_user_status')
    .select('user_id, bill_id, status')
    .in('user_id', userIds)
    .in('status', ['alert', 'watch'])

  const statusByUser = new Map<string, { watched: Set<number>; alerted: Set<number> }>()
  for (const s of (statuses ?? [])) {
    if (!statusByUser.has(s.user_id)) {
      statusByUser.set(s.user_id, { watched: new Set(), alerted: new Set() })
    }
    const entry = statusByUser.get(s.user_id)!
    if (s.status === 'watch') entry.watched.add(s.bill_id)
    if (s.status === 'alert') entry.alerted.add(s.bill_id)
  }

  // Fetch push subscriptions for all relevant users
  const { data: pushSubs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth_key')
    .in('user_id', userIds)

  const pushByUser = new Map<string, PushTarget[]>()
  for (const s of (pushSubs ?? [])) {
    if (!pushByUser.has(s.user_id)) pushByUser.set(s.user_id, [])
    pushByUser.get(s.user_id)!.push({ endpoint: s.endpoint, p256dh: s.p256dh, auth_key: s.auth_key })
  }

  let notified = 0

  for (const row of userSettings) {
    const userId = row.user_id
    const cfg: AlertConfig = row.settings
    if (!cfg.enabled) continue

    const userStatuses = statusByUser.get(userId) ?? { watched: new Set<number>(), alerted: new Set<number>() }

    const { matched, reasons } = matchBills(
      updatedBills as Bill[],
      userStatuses.watched,
      userStatuses.alerted,
      cfg,
    )

    if (matched.length === 0) continue

    const title = matched.length === 1
      ? `Update: ${matched[0].name}`
      : `${matched.length} bills need your attention`
    const body = matched.slice(0, 3).map(b => b.name).join(', ') +
      (matched.length > 3 ? ` +${matched.length - 3} more` : '')

    // In-app notification
    if (cfg.channels.inApp) {
      await supabase.from('user_notifications').insert({
        user_id:  userId,
        bill_id:  matched.length === 1 ? matched[0].id : null,
        type:     'bill_movement',
        title,
        body,
      })
    }

    // Email
    if (cfg.channels.email) {
      const email = emailMap.get(userId)
      if (email) {
        const html = buildEmailHtml(matched, reasons)
        await sendEmail(email, `W4SP Alert: ${title}`, html).catch(e =>
          console.error('[notify] email error:', e)
        )
      }
    }

    // Web Push
    if (cfg.channels.push && VAPID.privateKey) {
      const subs = pushByUser.get(userId) ?? []
      const pushPayload = JSON.stringify({ title, body, url: '/?tab=alerts' })
      for (const sub of subs) {
        await sendWebPush(sub, pushPayload, VAPID).catch(async (e: Error) => {
          console.error('[notify] push error:', e.message)
          // Remove expired/invalid subscriptions (410 = gone)
          if (e.message.startsWith('Push 410') || e.message.startsWith('Push 404')) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          }
        })
      }
    }

    notified++
  }

  console.log(`[notify] Notified ${notified} users`)
  return new Response(JSON.stringify({ ok: true, notified, bills: updatedBills.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
