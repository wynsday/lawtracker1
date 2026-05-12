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
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24,
          fontFamily: "'Quicksand', sans-serif", fontSize: 14, fontWeight: 600,
          color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, padding: 0,
        }}
        aria-label="Go back"
      >
        ← Back
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
