/**
 * auth-reset-request — sends a password reset email.
 *
 * POST { email: string }
 * Always returns { ok: true } — never reveals whether the email exists.
 *
 * Required Supabase secrets:
 *   RESEND_API_KEY  — API key from resend.com
 *   FROM_EMAIL      — verified sender address, e.g. "noreply@yourdomain.com"
 *   ALLOWED_ORIGIN  — the app's public URL, used to build the reset link
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const RESEND_FROM    = Deno.env.get('FROM_EMAIL')     ?? ''
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? ''

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const body = await req.json().catch(() => null)
  if (!body?.email || typeof body.email !== 'string') {
    return json({ ok: false, error: 'email is required' }, 400)
  }

  const email   = body.email.trim().toLowerCase()
  const success = json({ ok: true })

  const { data: account, error: dbSelectError } = await supabase
    .from('accounts')
    .select('id, username')
    .eq('email', email)
    .maybeSingle()

  if (dbSelectError) {
    console.error('DB select error:', dbSelectError.message)
    return success
  }

  if (!account) return success

  const token   = generateToken()
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const { error: dbUpdateError } = await supabase
    .from('accounts')
    .update({ reset_token: token, reset_token_expires_at: expires })
    .eq('id', account.id)

  if (dbUpdateError) {
    console.error('DB update error:', dbUpdateError.message)
    return success
  }

  const resetLink = `${ALLOWED_ORIGIN}/reset-password?token=${token}`

  const resendRes = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    `Women for Shared Progress <${RESEND_FROM}>`,
      to:      email,
      subject: 'Reset your LawTracker password',
      html: `
        <p>Hi ${account.username},</p>
        <p>We received a request to reset your LawTracker password.
           Click the link below to set a new one. The link expires in 1 hour.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this, you can safely ignore this email.
           Your password will not change.</p>
        <p style="color:#888;font-size:12px;">— Women for Shared Progress</p>
      `,
    }),
  })

  if (!resendRes.ok) {
    const resendBody = await resendRes.text().catch(() => '')
    console.error('Resend error:', resendRes.status, resendBody)
  }

  return success
})
