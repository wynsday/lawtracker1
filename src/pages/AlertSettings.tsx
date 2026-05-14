import { useEffect } from 'react'
import PageTopBar from '../components/PageTopBar'

export default function AlertSettings() {
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
      <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'var(--page-title)' }}>
        Alert Settings
      </h1>
      <p style={{ fontSize: 16, color: 'var(--page-title)', lineHeight: 1.6 }}>
        Coming soon
      </p>
    </div>
  )
}
