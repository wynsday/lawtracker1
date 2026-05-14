import { useRef } from 'react'
import type { Bill } from '../types/bill'

interface HeaderProps {
  stateName: string
  bills:     Bill[]
  onSearch:  (q: string) => void
}

export default function Header({ stateName, bills: _bills, onSearch }: HeaderProps) {
  const d     = new Date()
  const today = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const year  = d.getFullYear()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="page-header">
      <div className="page-header-row">
        <div>
          <div className="page-title">{stateName} Legislation Tracker</div>
          <div className="page-subtitle">
            Federal, {stateName} state &amp; local ordinances active in {year} &middot; {today}
          </div>
        </div>
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
  )
}
