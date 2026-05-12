import type { Bill, ActiveFilters } from '../types/bill'

export function policyBarStyle(bias: number): string {
  if (bias >= 38 && bias <= 62) return 'background:#6600CC'
  return `background:linear-gradient(to right,var(--bar-lib) ${bias}%,var(--bar-con) ${bias}%)`
}

export function policyCategory(bias: number): 'liberal' | 'center' | 'conservative' {
  if (bias >= 63) return 'liberal'
  if (bias <= 37) return 'conservative'
  return 'center'
}

export function filterBills(bills: Bill[], active: ActiveFilters): Bill[] {
  return bills.filter(b => {
    if (active.search) {
      const q = active.search.toLowerCase()
      const hay = (b.name + ' ' + b.bill_desc + ' ' + (b.municipality ?? '')).toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (active.level !== 'all' && b.level !== active.level) return false
    if (active.city !== 'all' && b.level === 'local' && b.municipality !== active.city) return false
    const timingVal = active.timing === 'session' ? 'year' : active.timing
    if (active.timing !== 'all' && b.urgency !== timingVal) return false
    if (active.impact !== 'all') {
      const f = active.impact
      if (f === '4th' && !b.amend.includes('4th')) return false
      if (f === '1st' && !b.amend.includes('1st')) return false
      if (f === 'due' && !b.amend.includes('due') && !b.amend.includes('14th')) return false
    }
    if (active.issue !== 'all' && !b.issues.includes(active.issue)) return false
    if (active.policy !== 'all' && policyCategory(b.policy_bias) !== active.policy) return false
    if (active.office !== 'all' && b.ratify_office !== active.office) return false
    return true
  })
}
