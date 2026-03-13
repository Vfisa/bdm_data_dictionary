import { useEffect, useMemo } from 'react'
import { Database, Rows3, HardDrive, Columns3, Clock, FlaskConical, Loader2, AlertTriangle, Table2, ArrowLeftRight } from 'lucide-react'
import { InlineEditor } from '@/components/ui/InlineEditor'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TagEditor } from '@/components/tags/TagEditor'
import { ColumnTable } from '@/components/table-detail/ColumnTable'
import { RelationshipList } from '@/components/table-detail/RelationshipList'
import { LineageSection, LineageSectionHeader } from '@/components/table-detail/LineageSection'
import { DataPreviewTable } from './DataPreviewTable'
import { formatNumber, formatBytes, timeAgo } from '@/lib/utils'
import { useDescriptionEditor } from '@/hooks/useDescriptionEditor'
import { useProfile } from '@/hooks/useProfile'
import { useDataPreview } from '@/hooks/useDataPreview'
import type { MetadataResponse, TableSummary } from '@/lib/types'

interface TableExpandedDetailProps {
  table: TableSummary
  metadata: MetadataResponse
  onNavigate: (tableName: string) => void
  onDescriptionUpdated?: () => void
}

export function TableExpandedDetail({
  table,
  metadata,
  onNavigate,
  onDescriptionUpdated,
}: TableExpandedDetailProps) {
  const editor = useDescriptionEditor()
  const { profile, isLoading: profileLoading, error: profileError, fetchProfile, clearProfile } = useProfile()
  const { data: previewData, isLoading: previewLoading, error: previewError, fetchPreview, clearPreview } = useDataPreview()

  useEffect(() => {
    clearProfile()
    clearPreview()
  }, [table.id, clearProfile, clearPreview])

  const outgoing = useMemo(
    () => metadata.edges.filter((e) => e.source === table.name),
    [metadata.edges, table.name],
  )
  const incoming = useMemo(
    () => metadata.edges.filter((e) => e.target === table.name),
    [metadata.edges, table.name],
  )

  // Build FK target map: columnName → target table name (for _ID columns with outgoing edges)
  const fkTargetMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const edge of outgoing) {
      map.set(edge.sourceColumn, edge.target)
    }
    return map
  }, [outgoing])

  return (
    <div
      className="border-t border-[var(--border)] bg-[var(--muted)]/30"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Description + Stats + Tags */}
      <div className="px-5 py-4 space-y-3">
        <div className="text-sm text-[var(--muted-foreground)]">
          <InlineEditor
            value={table.description}
            placeholder="No description — click to add"
            onSave={async (newDesc) => {
              editor.requestEdit(table.id, newDesc, table.name)
            }}
            isLoading={editor.isLoading}
          />
        </div>

        <div className="flex items-center gap-4 px-3 py-2 rounded-md bg-[var(--muted)]">
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

        <TagEditor
          tableId={table.id}
          tags={table.tags || []}
          onTagsUpdated={onDescriptionUpdated}
        />
      </div>

      {/* 1. Columns section */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            Columns ({table.columnCount})
          </h3>
          <div className="flex items-center gap-2">
            {profile && (
              <span className="text-[10px] text-[var(--muted-foreground)]">
                Profiled {timeAgo(profile.profiledAt)}
              </span>
            )}
            <button
              onClick={() => fetchProfile(table.id)}
              disabled={profileLoading}
              className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50 cursor-pointer"
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
              onClick={() => fetchProfile(table.id)}
              className="underline hover:no-underline cursor-pointer"
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
          fkTargetMap={fkTargetMap}
          onNavigate={onNavigate}
        />
      </div>

      {/* Separator */}
      <div className="mx-5 border-t border-[var(--border)]" />

      {/* 2. Relationships section */}
      {(outgoing.length > 0 || incoming.length > 0) && (
        <>
          <div className="px-5 py-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowLeftRight className="h-4 w-4" />
              Relationships ({outgoing.length + incoming.length})
            </h3>
            <RelationshipList
              outgoing={outgoing}
              incoming={incoming}
              onNavigate={onNavigate}
              categories={metadata.categories}
            />
          </div>
          {/* Separator */}
          <div className="mx-5 border-t border-[var(--border)]" />
        </>
      )}

      {/* 3. Lineage section (after Relationships, before Data Preview) */}
      {metadata.lineage && (
        <>
          <div className="px-5 py-4">
            <LineageSectionHeader
              count={
                (metadata.lineage.producedBy[table.id]?.length || 0) +
                (metadata.lineage.usedBy[table.id]?.length || 0)
              }
            />
            <LineageSection tableId={table.id} lineage={metadata.lineage} />
          </div>
          {/* Separator */}
          <div className="mx-5 border-t border-[var(--border)]" />
        </>
      )}

      {/* 4. Data Preview (moved to bottom) */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Table2 className="h-4 w-4" />
          Data Preview
        </h3>
        <DataPreviewTable
          data={previewData}
          isLoading={previewLoading}
          error={previewError}
          onFetch={() => fetchPreview(table.id)}
        />
      </div>

      {/* Error toast */}
      {editor.error && (
        <div className="mx-5 mb-3 bg-red-500/10 border border-red-500/30 rounded-md p-3 text-sm text-red-400">
          {editor.error}
        </div>
      )}

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
