/**
 * Seed Michigan US Senators and House Representatives from Congress.gov API.
 *
 * Usage (run AFTER applying migration 006_representatives.sql):
 *   node --env-file=.env scripts/seed-representatives.mjs
 *
 * Required env vars (.env):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SECRET_KEY
 *   CONGRESS_API_KEY   (or pass inline — see below)
 */

import { createClient } from '@supabase/supabase-js'

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY
  ?? 'zgrlQoCf0aPcX10dhpjtRLipMpAiBI2xmU8GvbzL'

const CONGRESS_API_BASE = 'https://api.congress.gov/v3'
const STATE_CODE = 'MI'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
)

// Fetch all current Michigan members, paging through results if needed.
async function fetchAllMembers() {
  const members = []
  let offset = 0
  const limit = 250

  while (true) {
    const url =
      `${CONGRESS_API_BASE}/member` +
      `?stateCode=${STATE_CODE}` +
      `&currentMember=true` +
      `&limit=${limit}` +
      `&offset=${offset}` +
      `&api_key=${CONGRESS_API_KEY}`

    console.log(`Fetching offset=${offset}…`)
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Congress.gov API error: ${res.status} ${res.statusText}`)
    }

    const json = await res.json()
    const page = json.members ?? []
    members.push(...page)

    const total = json.pagination?.count ?? page.length
    offset += page.length

    if (offset >= total || page.length === 0) break
  }

  return members
}

// Map Congress.gov party names to our stored values.
function normalizeParty(raw) {
  if (!raw) return 'Unknown'
  const r = raw.toLowerCase()
  if (r.includes('democrat')) return 'Democrat'
  if (r.includes('republican')) return 'Republican'
  if (r.includes('independent')) return 'Independent'
  return raw
}

// Determine chamber from the member's terms array.
// Congress.gov returns terms sorted newest-first on currentMember requests.
function getChamber(member) {
  const terms = member.terms?.item ?? []
  const latest = terms[0]
  if (!latest) return null
  const ct = latest.chamber?.toLowerCase() ?? ''
  if (ct.includes('senate')) return 'Senate'
  if (ct.includes('house')) return 'House'
  return null
}

// Extract House district — only present for House members.
function getDistrict(member) {
  const terms = member.terms?.item ?? []
  const latest = terms[0]
  const d = latest?.district ?? member.district
  if (d == null) return null
  return String(d)
}

async function main() {
  console.log(`\nFetching current Michigan members from Congress.gov…\n`)

  const raw = await fetchAllMembers()
  console.log(`Total members returned: ${raw.length}`)

  const rows = []

  for (const m of raw) {
    const chamber = getChamber(m)

    // Only seed Senators and House members — skip delegates etc.
    if (chamber !== 'Senate' && chamber !== 'House') {
      console.warn(`  Skipping ${m.name} — unknown chamber`)
      continue
    }

    const row = {
      bioguide_id: m.bioguideId,
      name:        m.name,
      party:       normalizeParty(m.partyName),
      state:       STATE_CODE,
      district:    chamber === 'House' ? getDistrict(m) : null,
      chamber,
      url:         m.url ?? null,
      photo_url:   m.depiction?.imageUrl ?? null,
      source:      'congress.gov',
      verified:    false,
      updated_at:  new Date().toISOString(),
    }

    rows.push(row)
    console.log(`  ${chamber.padEnd(6)} ${row.district ? `D${row.district.padStart(2, '0')} ` : '     '} ${row.name} (${row.party})`)
  }

  if (rows.length === 0) {
    console.error('\nNo rows to insert — check API response above.')
    process.exit(1)
  }

  console.log(`\nUpserting ${rows.length} rows into representatives…`)

  const { error } = await supabase
    .from('representatives')
    .upsert(rows, { onConflict: 'bioguide_id' })

  if (error) {
    console.error('\nSupabase upsert error:', error.message)
    process.exit(1)
  }

  console.log(`\nDone. ${rows.length} representatives seeded successfully.\n`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
