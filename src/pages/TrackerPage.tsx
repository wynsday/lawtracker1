import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ActiveFilters, Bill } from '../types/bill'
import { useBills } from '../hooks/useBills'
import { filterBills } from '../lib/billUtils'
import { supabase } from '../lib/supabase'
import { generateHtml } from '../lib/generateHtml'
import Header from '../components/Header'
import FilterGroups from '../components/FilterGroups'
import BillCard from '../components/BillCard'
import ThemeToggle from '../components/ThemeToggle'

const DEFAULT_FILTERS: ActiveFilters = {
  level: 'all', timing: 'all', impact: 'all', issue: 'all',
  policy: 'all', office: 'all', city: 'all', search: '',
}

export default function TrackerPage() {
  const navigate = useNavigate()
  const { bills, loading, error } = useBills(['MI', 'US'])
  const [active, setActive] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem('wsp-theme') ?? 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-page', 'tracker')
    return () => {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.removeAttribute('data-page')
    }
  }, [])

  function handleFilterChange(group: keyof ActiveFilters, value: string) {
    setActive(prev => ({ ...prev, [group]: value }))
  }

  async function fetchAllBills(): Promise<Bill[]> {
    const { data } = await supabase.from('bills').select('*').in('state', ['MI', 'US']).order('id')
    return (data as Bill[]) ?? []
  }

  async function handleDownload() {
    setBusy(true)
    try {
      const d = new Date()
      const today = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      const allBills = await fetchAllBills()
      const html = generateHtml(allBills, 'Michigan', today)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const DD = String(d.getDate()).padStart(2, '0')
      const Mon = d.toLocaleDateString('en-US', { month: 'short' })
      const YY = String(d.getFullYear()).slice(2)
      a.download = `Michigan_National_Tracker_${DD}_${Mon}_${YY}.html`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  const filtered = filterBills(bills, active)

  return (
    <div style={{ paddingTop: 44 }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border-light)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/')}
            style={{
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
          <button
            onClick={handleDownload}
            disabled={busy}
            style={{
              background: '#4F4262', color: '#fff',
              border: 'none', borderRadius: 20, padding: '5px 11px',
              display: 'flex', alignItems: 'center', gap: 5,
              cursor: busy ? 'default' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,.25)',
              fontSize: 12, fontFamily: 'inherit', opacity: busy ? 0.7 : 1,
            }}
            aria-label="Download HTML"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {busy ? 'Fetching…' : 'Download HTML'}
          </button>
        </div>
        <ThemeToggle />
      </div>

      <Header
        stateName="Michigan"
        bills={bills}
        onSearch={q => handleFilterChange('search', q)}
      />

      <FilterGroups active={active} onChange={handleFilterChange} />

      {loading && <div className="loading">Loading bills…</div>}
      {error   && <div className="empty">Error loading bills: {error}</div>}

      {!loading && !error && (
        <>
          <div className="count">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} shown
          </div>
          {filtered.length === 0
            ? <div className="empty">No bills match these filters.</div>
            : filtered.map(b => <BillCard key={b.id} bill={b} />)
          }
        </>
      )}
    </div>
  )
}
