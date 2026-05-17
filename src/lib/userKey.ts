export function userKey(base: string): string {
  const u = localStorage.getItem('wsp-current-user')
  return u ? `${base}-${u}` : `${base}-guest`
}
