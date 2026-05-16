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
}

export function getIdsByStatus(status: 'alert' | 'watch' | 'archive'): Set<number> {
  const all = getAll()
  return new Set(
    Object.entries(all)
      .filter(([, v]) => v === status)
      .map(([k]) => Number(k))
  )
}
