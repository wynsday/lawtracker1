import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Bill } from '../types/bill'

export function useBills(states: string[] = ['MI', 'US']) {
  const [bills, setBills]   = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('bills')
      .select('*')
      .in('state', states)
      .order('id')
      .then(({ data, error: err }) => {
        if (err) { console.error('useBills error:', err); setError(err.message) }
        else setBills((data as Bill[]) ?? [])
        setLoading(false)
      })
  }, [states.join(',')])

  return { bills, loading, error }
}
