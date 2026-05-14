import { useEffect } from 'react'
import PageTopBar from '../components/PageTopBar'

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
      padding: '50px 28px 32px',
      color: 'var(--color-text-primary)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <PageTopBar />
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
