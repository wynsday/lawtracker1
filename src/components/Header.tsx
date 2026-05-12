import { useRef, useState } from 'react'
import type { Bill } from '../types/bill'
import { generateHtml } from '../lib/generateHtml'

interface HeaderProps {
  stateName:      string
  bills:          Bill[]
  onSearch:       (q: string) => void
  fetchAllBills?: () => Promise<Bill[]>
}

export default function Header({ stateName, bills, onSearch, fetchAllBills }: HeaderProps) {
  const d     = new Date()
  const today = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const year  = d.getFullYear()
  const inputRef    = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    setBusy(true)
    try {
      const allBills = fetchAllBills ? await fetchAllBills() : bills
      const html     = generateHtml(allBills, stateName, today)
      const blob     = new Blob([html], { type: 'text/html' })
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = url
      const DD  = String(d.getDate()).padStart(2, '0')
      const Mon = d.toLocaleDateString('en-US', { month: 'short' })
      const YY  = String(d.getFullYear()).slice(2)
      a.download = `${stateName}_National_Tracker_${DD}_${Mon}_${YY}.html`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-header">
      <div className="page-header-row">
        <div>
          <div className="page-title">{stateName} Legislation Tracker</div>
          <div className="page-subtitle">
            Federal, {stateName} state &amp; local ordinances active in {year} &middot; {today}
          </div>
        </div>
        <div className="header-actions">
          <button className="download-btn" onClick={handleDownload} disabled={busy} title="Download all bills as standalone HTML">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {busy ? 'Fetching…' : 'Download HTML'}
          </button>
          <div className="search-wrap">
            <input
              ref={inputRef}
              type="search"
              className="search-input"
              placeholder="Search bills…"
              autoComplete="off"
              onChange={e => onSearch(e.target.value.trim())}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
