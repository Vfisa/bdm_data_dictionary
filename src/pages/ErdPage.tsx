import { useState, useCallback } from 'react'
import { ErdCanvas } from '@/components/erd/ErdCanvas'
import type { MetadataResponse } from '@/lib/types'

interface ErdPageProps {
  metadata: MetadataResponse
  isRefreshing: boolean
  onRefresh: () => void
}

export function ErdPage({ metadata, isRefreshing, onRefresh }: ErdPageProps) {
  const [_selectedTable, setSelectedTable] = useState<string | null>(null)

  const handleSelectTable = useCallback((tableName: string) => {
    setSelectedTable((prev) => (prev === tableName ? null : tableName))
  }, [])

  return (
    <div className="relative h-full w-full">
      <ErdCanvas
        metadata={metadata}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onSelectTable={handleSelectTable}
      />
      {/* Table detail overlay will be added in Step 9 */}
    </div>
  )
}
