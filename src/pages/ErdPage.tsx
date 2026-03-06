import { useState, useCallback } from 'react'
import { ErdCanvas } from '@/components/erd/ErdCanvas'
import { TableDetailPanel } from '@/components/table-detail/TableDetailPanel'
import type { MetadataResponse } from '@/lib/types'

interface ErdPageProps {
  metadata: MetadataResponse
  isRefreshing: boolean
  onRefresh: () => void
}

export function ErdPage({ metadata, isRefreshing, onRefresh }: ErdPageProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const handleSelectTable = useCallback((tableName: string) => {
    setSelectedTable((prev) => (prev === tableName ? null : tableName))
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedTable(null)
  }, [])

  const handleNavigateToTable = useCallback((tableName: string) => {
    setSelectedTable(tableName)
  }, [])

  return (
    <div className="relative h-full w-full">
      <ErdCanvas
        metadata={metadata}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onSelectTable={handleSelectTable}
      />
      {selectedTable && (
        <TableDetailPanel
          tableName={selectedTable}
          metadata={metadata}
          onClose={handleCloseDetail}
          onNavigate={handleNavigateToTable}
        />
      )}
    </div>
  )
}
