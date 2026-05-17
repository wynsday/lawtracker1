import { syncBillStatus, syncAllBillStatuses } from './notificationClient'

export type BillStatus = 'alert' | 'watch' | 'archive' | null

const KEY = 'wsp-bill-status'

function getAll(): Record<number, BillStatus> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

export function getStatus(id: number): BillStatus {
  return getAll()[id] ?? null
}

export function setStatus(id: number, status: BillStatus) {
  const all = getAll()
  if (status === null) delete all[id]
  else all[id] = status
  localStorage.setItem(KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('bill-status-change'))
  // Background DB sync — silently ignored if not logged in (returns 401)
  syncBillStatus([{ bill_id: id, status }]).catch(() => {})
}

export function getIdsByStatus(status: 'alert' | 'watch' | 'archive'): Set<number> {
  const all = getAll()
  return new Set(
    Object.entries(all)
      .filter(([, v]) => v === status)
      .map(([k]) => Number(k))
  )
}

// Call once after login to push all local statuses to the DB.
export function syncStatusesAfterLogin(): void {
  const all = getAll() as Record<string, string>
  if (Object.keys(all).length > 0) {
    syncAllBillStatuses(all).catch(() => {})
  }
}
