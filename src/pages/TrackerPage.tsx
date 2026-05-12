import { useState } from 'react'
import type { ActiveFilters, Bill } from '../types/bill'
import { useBills } from '../hooks/useBills'
import { filterBills } from '../lib/billUtils'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import FilterGroups from '../components/FilterGroups'
import BillCard from '../components/BillCard'

const DEFAULT_FILTERS: ActiveFilters = {
  level: 'all', timing: 'all', impact: 'all', issue: 'all',
  policy: 'all', office: 'all', city: 'all', search: '',
}

export default function TrackerPage() {
  const { bills, loading, error } = useBills(['MI', 'US'])
  const [active, setActive] = useState<ActiveFilters>(DEFAULT_FILTERS)

  function handleFilterChange(group: keyof ActiveFilters, value: string) {
    setActive(prev => ({ ...prev, [group]: value }))
  }

  async function fetchAllBills(): Promise<Bill[]> {
    const { data } = await supabase.from('bills').select('*').in('state', ['MI', 'US']).order('id')
    return (data as Bill[]) ?? []
  }

  const filtered = filterBills(bills, active)

  return (
    <>
      <Header
        stateName="Michigan"
        bills={bills}
        onSearch={q => handleFilterChange('search', q)}
        fetchAllBills={fetchAllBills}
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
    </>
  )
}
