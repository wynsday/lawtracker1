import { useNavigate } from 'react-router-dom'

export default function Administration() {
  const navigate = useNavigate()
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

      <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Administration
      </h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 28 }}>
        Cabinet members and senior administration officials
      </p>
      <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        Cabinet and administration member profiles coming soon.
      </p>
    </div>
  )
}
