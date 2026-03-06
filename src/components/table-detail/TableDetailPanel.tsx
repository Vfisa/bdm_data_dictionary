import { useEffect, useCallback, useState, useMemo } from 'react'
import { X, Database, Rows3, HardDrive, Columns3, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ColumnTable } from './ColumnTable'
import { RelationshipList } from './RelationshipList'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { formatNumber, formatBytes, timeAgo } from '@/lib/utils'
import type { MetadataResponse } from '@/lib/types'

interface TableDetailPanelProps {
  tableName: string
  metadata: MetadataResponse
  onClose: () => void
  onNavigate: (tableName: string) => void
}

export function TableDetailPanel({
  tableName,
  metadata,
  onClose,
  onNavigate,
}: TableDetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Find the table data
  const table = useMemo(
    () => metadata.tables.find((t) => t.name === tableName),
    [metadata, tableName],
  )

  // Find outgoing/incoming edges
  const outgoing = useMemo(
    () => metadata.edges.filter((e) => e.source === tableName),
    [metadata, tableName],
  )
  const incoming = useMemo(
    () => metadata.edges.filter((e) => e.target === tableName),
    [metadata, tableName],
  )

  // Slide-in animation
  useEffect(() => {
    // Trigger animation after mount
    const timer = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    // Wait for slide-out animation
    setTimeout(onClose, 200)
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose()
      }
    },
    [handleClose],
  )

  if (!table) {
    return null
  }

  const config = CATEGORY_CONFIG[table.category]

  return (
    <div
      className="absolute inset-0 z-20"
      onClick={handleBackdropClick}
      role="dialog"
      aria-label={`Table detail: ${table.name}`}
      aria-modal="false"
    >
      {/* Panel */}
      <div
        className={`
          absolute top-0 right-0 h-full w-[420px] max-w-full
          bg-[var(--card)] border-l border-[var(--border)] shadow-2xl
          flex flex-col
          transition-transform duration-200 ease-out
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-[var(--border)]">
          <div className="flex-1 min-w-0">
            {/* Category badge */}
            <Badge
              className="mb-1.5"
              style={{
                backgroundColor: `${config.color}18`,
                color: config.color,
                borderColor: `${config.color}30`,
              }}
            >
              {config.label}
            </Badge>

            {/* Table name */}
            <h2 className="text-base font-semibold text-[var(--foreground)] truncate">
              {table.name}
            </h2>

            {/* Description */}
            {table.description ? (
              <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-3">
                {table.description}
              </p>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] mt-1 italic">
                No description available
              </p>
            )}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="shrink-0 -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--muted)]">
          <span className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
            <Columns3 className="h-3 w-3" />
            {table.columnCount} columns
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
            <Rows3 className="h-3 w-3" />
            {formatNumber(table.rowsCount)} rows
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
            <HardDrive className="h-3 w-3" />
            {formatBytes(table.dataSizeBytes)}
          </span>
          {table.lastImportDate && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]" title={table.lastImportDate}>
              <Clock className="h-3 w-3" />
              {timeAgo(table.lastImportDate)}
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Columns section */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Columns
            </h3>
            <ColumnTable
              columns={table.columns}
              primaryKey={table.primaryKey}
            />
          </div>

          {/* Relationships section */}
          <div className="p-4 pt-0">
            <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2">
              Relationships
            </h3>
            <RelationshipList
              outgoing={outgoing}
              incoming={incoming}
              onNavigate={(target) => {
                onNavigate(target)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
