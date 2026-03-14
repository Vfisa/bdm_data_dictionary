import { useState, useEffect, useCallback } from 'react'

interface BranchMetadataEntry {
  id: string
  key: string
  value: string
  provider: string
  timestamp: string
}

interface UseProjectOverviewResult {
  description: string | null
  projectName: string | null
  lastRefresh: string | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProjectOverview(): UseProjectOverviewResult {
  const [description, setDescription] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyData = useCallback((data: { metadata: BranchMetadataEntry[]; lastRefresh?: string }) => {
    const descEntry = data.metadata.find(
      (m) => m.key === 'KBC.projectDescription',
    )
    setDescription(descEntry?.value ?? null)

    const nameEntry = data.metadata.find(
      (m) => m.key === 'KBC.projectName',
    )
    setProjectName(nameEntry?.value ?? null)

    if (data.lastRefresh) {
      setLastRefresh(data.lastRefresh)
    }
  }, [])

  // Initial fetch — from server cache, instant
  useEffect(() => {
    let cancelled = false

    async function fetchOverview() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/project-overview')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }

        const data = await res.json()
        if (!cancelled) {
          applyData(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load project overview',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchOverview()
    return () => { cancelled = true }
  }, [applyData])

  // Manual refresh — triggers server-side cache refresh, then re-fetches
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true)

      // Trigger server-side full refresh (reloads branch metadata + tables)
      await fetch('/api/refresh', { method: 'POST' })

      // Re-fetch overview from refreshed cache
      const res = await fetch('/api/project-overview')
      if (!res.ok) {
        throw new Error(`Failed to fetch updated overview: HTTP ${res.status}`)
      }

      const data = await res.json()
      applyData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
    } finally {
      setIsRefreshing(false)
    }
  }, [applyData])

  return { description, projectName, lastRefresh, isLoading, isRefreshing, error, refresh }
}
