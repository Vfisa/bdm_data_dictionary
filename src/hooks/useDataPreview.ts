import { useState, useRef, useCallback } from 'react'
import type { DataPreviewResult } from '../lib/types'

/**
 * Hook for on-demand table data preview.
 * Fetches row-level sample data from the server.
 */
export function useDataPreview() {
  const [data, setData] = useState<DataPreviewResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentTableId = useRef<string | null>(null)

  const fetchPreview = useCallback(async (tableId: string, limit = 20) => {
    currentTableId.current = tableId
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/preview/${encodeURIComponent(tableId)}?limit=${limit}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(body.error || `Preview fetch failed: ${res.status}`)
      }

      const result: DataPreviewResult = await res.json()

      if (currentTableId.current === tableId) {
        setData(result)
      }
    } catch (err) {
      if (currentTableId.current === tableId) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData(null)
      }
    } finally {
      if (currentTableId.current === tableId) {
        setIsLoading(false)
      }
    }
  }, [])

  const clearPreview = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
    currentTableId.current = null
  }, [])

  return { data, isLoading, error, fetchPreview, clearPreview }
}
