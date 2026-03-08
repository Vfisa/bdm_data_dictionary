import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ErdCanvas } from '@/components/erd/ErdCanvas'
import { TableDetailPanel } from '@/components/table-detail/TableDetailPanel'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { toHumanName } from '@/lib/human-name'
import type { MetadataResponse } from '@/lib/types'

interface ErdPageProps {
  metadata: MetadataResponse
  isRefreshing: boolean
  onRefresh: () => void
  onDescriptionUpdated?: () => void
}

export function ErdPage({ metadata, isRefreshing, onRefresh, onDescriptionUpdated }: ErdPageProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [panelCollapsed, setPanelCollapsed] = useState(false)

  const handleSelectTable = useCallback((tableName: string) => {
    if (!tableName) {
      setSelectedTable(null)
      setPanelCollapsed(false)
      return
    }
    setSelectedTable((prev) => {
      if (prev === tableName) {
        // Deselect — also reset collapsed state
        setPanelCollapsed(false)
        return null
      }
      // Selecting a new table — auto-expand panel
      setPanelCollapsed(false)
      return tableName
    })
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedTable(null)
    setPanelCollapsed(false)
  }, [])

  const handleNavigateToTable = useCallback((tableName: string) => {
    setSelectedTable(tableName)
    setPanelCollapsed(false)
  }, [])

  const handleCollapsePanel = useCallback(() => {
    setPanelCollapsed(true)
  }, [])

  const handleExpandPanel = useCallback(() => {
    setPanelCollapsed(false)
  }, [])

  // Listen for selectTable events from CommandPalette
  useEffect(() => {
    function handleSelectEvent(e: Event) {
      const { tableName } = (e as CustomEvent).detail
      if (tableName) setSelectedTable(tableName)
    }
    window.addEventListener('selectTable', handleSelectEvent)
    return () => window.removeEventListener('selectTable', handleSelectEvent)
  }, [])

  // Find selected table data for collapsed bar label
  const selectedTableData = selectedTable
    ? metadata.tables.find((t) => t.name === selectedTable)
    : null
  const selectedConfig = selectedTableData
    ? CATEGORY_CONFIG[selectedTableData.category]
    : null

  return (
    <div className="relative h-full w-full">
      <ErdCanvas
        metadata={metadata}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onSelectTable={handleSelectTable}
        selectedTable={selectedTable}
      />
      {selectedTable && !panelCollapsed && (
        <TableDetailPanel
          tableName={selectedTable}
          metadata={metadata}
          onClose={handleCloseDetail}
          onNavigate={handleNavigateToTable}
          onDescriptionUpdated={onDescriptionUpdated}
          onCollapse={handleCollapsePanel}
        />
      )}
      {selectedTable && panelCollapsed && (
        <button
          onClick={handleExpandPanel}
          className="absolute top-0 right-0 h-full w-8 z-20 flex flex-col items-center justify-center gap-2 bg-[var(--card)] border-l border-[var(--border)] shadow-lg cursor-pointer hover:bg-[var(--muted)] transition-colors"
          title={`Expand panel — ${toHumanName(selectedTable)}`}
        >
          <ChevronLeft className="h-4 w-4 text-[var(--muted-foreground)]" />
          {selectedConfig && (
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: selectedConfig.color }}
            />
          )}
          <span
            className="text-[10px] font-medium text-[var(--muted-foreground)] whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {toHumanName(selectedTable)}
          </span>
        </button>
      )}
    </div>
  )
}
