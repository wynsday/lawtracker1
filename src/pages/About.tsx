import { useEffect } from 'react'
import PageTopBar from '../components/PageTopBar'
import FeedbackButton from '../components/FeedbackButton'
import { GremlinVera } from '../components/GremlinsArt'

export default function About() {
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
        About W4SP
      </h1>
      <p style={{ fontSize: 16, color: 'var(--page-title)', lineHeight: 1.6, marginBottom: 16 }}>
        Women for Shared Progress was founded by disabled Air Force veteran women making useful things and deploying gremlins who work for the greater good.
      </p>
      <p style={{ fontSize: 16, color: 'var(--page-title)', lineHeight: 1.6 }}>
        The 3am Pipeline is explicitly nonpartisan, open source, free at all levels, and encourages individual participation in our effort to make civic involvement easier and more accessible to everyone.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 }}>
        <GremlinVera />
      </div>
      <FeedbackButton />
    </div>
  )
}
