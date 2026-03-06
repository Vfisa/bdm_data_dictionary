import { useState, useCallback } from 'react'
import type { DescriptionUpdate } from '@/lib/types'

interface PendingEdit {
  itemId: string
  description: string
  label: string
}

interface UseDescriptionEditorReturn {
  isLoading: boolean
  error: string | null
  pendingEdit: PendingEdit | null
  requestEdit: (itemId: string, description: string, label: string) => void
  confirmEdit: () => Promise<boolean>
  cancelEdit: () => void
  saveDirectly: (itemId: string, description: string) => Promise<boolean>
}

async function pushDescriptionUpdate(updates: DescriptionUpdate[]): Promise<void> {
  const res = await fetch('/api/descriptions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to update description: ${res.status} ${res.statusText}\n${body}`)
  }

  const data = await res.json()
  const failed = data.results?.filter((r: { success: boolean }) => !r.success)
  if (failed?.length > 0) {
    throw new Error(`Some updates failed: ${failed.map((f: { error: string }) => f.error).join(', ')}`)
  }
}

export function useDescriptionEditor(): UseDescriptionEditorReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null)

  const requestEdit = useCallback((itemId: string, description: string, label: string) => {
    setPendingEdit({ itemId, description, label })
    setError(null)
  }, [])

  const confirmEdit = useCallback(async (): Promise<boolean> => {
    if (!pendingEdit) return false

    setIsLoading(true)
    setError(null)
    try {
      await pushDescriptionUpdate([
        { itemId: pendingEdit.itemId, description: pendingEdit.description },
      ])
      setPendingEdit(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [pendingEdit])

  const cancelEdit = useCallback(() => {
    setPendingEdit(null)
    setError(null)
  }, [])

  const saveDirectly = useCallback(async (itemId: string, description: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await pushDescriptionUpdate([{ itemId, description }])
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    pendingEdit,
    requestEdit,
    confirmEdit,
    cancelEdit,
    saveDirectly,
  }
}
