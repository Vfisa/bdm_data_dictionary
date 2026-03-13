import { useEffect, useCallback, useState, useMemo } from 'react'
import { X, ChevronRight, Database, Rows3, HardDrive, Columns3, Clock, FlaskConical, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InlineEditor } from '@/components/ui/InlineEditor'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TagEditor } from '@/components/tags/TagEditor'
import { ColumnTable } from './ColumnTable'
import { RelationshipList } from './RelationshipList'
import { LineageSection, LineageSectionHeader } from './LineageSection'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { formatNumber, formatBytes, timeAgo } from '@/lib/utils'
import { useDescriptionEditor } from '@/hooks/useDescriptionEditor'
import { useProfile } from '@/hooks/useProfile'
import type { MetadataResponse } from '@/lib/types'

interface TableDetailPanelProps {
  tableName: string
  metadata: MetadataResponse
  onClose: () => void
  onNavigate: (tableName: string) => void
  onDescriptionUpdated?: () => void
  onCollapse?: () => void
}

export function TableDetailPanel({
  tableName,
  metadata,
  onClose,
  onNavigate,
  onDescriptionUpdated,
  onCollapse,
}: TableDetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const editor = useDescriptionEditor()
  const { profile, isLoading: profileLoading, error: profileError, fetchProfile, clearProfile } = useProfile()

  // Clear profile when table changes
  useEffect(() => {
    clearProfile()
  }, [tableName, clearProfile])

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

  if (!table) {
    return null
  }

  const config = CATEGORY_CONFIG[table.category]

  return (
    <div
      className={`
        absolute top-0 right-0 h-full w-[560px] max-w-full z-20
        bg-[var(--card)] border-l border-[var(--border)] shadow-2xl
        flex flex-col
        transition-transform duration-200 ease-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}
      role="dialog"
      aria-label={`Table detail: ${table.name}`}
      aria-modal="false"
    >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-[var(--border)]">
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
            <h2 className="text-lg font-semibold text-[var(--foreground)] truncate">
              {table.name}
            </h2>

            {/* Description — click to edit */}
            <div className="text-sm text-[var(--muted-foreground)] mt-1">
              <InlineEditor
                value={table.description}
                placeholder="No description — click to add"
                onSave={async (newDesc) => {
                  editor.requestEdit(table.id, newDesc, table.name)
                }}
                isLoading={editor.isLoading}
              />
            </div>
          </div>

          {/* Collapse / Close buttons */}
          <div className="flex items-center gap-0.5 shrink-0 -mt-1 -mr-1">
            {onCollapse && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCollapse}
                title="Collapse panel"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-[var(--border)] bg-[var(--muted)]">
          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <Columns3 className="h-3.5 w-3.5" />
            {table.columnCount} columns
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <Rows3 className="h-3.5 w-3.5" />
            {formatNumber(table.rowsCount)} rows
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <HardDrive className="h-3.5 w-3.5" />
            {formatBytes(table.dataSizeBytes)}
          </span>
          {table.lastImportDate && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]" title={table.lastImportDate}>
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(table.lastImportDate)}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="px-5 py-2.5 border-b border-[var(--border)]">
          <TagEditor
            tableId={table.id}
            tags={table.tags || []}
            onTagsUpdated={onDescriptionUpdated}
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Columns section */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Database className="h-4 w-4" />
                Columns
              </h3>
              <div className="flex items-center gap-2">
                {profile && (
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    Profiled {timeAgo(profile.profiledAt)}
                  </span>
                )}
                <button
                  onClick={() => table && fetchProfile(table.id)}
                  disabled={profileLoading}
                  className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                  title="Profile column data"
                >
                  {profileLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FlaskConical className="h-3.5 w-3.5" />
                  )}
                  Profile
                </button>
              </div>
            </div>
            {profileError && (
              <div className="mb-2 flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{profileError}</span>
                <button
                  onClick={() => table && fetchProfile(table.id)}
                  className="underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}
            <ColumnTable
              columns={table.columns}
              primaryKey={table.primaryKey}
              tableId={table.id}
              onDescriptionUpdated={onDescriptionUpdated}
              profile={profile}
            />
          </div>

          {/* Relationships section */}
          <div className="p-5 pt-0">
            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2">
              Relationships
            </h3>
            <RelationshipList
              outgoing={outgoing}
              incoming={incoming}
              onNavigate={(target) => {
                onNavigate(target)
              }}
              categories={metadata.categories}
            />
          </div>

          {/* Lineage section */}
          {metadata.lineage && (
            <div className="p-5 pt-0">
              <LineageSectionHeader
                count={
                  (metadata.lineage.producedBy[table.id]?.length || 0) +
                  (metadata.lineage.usedBy[table.id]?.length || 0)
                }
              />
              <LineageSection tableId={table.id} lineage={metadata.lineage} />
            </div>
          )}
        </div>
        {/* Error toast */}
        {editor.error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/30 rounded-md p-3 text-sm text-red-400">
            {editor.error}
          </div>
        )}

      {/* Confirm dialog for description edits */}
      <ConfirmDialog
        open={!!editor.pendingEdit}
        title="Update Description"
        message={
          editor.pendingEdit
            ? `Save new description for "${editor.pendingEdit.label}"?\n\nThis will update the metadata in the storage API.`
            : ''
        }
        confirmLabel="Save"
        onConfirm={async () => {
          const success = await editor.confirmEdit()
          if (success) onDescriptionUpdated?.()
        }}
        onCancel={editor.cancelEdit}
        isLoading={editor.isLoading}
      />
    </div>
  )
}
