import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { getOfficialsByState } from '../lib/officials'

// ─── Icon components ───────────────────────────────────────────────────────
type IP = { size?: number; color?: string }

function LockIcon({ size = 28, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function ChangeLogIcon({ size = 48, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15.5 14.5"/>
      <path d="M21.5 4.5 19 7l-2.5-2.5"/>
      <path d="M19 7A10 10 0 1 0 21 12"/>
    </svg>
  )
}

function AlertSettingsIcon({ size = 48, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="20" y2="12"/>
      <line x1="12" y1="18" x2="20" y2="18"/>
      <circle cx="2" cy="6" r="2" fill={color} stroke="none"/>
      <circle cx="6" cy="12" r="2" fill={color} stroke="none"/>
      <circle cx="10" cy="18" r="2" fill={color} stroke="none"/>
    </svg>
  )
}

function ProfileCardIcon({ size = 48, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function BellIcon({ size = 20, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function WatchIcon({ size = 20, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function ArchiveIcon({ size = 20, color = '#5a3a00' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  )
}

function CivicIcon({ size = 20, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="22" x2="21" y2="22"/>
      <line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/>
      <line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/>
      <polygon points="12 2 20 7 4 7"/>
    </svg>
  )
}

function CandidatesIcon({ size = 20, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="7" r="4"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <polyline points="16 11 17.5 13 21 10"/>
    </svg>
  )
}

function PolicyIcon({ size = 20, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  )
}

function AboutIcon({ size = 20, color = '#2D1B4E' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function SettingsIcon({ size = 20, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function SignInIcon({ size = 20, color = '#5a3a00' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  )
}

function SignOutIcon({ size = 20, color = 'white' }: IP) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function MarchingBugsIcon() {
  return (
    <svg width="80" height="34" viewBox="0 0 76 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="mb-b1" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ff9a9a"/><stop offset="100%" stopColor="#cc0000"/>
        </radialGradient>
        <radialGradient id="mb-b2" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#74d4fc"/><stop offset="100%" stopColor="#0070c0"/>
        </radialGradient>
        <radialGradient id="mb-b3" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE566"/><stop offset="100%" stopColor="#FFC000"/>
        </radialGradient>
      </defs>

      {/* ── Bug 1 (lead, red ladybug) — carries flag ── */}
      <line x1="16" y1="13" x2="16" y2="1" stroke="#5a3a00" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="16" y="1" width="11" height="7" rx="1" fill="#B597D5"/>
      {/* 5-pointed pinwheel star — bigger */}
      <polygon points="21.5,2 22.09,3.69 23.88,3.73 22.45,4.81 22.97,6.52 21.5,5.5 20.03,6.52 20.55,4.81 19.12,3.73 20.91,3.69" fill="#FFC000"/>
      {/* body */}
      <ellipse cx="10" cy="24" rx="6.5" ry="4.5" fill="url(#mb-b1)"/>
      <line x1="10" y1="19.5" x2="10" y2="28.5" stroke="#880000" strokeWidth="0.8"/>
      <circle cx="7.8" cy="22.5" r="1.2" fill="#880000"/>
      <circle cx="12.2" cy="22.5" r="1.2" fill="#880000"/>
      <circle cx="8.5" cy="25.5" r="1" fill="#880000"/>
      <circle cx="11.5" cy="25.5" r="1" fill="#880000"/>
      {/* head */}
      <circle cx="10" cy="17" r="3.5" fill="#1a1a1a"/>
      <circle cx="8.7" cy="16.2" r="1" fill="white"/>
      <circle cx="11.3" cy="16.2" r="1" fill="white"/>
      <circle cx="8.9" cy="16.4" r="0.5" fill="#333"/>
      <circle cx="11.5" cy="16.4" r="0.5" fill="#333"/>
      <path d="M 8.7 18.4 Q 10 19.8 11.3 18.4" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <line x1="8.7" y1="13.8" x2="6.5" y2="11" stroke="#333" strokeWidth="0.9" strokeLinecap="round"/>
      <line x1="11.3" y1="13.8" x2="13.5" y2="11" stroke="#333" strokeWidth="0.9" strokeLinecap="round"/>
      <circle cx="6.2" cy="10.7" r="0.8" fill="#333"/>
      <circle cx="13.8" cy="10.7" r="0.8" fill="#333"/>
      <line x1="4.5" y1="22" x2="1.5" y2="20" stroke="#555" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="4.5" y1="24" x2="1.5" y2="24" stroke="#555" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="4.5" y1="26" x2="1.5" y2="28" stroke="#555" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="15.5" y1="22" x2="18.5" y2="20" stroke="#555" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="15.5" y1="24" x2="18.5" y2="24" stroke="#555" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="15.5" y1="26" x2="18.5" y2="28" stroke="#555" strokeWidth="0.7" strokeLinecap="round"/>

      {/* ── Bug 2 (blue body, orange head) ── */}
      <ellipse cx="37" cy="24" rx="6.5" ry="4.5" fill="url(#mb-b2)"/>
      <line x1="37" y1="19.5" x2="37" y2="28.5" stroke="#004a96" strokeWidth="0.8"/>
      <circle cx="34.8" cy="22.5" r="1.2" fill="#004a96"/>
      <circle cx="39.2" cy="22.5" r="1.2" fill="#004a96"/>
      <circle cx="35.5" cy="25.5" r="1" fill="#004a96"/>
      <circle cx="38.5" cy="25.5" r="1" fill="#004a96"/>
      <circle cx="37" cy="17" r="3.5" fill="#E97132"/>
      <circle cx="35.7" cy="16.2" r="1" fill="white"/>
      <circle cx="38.3" cy="16.2" r="1" fill="white"/>
      <circle cx="35.9" cy="16.4" r="0.5" fill="#333"/>
      <circle cx="38.5" cy="16.4" r="0.5" fill="#333"/>
      <path d="M 35.7 18.4 Q 37 19.8 38.3 18.4" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <line x1="35.7" y1="13.8" x2="33.5" y2="11" stroke="#E97132" strokeWidth="0.9" strokeLinecap="round"/>
      <line x1="38.3" y1="13.8" x2="40.5" y2="11" stroke="#E97132" strokeWidth="0.9" strokeLinecap="round"/>
      <circle cx="33.2" cy="10.7" r="0.8" fill="#E97132"/>
      <circle cx="40.8" cy="10.7" r="0.8" fill="#E97132"/>
      <line x1="31.5" y1="22" x2="28.5" y2="20" stroke="#0070c0" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="31.5" y1="24" x2="28.5" y2="24" stroke="#0070c0" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="31.5" y1="26" x2="28.5" y2="28" stroke="#0070c0" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="42.5" y1="22" x2="45.5" y2="20" stroke="#0070c0" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="42.5" y1="24" x2="45.5" y2="24" stroke="#0070c0" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="42.5" y1="26" x2="45.5" y2="28" stroke="#0070c0" strokeWidth="0.7" strokeLinecap="round"/>

      {/* ── Bug 3 (yellow body, black head + legs) ── */}
      <ellipse cx="63" cy="24" rx="6.5" ry="4.5" fill="url(#mb-b3)"/>
      <line x1="63" y1="19.5" x2="63" y2="28.5" stroke="#CC9600" strokeWidth="0.8"/>
      <circle cx="60.8" cy="22.5" r="1.2" fill="#CC9600"/>
      <circle cx="65.2" cy="22.5" r="1.2" fill="#CC9600"/>
      <circle cx="61.5" cy="25.5" r="1" fill="#CC9600"/>
      <circle cx="64.5" cy="25.5" r="1" fill="#CC9600"/>
      <circle cx="63" cy="17" r="3.5" fill="#1a1a1a"/>
      <circle cx="61.7" cy="16.2" r="1" fill="white"/>
      <circle cx="64.3" cy="16.2" r="1" fill="white"/>
      <circle cx="61.9" cy="16.4" r="0.5" fill="#333"/>
      <circle cx="64.5" cy="16.4" r="0.5" fill="#333"/>
      <path d="M 61.7 18.4 Q 63 19.8 64.3 18.4" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      <line x1="61.7" y1="13.8" x2="59.5" y2="11" stroke="#CC9600" strokeWidth="0.9" strokeLinecap="round"/>
      <line x1="64.3" y1="13.8" x2="66.5" y2="11" stroke="#CC9600" strokeWidth="0.9" strokeLinecap="round"/>
      <circle cx="59.2" cy="10.7" r="0.8" fill="#CC9600"/>
      <circle cx="66.8" cy="10.7" r="0.8" fill="#CC9600"/>
      <line x1="57.5" y1="22" x2="54.5" y2="20" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="57.5" y1="24" x2="54.5" y2="24" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="57.5" y1="26" x2="54.5" y2="28" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="68.5" y1="22" x2="71.5" y2="20" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="68.5" y1="24" x2="71.5" y2="24" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="68.5" y1="26" x2="71.5" y2="28" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Data types & constants ────────────────────────────────────────────────

const PRESIDENT = {
  name:        'Donald J. Trump',
  dateElected: '2024-11-05',
  termEnds:    '2029-01-20',
  previousTerm: { start: '2017-01-20', end: '2021-01-20' },
}

const ELECTION_DATES = [
  { label: 'Voter Registration Deadline', date: '2026-10-19' },
  { label: 'Primary Election',            date: '2026-08-04' },
  { label: 'General Election',            date: '2026-11-03' },
]


function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function parseBrowser(ua: string): string {
  if (/Edg\/(\d+)/.test(ua))     return `Edge ${ua.match(/Edg\/(\d+)/)?.[1] ?? ''}`
  if (/Chrome\/(\d+)/.test(ua))  return `Chrome ${ua.match(/Chrome\/(\d+)/)?.[1] ?? ''}`
  if (/Firefox\/(\d+)/.test(ua)) return `Firefox ${ua.match(/Firefox\/(\d+)/)?.[1] ?? ''}`
  if (/Version\/(\d+).*Safari/i.test(ua)) return `Safari ${ua.match(/Version\/(\d+)/)?.[1] ?? ''}`
  return 'Unknown'
}

function parseOS(ua: string): string {
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11'
  if (ua.includes('Windows'))         return 'Windows'
  if (ua.includes('Mac OS X'))        return `macOS ${(ua.match(/Mac OS X ([\d_]+)/)?.[1] ?? '').replace(/_/g, '.')}`
  if (ua.includes('Android'))         return `Android ${ua.match(/Android ([\d.]+)/)?.[1] ?? ''}`
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Linux'))           return 'Linux'
  return 'Unknown'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, ready, signOut } = useAuth()
  const navigate                  = useNavigate()
  const [presidentMode, setPresidentMode] = useState<'president' | 'election'>(() =>
    localStorage.getItem('wsp-president-mode') === 'election' ? 'election' : 'president'
  )
  const [showFeedback, setShowFeedback]   = useState(false)
  const [feedbackText, setFeedbackText]   = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const sessionStartRef                   = useRef<number>(Date.now())

  const profileAddr = (() => {
    try {
      const r = localStorage.getItem('wsp-profile')
      return r ? JSON.parse(r) as {
        state?: string; city?: string; zip?: string
        congressional_district?: string
        state_senate_district?: string
        state_house_district?: string
      } : null
    } catch { return null }
  })()
  const hasProfileAddr = (profileAddr?.state ?? '').trim() !== ''

  useEffect(() => {
    const theme = localStorage.getItem('wsp-theme') ?? 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    return () => { document.documentElement.removeAttribute('data-theme') }
  }, [])

  useEffect(() => {
    localStorage.setItem('wsp-president-mode', presidentMode)
  }, [presidentMode])

  if (!ready) return null

  const isLoggedIn   = !!user
  const alertCount   = 0
  const watchCount   = 0
  const archiveCount = 0

  async function handleSignOut() { await signOut() }

  async function handleFeedbackSubmit() {
    if (!feedbackText.trim() || submitting) return
    setSubmitting(true)
    const ua = navigator.userAgent
    const payload = {
      timestamp:       new Date().toISOString(),
      app_version:     __APP_VERSION__,
      page_route:      window.location.pathname,
      account_tier:    user ? (user.tier ?? 0) : 0,
      user_role:       user ? user.role : 'none',
      theme:           document.documentElement.getAttribute('data-theme') ?? 'dark',
      browser:         parseBrowser(ua),
      os:              parseOS(ua),
      screen_size:     `${window.innerWidth}x${window.innerHeight}`,
      session_minutes: Math.round((Date.now() - sessionStartRef.current) / 60000),
      active_filters:  null as string | null,
      bills_shown:     null as number | null,
      feedback_text:   feedbackText.slice(0, 1000),
    }
    try {
      await fetch(`${import.meta.env.VITE_FUNCTIONS_BASE}/functions/v1/feedback-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      if (import.meta.env.DEV) {
        fetch('/api/feedback-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {})
      }
    } finally {
      setSubmitting(false)
      setShowFeedback(false)
      setFeedbackText('')
    }
  }

  function handleFeedbackCancel() {
    setShowFeedback(false)
    setFeedbackText('')
  }

  return (
    <div className="home-page">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="home-header-bar" aria-label="3AM Pipeline site header">
        <p className="home-header-org">Women for Shared Progress</p>
        <h1 className="home-header-title">3AM Pipeline</h1>
        <p className="home-header-tagline">Legislation Matters</p>
      </header>
      <div style={{ position: 'fixed', top: 8, right: 12, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="home-content">

        {/* ── Main row: 2×2 grid + stoplight column ───── */}
        <div className="home-main-row">
        <div className="home-main-grid">

          {/* Top-left: LawTracker — blue left / red right diagonal */}
          <button
            className="home-main-card"
            onClick={() => navigate('/tracker')}
            aria-label="LawTracker — browse active legislation"
          >
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, background: '#00B0F0',
              clipPath: 'polygon(0% 0%, 80% 0%, 20% 100%, 0% 100%)',
            }} />
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, background: '#C00000',
              clipPath: 'polygon(80% 0%, 100% 0%, 100% 100%, 20% 100%)',
            }} />
            <span className="home-card-label">LawTracker</span>
            <span className="home-card-desc">Browse active legislation</span>
          </button>

          {/* Top-right: Change Logs */}
          <button
            className="home-main-card"
            style={{ background: '#03B9D7' }}
            onClick={() => navigate('/changelog')}
            aria-label="Change Logs — bills updated in the last 24 hours"
          >
            <div className="home-card-icon-wrap"><ChangeLogIcon size={34} /></div>
            <span className="home-card-label">Change Logs</span>
            <span className="home-card-desc">Bills updated in last 24 hrs</span>
          </button>

          {/* Bottom-left: Alert Settings */}
          <button
            className="home-main-card"
            style={{ background: '#C00000' }}
            onClick={() => navigate(isLoggedIn ? '/alerts/settings' : '/login')}
            aria-label={isLoggedIn ? 'Alert Settings — configure your alerts' : 'Sign in to access Alert Settings'}
          >
            {!isLoggedIn && (
              <div className="home-lock-overlay" aria-hidden="true">
                <LockIcon size={34} />
                <span className="home-lock-label">Sign in</span>
              </div>
            )}
            <div className="home-card-icon-wrap"><AlertSettingsIcon size={34} /></div>
            <span className="home-card-label">Alert Settings</span>
            <span className="home-card-desc">Configure your alerts</span>
          </button>

          {/* Bottom-right: My Profile */}
          <button
            className="home-main-card"
            style={{ background: '#00B050' }}
            onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
            aria-label={isLoggedIn ? 'My Profile — your account and preferences' : 'Sign in to access My Profile'}
          >
            {!isLoggedIn && (
              <div className="home-lock-overlay" aria-hidden="true">
                <LockIcon size={34} />
                <span className="home-lock-label">Sign in</span>
              </div>
            )}
            <div className="home-card-icon-wrap"><ProfileCardIcon size={34} /></div>
            <span className="home-card-label">My Profile</span>
            <span className="home-card-desc">Your account &amp; preferences</span>
          </button>

        </div>{/* end main grid */}

        {/* Stoplight column — 3 pills stacked to the right */}
        <div className="home-stoplight-col">

          <button
            className="home-stoplight-pill"
            style={{ background: '#C00000' }}
            onClick={() => navigate(isLoggedIn ? '/alerts' : '/login')}
            aria-label={`My Alerts: ${alertCount} bills`}
          >
            <div className="home-stoplight-circle">
              <BellIcon size={20} color="white" />
            </div>
            <div className="home-stoplight-pill-text">
              <span className="home-stoplight-pill-label" style={{ color: 'white' }}>My Alerts</span>
              <span className="home-stoplight-pill-count" style={{ color: 'white' }}>{alertCount}</span>
            </div>
          </button>

          <button
            className="home-stoplight-pill"
            style={{ background: '#E97132' }}
            onClick={() => navigate(isLoggedIn ? '/watching' : '/login')}
            aria-label={`Watching: ${watchCount} bills`}
          >
            <div className="home-stoplight-circle">
              <WatchIcon size={20} color="white" />
            </div>
            <div className="home-stoplight-pill-text">
              <span className="home-stoplight-pill-label" style={{ color: 'white' }}>Watching</span>
              <span className="home-stoplight-pill-count" style={{ color: 'white' }}>{watchCount}</span>
            </div>
          </button>

          <button
            className="home-stoplight-pill"
            style={{ background: '#FFC000' }}
            onClick={() => navigate(isLoggedIn ? '/archive' : '/login')}
            aria-label={`Archive: ${archiveCount} bills`}
          >
            <div className="home-stoplight-circle" style={{ background: 'rgba(0,0,0,.14)' }}>
              <ArchiveIcon size={20} color="#5a3a00" />
            </div>
            <div className="home-stoplight-pill-text">
              <span className="home-stoplight-pill-label" style={{ color: '#1a1a18' }}>Archive</span>
              <span className="home-stoplight-pill-count" style={{ color: '#1a1a18' }}>{archiveCount}</span>
            </div>
          </button>

        </div>{/* end stoplight col */}
        </div>{/* end main row */}

        {/* ── Secondary row — 8 tiles ──────────────────── */}
        <div className="home-secondary-row">

          <button className="home-secondary-card" style={{ background: '#4F4262' }}
            disabled aria-label="Civic Education — Coming Soon">
            <CivicIcon size={20} color="white" />
            <span className="home-secondary-label">Civic Ed</span>
            <span className="home-secondary-badge">Coming Soon</span>
          </button>

          <button className="home-secondary-card" style={{ background: '#4F4262' }}
            disabled aria-label="Candidates — Coming Soon">
            <CandidatesIcon size={20} color="white" />
            <span className="home-secondary-label">Candidates</span>
            <span className="home-secondary-badge">Coming Soon</span>
          </button>

          <button className="home-secondary-card" style={{ background: '#4F4262' }}
            disabled aria-label="Policy — Coming Soon">
            <PolicyIcon size={20} color="white" />
            <span className="home-secondary-label">Policy</span>
            <span className="home-secondary-badge">Coming Soon</span>
          </button>

          <button
            className="home-secondary-card" style={{ background: '#B597D5' }}
            onClick={() => navigate('/about')}
            aria-label="About Women for Shared Progress"
          >
            <AboutIcon size={20} color="#2D1B4E" />
            <span className="home-secondary-label" style={{ color: '#2D1B4E' }}>About W4SP</span>
          </button>

          <button
            className="home-secondary-card" style={{ background: '#00B050' }}
            onClick={() => navigate('/settings')}
            aria-label="Settings"
          >
            <SettingsIcon size={20} color="white" />
            <span className="home-secondary-label">Settings</span>
          </button>

          <button
            className="home-secondary-card" style={{ background: '#00B050' }}
            onClick={() => navigate('/enacted-legislation')}
            aria-label="Enacted Legislation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="home-secondary-label">Enacted</span>
          </button>

          <button className="home-secondary-card" style={{ background: '#4F4262' }}
            disabled aria-label="Coming Soon">
            <span className="home-secondary-label">—</span>
            <span className="home-secondary-badge">Coming Soon</span>
          </button>

          <button
            className="home-secondary-card"
            style={{ background: isLoggedIn ? '#808080' : '#FFC000' }}
            onClick={() => isLoggedIn ? handleSignOut() : navigate('/login')}
            aria-label={isLoggedIn ? `Sign out (${user!.username})` : 'Sign in to your account'}
          >
            {isLoggedIn
              ? <SignOutIcon size={20} color="white" />
              : <SignInIcon size={20} color="#5a3a00" />
            }
            <span className="home-secondary-label" style={{ color: isLoggedIn ? 'white' : '#1a1a18' }}>
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </span>
          </button>

        </div>{/* end secondary row */}

        {/* ── Political district section (logged-in users) ─ */}
        {isLoggedIn && (
          <section className="home-district-section" aria-label="Your Representatives">

            {/* Rep columns — Local | State | National */}
            <h2 className="home-district-heading">Your Representatives</h2>

            {/* President / Election Cycle toggle panel */}
            <div className="home-president-panel">
              <div className="home-president-toggle" role="group" aria-label="View mode">
                <button
                  className={presidentMode === 'president' ? 'hpt-active' : ''}
                  onClick={() => setPresidentMode('president')}
                  aria-pressed={presidentMode === 'president'}
                >President</button>
                <button
                  className={presidentMode === 'election' ? 'hpt-active' : ''}
                  onClick={() => setPresidentMode('election')}
                  aria-pressed={presidentMode === 'election'}
                >Election Cycle</button>
              </div>

              {presidentMode === 'president' ? (
                <div className="home-president-info">
                  <div className="home-president-name">{PRESIDENT.name}</div>
                  <div className="home-president-meta">
                    <span><span className="home-pmeta-lbl">Elected</span>{fmtDate(PRESIDENT.dateElected)}</span>
                    <span><span className="home-pmeta-lbl">Term ends</span>{fmtDate(PRESIDENT.termEnds)}</span>
                    {PRESIDENT.previousTerm && (
                      <span><span className="home-pmeta-lbl">Previous term</span>{fmtDate(PRESIDENT.previousTerm.start)} – {fmtDate(PRESIDENT.previousTerm.end)}</span>
                    )}
                  </div>
                  <button className="home-district-action-btn" style={{ background: '#4F4262' }} onClick={() => navigate('/administration')}>Administration</button>
                </div>
              ) : (
                <div className="home-election-cycle">
                  <div className="home-election-dates">
                    {ELECTION_DATES.map(d => (
                      <div key={d.label} className="home-election-date-item">
                        <span className="home-election-date-label">{d.label}</span>
                        <span className="home-election-date-val">{fmtDate(d.date)}</span>
                      </div>
                    ))}
                  </div>
                  <button className="home-district-action-btn" style={{ background: '#4F4262' }} onClick={() => navigate('/presidential-candidates')}>Presidential Candidates</button>
                </div>
              )}
            </div>
            {!hasProfileAddr && (
              <div className="home-no-profile-msg" style={{ marginBottom: 14 }}>
                <span>Set your address in</span>
                <button onClick={() => navigate('/profile')}>My Profile</button>
                <span>to load your elected officials.</span>
              </div>
            )}

            <div className="home-district-grid">
              {(['local', 'state', 'national'] as const).map(level => {
                const officials = hasProfileAddr
                  ? getOfficialsByState(profileAddr?.state ?? '').filter(o => o.level === level)
                  : []

                // District identifiers for this column, ordered highest → lowest level
                const districtCards: { label: string; value: string }[] = []
                if (level === 'national' && profileAddr?.congressional_district) {
                  districtCards.push({ label: 'Congressional District', value: profileAddr.congressional_district })
                }
                if (level === 'state') {
                  if (profileAddr?.state_senate_district)
                    districtCards.push({ label: 'State Senate District', value: profileAddr.state_senate_district })
                  if (profileAddr?.state_house_district)
                    districtCards.push({ label: 'State House District', value: profileAddr.state_house_district })
                }

                return (
                  <div key={level} className="home-district-col">
                    <div className="home-district-col-header">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
                    {officials.map((o, i) => (
                      <div key={i} className="home-rep-card" data-party={o.party}>
                        <div className="home-rep-role">{o.role}</div>
                        <div className="home-rep-name">{o.name}</div>
                        {o.since && <div className="home-rep-since">Since {fmtDate(o.since)}</div>}
                        {(o.phone || o.email) && (
                          <div className="home-rep-contact-info">
                            {o.phone && (
                              <a href={`tel:${o.phone.replace(/\D/g, '')}`} className="home-rep-phone" aria-label={`Call ${o.name}`}>
                                {o.phone}
                              </a>
                            )}
                            {o.email && (
                              <a href={`mailto:${o.email}`} className="home-rep-email" aria-label={`Email ${o.name}`}>
                                {o.email}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {districtCards.map(d => (
                      <div key={d.label} className="home-district-id-card">
                        <div className="home-district-id-label">{d.label}</div>
                        <div className="home-district-id-value">{d.value}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>


          </section>
        )}

      </div>{/* end content */}

      {/* ── Feedback button — fixed lower-right ─────── */}
      {showFeedback && (
        <div className="home-feedback-card" role="dialog" aria-label="Send feedback" aria-modal="true">
          <textarea
            className="home-feedback-textarea"
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value.slice(0, 1000))}
            placeholder="What's on your mind? Bug, suggestion, or general feedback..."
            rows={6}
            maxLength={1000}
            autoFocus
          />
          <div className={`home-feedback-countdown${feedbackText.length > 900 ? ' home-feedback-countdown--warn' : ''}`}>
            {1000 - feedbackText.length} characters remaining
          </div>
          <div className="home-feedback-actions">
            <button className="home-feedback-cancel" onClick={handleFeedbackCancel}>Cancel</button>
            <button
              className="home-feedback-submit"
              onClick={() => { void handleFeedbackSubmit() }}
              disabled={!feedbackText.trim() || submitting}
            >
              {submitting ? 'Sending…' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      <button className="home-feedback-btn" aria-label="Send feedback"
        onClick={() => setShowFeedback(f => !f)}>
        <MarchingBugsIcon />
        <span>Feedback</span>
      </button>

    </div>
  )
}
