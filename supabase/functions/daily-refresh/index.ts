/**
 * Daily Refresh Edge Function
 * Runs at 3 AM US Eastern (8:00 UTC EST / 7:00 UTC EDT).
 *
 * 1. Bills refresh — touches updated_at for all MI/US bills (stub; replace with LegiScan/Congress.gov later).
 * 2. Representatives refresh — fetches all current members from Congress.gov,
 *    then upserts into the representatives table. State filtering is done in code
 *    (the API's stateCode param is unreliable).
 *
 * Secrets (set via `supabase secrets set KEY=value`):
 *   CONGRESS_API_KEY   — Congress.gov API key
 *   SUPABASE_URL       — injected automatically
 *   SUPABASE_SECRET_KEY — service-role key (set manually if not present as SUPABASE_SERVICE_ROLE_KEY)
 *
 * Deploy:  supabase functions deploy daily-refresh
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl   = Deno.env.get('SUPABASE_URL')!
const secretKey     = Deno.env.get('SUPABASE_SECRET_KEY')
  ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CONGRESS_API_KEY  = Deno.env.get('CONGRESS_API_KEY')!
const CONGRESS_API_BASE = 'https://api.congress.gov/v3'

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeParty(raw: string | null | undefined): string {
  if (!raw) return 'Unknown'
  const r = raw.toLowerCase()
  if (r.includes('democrat'))    return 'Democrat'
  if (r.includes('republican'))  return 'Republican'
  if (r.includes('independent')) return 'Independent'
  return raw
}

interface CongressMember {
  bioguideId: string
  name: string
  partyName?: string
  state?: string
  district?: number
  url?: string
  depiction?: { imageUrl?: string }
  terms?: { item?: Array<{ chamber?: string; district?: number; stateCode?: string }> }
}

function getChamber(member: CongressMember): 'Senate' | 'House' | null {
  const terms = member.terms?.item ?? []
  const latest = terms[0]
  if (!latest) return null
  const ct = (latest.chamber ?? '').toLowerCase()
  if (ct.includes('senate')) return 'Senate'
  if (ct.includes('house'))  return 'House'
  return null
}

function getDistrict(member: CongressMember): string | null {
  const terms = member.terms?.item ?? []
  const latest = terms[0]
  const d = latest?.district ?? member.district
  if (d == null) return null
  return String(d)
}

function getState(member: CongressMember): string | null {
  const terms = member.terms?.item ?? []
  const latest = terms[0]
  // stateCode on the term is most reliable
  if (latest?.stateCode) return latest.stateCode.toUpperCase()
  if (member.state)       return member.state.toUpperCase()
  return null
}

async function fetchAllMembers(): Promise<CongressMember[]> {
  const members: CongressMember[] = []
  let offset = 0
  const limit = 250

  while (true) {
    const url =
      `${CONGRESS_API_BASE}/member` +
      `?currentMember=true` +
      `&limit=${limit}` +
      `&offset=${offset}` +
      `&api_key=${CONGRESS_API_KEY}`

    console.log(`[representatives] Fetching offset=${offset}…`)
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Congress.gov API error: ${res.status} ${res.statusText}`)
    }

    const json = await res.json()
    const page: CongressMember[] = json.members ?? []
    members.push(...page)

    const total: number = json.pagination?.count ?? page.length
    offset += page.length
    if (offset >= total || page.length === 0) break
  }

  return members
}

// ── Representatives refresh ───────────────────────────────────────────────────

async function refreshRepresentatives(
  supabase: ReturnType<typeof createClient>,
): Promise<{ upserted: number; error?: string }> {
  if (!CONGRESS_API_KEY) {
    console.warn('[representatives] CONGRESS_API_KEY not set — skipping.')
    return { upserted: 0, error: 'CONGRESS_API_KEY not configured' }
  }

  let raw: CongressMember[]
  try {
    raw = await fetchAllMembers()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[representatives] Fetch failed:', msg)
    return { upserted: 0, error: msg }
  }

  console.log(`[representatives] Fetched ${raw.length} members total`)

  const rows = []
  for (const m of raw) {
    const chamber = getChamber(m)
    if (chamber !== 'Senate' && chamber !== 'House') continue

    const state = getState(m)
    if (!state) continue

    rows.push({
      bioguide_id: m.bioguideId,
      name:        m.name,
      party:       normalizeParty(m.partyName),
      state,
      district:    chamber === 'House' ? getDistrict(m) : null,
      chamber,
      url:         m.url ?? null,
      photo_url:   m.depiction?.imageUrl ?? null,
      source:      'congress.gov',
      verified:    false,
      updated_at:  new Date().toISOString(),
    })
  }

  console.log(`[representatives] Upserting ${rows.length} rows…`)

  const { error } = await supabase
    .from('representatives')
    .upsert(rows, { onConflict: 'bioguide_id' })

  if (error) {
    console.error('[representatives] Upsert error:', error.message)
    return { upserted: 0, error: error.message }
  }

  console.log(`[representatives] Done — ${rows.length} rows upserted`)
  return { upserted: rows.length }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  const supabase = createClient(supabaseUrl, secretKey)
  const ts = new Date().toISOString()

  // 1. Bills stub refresh
  const { error: billsError } = await supabase
    .from('bills')
    .update({ updated_at: ts })
    .in('state', ['MI', 'US'])

  if (billsError) {
    console.error('[bills] Refresh error:', billsError.message)
  } else {
    console.log(`[bills] Touched updated_at at ${ts}`)
  }

  // 2. Representatives refresh
  const repResult = await refreshRepresentatives(supabase)

  const ok = !billsError && !repResult.error
  return new Response(
    JSON.stringify({
      ok,
      refreshed_at: ts,
      bills:   billsError ? { error: billsError.message } : { ok: true },
      representatives: repResult,
    }),
    {
      status: ok ? 200 : 207,
      headers: { 'Content-Type': 'application/json' },
    },
  )
})
