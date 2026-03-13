import { useState, useEffect } from 'react'

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
  isLoading: boolean
  error: string | null
}

export function useProjectOverview(): UseProjectOverviewResult {
  const [description, setDescription] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        const data: { metadata: BranchMetadataEntry[] } = await res.json()

        if (!cancelled) {
          const descEntry = data.metadata.find(
            (m) => m.key === 'KBC.projectDescription',
          )
          setDescription(descEntry?.value ?? null)

          const nameEntry = data.metadata.find(
            (m) => m.key === 'KBC.projectName',
          )
          setProjectName(nameEntry?.value ?? null)
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
  }, [])

  return { description, projectName, isLoading, error }
}
