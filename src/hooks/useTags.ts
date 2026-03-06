import { useState, useCallback } from 'react'

interface UseTagsReturn {
  isLoading: boolean
  error: string | null
  updateTags: (tableId: string, tags: string[]) => Promise<boolean>
}

export function useTags(): UseTagsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateTags = useCallback(async (tableId: string, tags: string[]): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, tags }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tags')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, updateTags }
}
