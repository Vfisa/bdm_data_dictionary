import { useState, useRef, useCallback } from 'react'
import type { TableProfile } from '../lib/types'

/**
 * Hook for on-demand table data profiling.
 * Does NOT auto-fetch — waits for explicit fetchProfile() call.
 * Clears profile when tableId changes.
 */
export function useProfile() {
  const [profile, setProfile] = useState<TableProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentTableId = useRef<string | null>(null)

  const fetchProfile = useCallback(async (tableId: string) => {
    currentTableId.current = tableId
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(tableId)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || `Profile fetch failed: ${res.status}`)
      }

      const data: TableProfile = await res.json()

      // Prevent stale updates if table changed while loading
      if (currentTableId.current === tableId) {
        setProfile(data)
      }
    } catch (err) {
      if (currentTableId.current === tableId) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setProfile(null)
      }
    } finally {
      if (currentTableId.current === tableId) {
        setIsLoading(false)
      }
    }
  }, [])

  const clearProfile = useCallback(() => {
    setProfile(null)
    setError(null)
    setIsLoading(false)
    currentTableId.current = null
  }, [])

  return { profile, isLoading, error, fetchProfile, clearProfile }
}
