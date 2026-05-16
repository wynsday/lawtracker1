import { useEffect, useState } from 'react'
import PageTopBar from '../components/PageTopBar'
import FeedbackButton from '../components/FeedbackButton'
import { supabase } from '../lib/supabase'
import { FEDERAL_STAGES, MICHIGAN_STAGES, LOCAL_STAGES, ISSUE_LABELS } from '../lib/constants'

interface BillUpdate {
  id: number
  name: string
  level: 'federal' | 'michigan' | 'local'
  state: string
  stage: number
  stage_note: string
  bill_desc: string
  urgency: string
  issues: string[]
  updated_at: string
}

const LEVEL_BG: Record<string, string> = {
  federal:  '#0c1844',
  michigan: '#003f8a',
  local:    '#1a4020',
}
const LEVEL_FG: Record<string, string> = {
  federal:  '#b5d4f4',
  michigan: '#d4eaff',
  local:    '#a0d8b0',
}
const LEVEL_LABEL: Record<string, string> = {
  federal:  'Federal',
  michigan: 'Michigan',
  local:    'Local',
}

const URGENCY_LABEL: Record<string, { text: string; color: string }> = {
  urgent:  { text: 'Time-sensitive',   color: '#C00000' },
  months:  { text: 'Moving soon',      color: '#E97132' },
  year:    { text: 'Longer timeline',  color: '#8880b4' },
  stalled: { text: 'Stalled',          color: '#555' },
}

function stageName(level: string, stage: number): string {
  const stages =
    level === 'federal'  ? FEDERAL_STAGES  :
    level === 'michigan' ? MICHIGAN_STAGES :
    LOCAL_STAGES
  if (stage >= stages.length) return 'Enacted'
  return stages[stage] ?? 'Unknown'
}

const CUTOFF_DAYS = 30

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

function fmtDayHeading(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (dayKey(d.toISOString()) === dayKey(today.toISOString()))    return 'Today'
  if (dayKey(d.toISOString()) === dayKey(yesterday.toISOString())) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${time}`
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

function reduceDash(text: string): string {
  return text.replace(/ — /g, ': ')
}

// Split "HB 1234 — Some Title" → { num: "HB 1234", title: "Some Title" }
function parseName(name: string): { num: string; title: string } {
  const dashIdx = name.indexOf('—')
  if (dashIdx > -1) {
    return { num: name.slice(0, dashIdx).trim(), title: reduceDash(name.slice(dashIdx + 1).trim()) }
  }
  const m = name.match(/^([A-Z.]+\s*\d+)\s+(.+)$/i)
  if (m) return { num: m[1], title: reduceDash(m[2]) }
  return { num: '', title: reduceDash(name) }
}

export default function Changelog() {
  const [updates, setUpdates]   = useState<BillUpdate[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const theme = localStorage.getItem('wsp-theme') ?? 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-page', 'content')
    return () => {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.removeAttribute('data-page')
    }
  }, [])

  useEffect(() => {
    const cutoff = new Date(Date.now() - CUTOFF_DAYS * 24 * 60 * 60 * 1000).toISOString()
    supabase
      .from('bills')
      .select('id, name, level, state, stage, stage_note, bill_desc, urgency, issues, updated_at')
      .gte('updated_at', cutoff)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setUpdates(data as BillUpdate[])
        setLoading(false)
      })
  }, [])

  // Group into day buckets, ordered most-recent first
  const grouped: { key: string; label: string; bills: BillUpdate[] }[] = []
  const seen = new Map<string, number>()
  for (const b of updates) {
    const key = dayKey(b.updated_at)
    if (seen.has(key)) {
      grouped[seen.get(key)!].bills.push(b)
    } else {
      seen.set(key, grouped.length)
      grouped.push({ key, label: fmtDayHeading(b.updated_at), bills: [b] })
    }
  }

  const totalUpdates = updates.length

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg-secondary)',
      padding: '50px 28px 90px',
      color: 'var(--color-text-primary)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <PageTopBar />

      <div style={{ maxWidth: 600 }}>
        <h1 style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 28, fontWeight: 700,
          margin: '0 0 4px', color: 'var(--page-title)',
        }}>
          Change Log
        </h1>
        <p style={{ fontSize: 14, color: 'var(--page-subtitle)', margin: '0 0 6px', lineHeight: 1.6 }}>
          Live bill updates · entries fall off after {CUTOFF_DAYS} days
        </p>
        {!loading && (
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '0 0 28px' }}>
            {totalUpdates} update{totalUpdates !== 1 ? 's' : ''} in the last {CUTOFF_DAYS} days
          </p>
        )}

        {loading && (
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginTop: 40 }}>Loading…</p>
        )}

        {!loading && grouped.length === 0 && (
          <div style={{
            background: 'var(--color-card, #2a2840)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 12,
            padding: '28px 24px',
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            fontSize: 14,
          }}>
            No bill updates in the last {CUTOFF_DAYS} days.
          </div>
        )}

        {grouped.map((group, gi) => (
          <div key={group.key} style={{ marginBottom: gi < grouped.length - 1 ? 32 : 0 }}>

            {/* ── Day header ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: 13, fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                whiteSpace: 'nowrap',
              }}>{group.label}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border-light)' }} />
              <span style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 11,
                color: 'var(--color-text-tertiary)',
                whiteSpace: 'nowrap',
              }}>
                {group.bills.length} bill{group.bills.length !== 1 ? 's' : ''}
                {daysAgo(group.bills[0].updated_at) > 0 && (
                  <> · {daysAgo(group.bills[0].updated_at)}d ago</>
                )}
              </span>
            </div>

            {/* ── Bill cards for this day ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.bills.map(b => {
                const { num, title } = parseName(b.name)
                const bg = LEVEL_BG[b.level] ?? '#333'
                const fg = LEVEL_FG[b.level] ?? '#eee'
                const currentStage = stageName(b.level, b.stage)
                const urgency = URGENCY_LABEL[b.urgency]
                const issueList = (b.issues ?? []).slice(0, 3)
                return (
                  <div key={b.id} style={{
                    background: 'var(--color-card, #2a2840)',
                    border: '1px solid var(--color-border-light)',
                    borderLeft: `4px solid ${bg}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}>

                    {/* Row 1: level badge + bill number + datetime */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{
                        background: bg, color: fg,
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: 9, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '.07em',
                        padding: '2px 6px', borderRadius: 5,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>{LEVEL_LABEL[b.level]}</span>
                      {num && (
                        <span style={{
                          fontFamily: "'Quicksand', sans-serif",
                          fontSize: 11, fontWeight: 700,
                          color: 'var(--color-text-tertiary)',
                        }}>{num}</span>
                      )}
                      <span style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 11,
                        color: 'var(--color-text-tertiary)',
                        marginLeft: 'auto',
                        whiteSpace: 'nowrap',
                      }}>{fmtDateTime(b.updated_at)}</span>
                    </div>

                    {/* Row 1b: What changed */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: 10, fontWeight: 700,
                        color: fg,
                        background: bg,
                        padding: '2px 7px', borderRadius: 5,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>→ {currentStage}</span>
                      {b.stage_note && (
                        <span style={{
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 11,
                          color: 'var(--color-text-tertiary)',
                          fontStyle: 'italic',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>{b.stage_note}</span>
                      )}
                    </div>

                    {/* Row 2: Bill title */}
                    <div style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 14, fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.4,
                    }}>{title || b.name}</div>

                    {/* Row 3: Urgency */}
                    {urgency && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 11, fontWeight: 600,
                          color: urgency.color,
                        }}>{urgency.text}</span>
                      </div>
                    )}

                    {/* Row 4: Description */}
                    {b.bill_desc && (
                      <div style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 13,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.55,
                        borderTop: '1px solid var(--color-border-light)',
                        paddingTop: 8,
                      }}>{b.bill_desc}</div>
                    )}

                    {/* Row 5: Issue tags */}
                    {issueList.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {issueList.map(issue => (
                          <span key={issue} style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 10, fontWeight: 600,
                            color: 'var(--color-text-tertiary)',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border-light)',
                            borderRadius: 5,
                            padding: '2px 6px',
                            whiteSpace: 'nowrap',
                          }}>{ISSUE_LABELS[issue] ?? issue}</span>
                        ))}
                      </div>
                    )}

                  </div>
                )
              })}
            </div>

          </div>
        ))}
      </div>

      <FeedbackButton />
    </div>
  )
}
