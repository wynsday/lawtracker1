import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ENTRIES = [
  {
    version: 'v0.1 — May 2026',
    items: [
      '46 bills tracked across federal and Michigan state levels',
      'Home dashboard with bill pipeline, representatives panel, and election cycle toggle',
      'Light and dark mode',
      'Account registration and secure login',
      'Profile page with address and district lookup',
      'Feedback button',
    ],
  },
]

export default function Changelog() {
  const navigate = useNavigate()
  useEffect(() => {
    const theme = localStorage.getItem('wsp-theme') ?? 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-page', 'content')
    return () => {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.removeAttribute('data-page')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg-secondary)',
      padding: '32px 28px',
      color: 'var(--color-text-primary)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 100,
          background: '#4F4262', color: '#fff',
          border: 'none', borderRadius: 20, padding: '5px 9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,.25)',
        }}
        aria-label="Go to home"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>

      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 6, marginTop: 0, color: 'var(--page-title)' }}>
          Change Log
        </h1>
        <p style={{ fontSize: 14, color: 'var(--page-subtitle)', marginBottom: 36, lineHeight: 1.6 }}>
          A record of what's been built and shipped.
        </p>

        {ENTRIES.map(entry => (
          <div key={entry.version} style={{
            background: 'var(--color-card, #fff)',
            border: '.5px solid var(--color-border-light)',
            borderRadius: 12,
            padding: '22px 24px',
            marginBottom: 20,
          }}>
            <h2 style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 17,
              fontWeight: 700,
              margin: '0 0 16px 0',
              color: 'var(--page-title)',
            }}>
              {entry.version}
            </h2>
            <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entry.items.map(item => (
                <li key={item} style={{ fontSize: 15, color: 'var(--page-title)', lineHeight: 1.55 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
