/**
 * auth-reset-confirm — validates a reset token and sets a new password.
 *
 * POST { token: string, password: string }
 * Success: { ok: true }
 * Failure: { ok: false, error: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, hashCredential } from '../_shared/auth-utils.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const body = await req.json().catch(() => null)
  if (!body?.token || !body?.password) {
    return json({ ok: false, error: 'token and password are required' }, 400)
  }

  if (typeof body.password !== 'string' || body.password.length < 8) {
    return json({ ok: false, error: 'Password must be at least 8 characters' }, 400)
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('id, reset_token_expires_at')
    .eq('reset_token', body.token)
    .maybeSingle()

  if (!account) {
    return json({ ok: false, error: 'Invalid or expired reset link.' }, 400)
  }

  if (!account.reset_token_expires_at || new Date(account.reset_token_expires_at) <= new Date()) {
    return json({ ok: false, error: 'This reset link has expired. Please request a new one.' }, 400)
  }

  const password_hash = await hashCredential(body.password)

  await supabase
    .from('accounts')
    .update({
      password_hash,
      reset_token:              null,
      reset_token_expires_at:   null,
      failed_passcode_attempts: 0,
      passcode_locked:          false,
    })
    .eq('id', account.id)

  return json({ ok: true })
})
