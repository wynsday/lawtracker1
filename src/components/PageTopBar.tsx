import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function PageTopBar() {
  const navigate = useNavigate()
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: 'var(--color-bg-secondary)',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: '#4F4262',
          color: '#fff',
          border: 'none',
          borderRadius: 20,
          padding: '5px 9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
      <ThemeToggle />
    </div>
  )
}
