import { useState } from 'react'

interface Props { onToggle?: (newIsDark: boolean) => void }

export default function ThemeToggle({ onToggle }: Props = {}) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('wsp-theme') !== 'light')

  function toggle() {
    const next = !isDark
    setIsDark(next)
    const theme = next ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('wsp-theme', theme)
    onToggle?.(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'rgba(128,100,180,.18)',
        border: '1px solid rgba(128,100,180,.32)',
        borderRadius: 20,
        padding: '5px 12px 5px 10px',
        cursor: 'pointer',
        color: 'var(--color-text-primary)',
        fontSize: 13,
        fontFamily: "'Quicksand', sans-serif",
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      {isDark ? '☀ Light' : '☾ Dark'}
    </button>
  )
}
