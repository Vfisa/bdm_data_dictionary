import { useState, useEffect, useCallback } from 'react'
import type { MetadataResponse } from '@/lib/types'

interface UseMetadataResult {
  data: MetadataResponse | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  refetch: () => Promise<void>
  isRefreshing: boolean
}

export function useMetadata(): UseMetadataResult {
  const [data, setData] = useState<MetadataResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initial fetch
  useEffect(() => {
    let cancelled = false

    async function fetchMetadata() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/metadata')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }

        const metadata: MetadataResponse = await res.json()
        if (!cancelled) {
          setData(metadata)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load metadata')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchMetadata()
    return () => { cancelled = true }
  }, [])

  // Manual refresh
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true)

      // Trigger server-side refresh
      const refreshRes = await fetch('/api/refresh', { method: 'POST' })
      if (!refreshRes.ok) {
        const body = await refreshRes.json().catch(() => ({}))
        throw new Error(body.error || `Refresh failed: HTTP ${refreshRes.status}`)
      }

      // Re-fetch metadata with fresh data
      const res = await fetch('/api/metadata')
      if (!res.ok) {
        throw new Error(`Failed to fetch updated metadata: HTTP ${res.status}`)
      }

      const metadata: MetadataResponse = await res.json()
      setData(metadata)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Lightweight re-fetch from server cache (no Keboola API refresh)
  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/metadata')
      if (!res.ok) return
      const metadata: MetadataResponse = await res.json()
      setData(metadata)
    } catch {
      // Silently fail — this is a best-effort update
    }
  }, [])

  return { data, isLoading, error, refresh, refetch, isRefreshing }
}
