import { Key, CircleDot, Info, Pencil, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { TypeBadge } from './TypeBadge'
import { NoValueBadge } from './NoValueBadge'
import { ColumnProfileDrawer } from './ColumnProfileDrawer'
import { InlineEditor } from '@/components/ui/InlineEditor'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDescriptionEditor } from '@/hooks/useDescriptionEditor'
import type { Column, TableProfile } from '@/lib/types'
import { NOVALUE_SENTINEL } from '@/lib/qa-stats'

interface ColumnTableProps {
  columns: Column[]
  primaryKey: string[]
  tableId?: string
  onDescriptionUpdated?: () => void
  profile?: TableProfile | null
}

export function ColumnTable({ columns, primaryKey, tableId, onDescriptionUpdated, profile }: ColumnTableProps) {
  const pkSet = new Set(primaryKey)
  const editor = useDescriptionEditor()
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set())

  const toggleExpanded = (colName: string) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(colName)) {
        next.delete(colName)
      } else {
        next.add(colName)
      }
      return next
    })
  }

  // Build lookup for column profiles
  const profileMap = new Map(
    (profile?.columns ?? []).map((cp) => [cp.columnName, cp])
  )

  return (
    <div className="overflow-auto max-h-[500px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[var(--card)] z-10">
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-2 px-2 font-medium text-[var(--muted-foreground)]">
              Column
            </th>
            <th className="text-left py-2 px-2 font-medium text-[var(--muted-foreground)]">
              Type
            </th>
            <th className="text-center py-2 px-1 font-medium text-[var(--muted-foreground)]" title="Nullable">
              Null
            </th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => {
            const isPK = pkSet.has(col.name)
            const isIdColumn = col.name.endsWith('_ID')
            const colProfile = profileMap.get(col.name)
            const isExpanded = expandedColumns.has(col.name)
            const canExpand = !!colProfile

            return (
              <tr
                key={col.name}
                className="border-b border-[var(--border)] last:border-0"
              >
                <td colSpan={3} className="p-0">
                  {/* Main column row */}
                  <div
                    className={`flex items-start hover:bg-[var(--muted)] transition-colors ${canExpand ? 'cursor-pointer' : ''}`}
                    onClick={() => canExpand && toggleExpanded(col.name)}
                  >
                    {/* Column name + description */}
                    <div className="flex-1 py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        {canExpand && (
                          <ChevronRight className={`h-3 w-3 text-[var(--muted-foreground)] shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        )}
                        {isPK && (
                          <span title="Primary Key"><Key className="h-3 w-3 text-amber-500 shrink-0" /></span>
                        )}
                        <span className={`font-mono text-xs ${isPK ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--foreground)]'}`}>
                          {col.name}
                        </span>
                        {isIdColumn && !isPK && !colProfile && (
                          <span title={`May contain ${NOVALUE_SENTINEL} for missing references`}>
                            <Info className="h-3 w-3 text-[var(--muted-foreground)] opacity-40 shrink-0" />
                          </span>
                        )}
                        {isIdColumn && colProfile && profile && (
                          <NoValueBadge columnProfile={colProfile} sampleSize={profile.sampleSize} />
                        )}
                      </div>
                      {tableId && editingColumn === col.name ? (
                        <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                          <InlineEditor
                            value={col.description}
                            placeholder="Add description..."
                            onSave={async (newDesc) => {
                              editor.requestEdit(
                                `${tableId}.${col.name}`,
                                newDesc,
                                col.name,
                              )
                              setEditingColumn(null)
                            }}
                            isLoading={editor.isLoading}
                            className="text-[11px]"
                          />
                        </div>
                      ) : (
                        <div className="group/desc flex items-center gap-1 mt-0.5">
                          {col.description ? (
                            <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                              {col.description}
                            </p>
                          ) : tableId ? (
                            <p className="text-[11px] text-[var(--muted-foreground)] italic opacity-0 group-hover/desc:opacity-50 transition-opacity">
                              Add description...
                            </p>
                          ) : null}
                          {tableId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingColumn(col.name)
                              }}
                              className="opacity-0 group-hover/desc:opacity-100 transition-opacity shrink-0"
                              title="Edit description"
                            >
                              <Pencil className="h-2.5 w-2.5 text-[var(--muted-foreground)]" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Type */}
                    <div className="py-2 px-2 shrink-0">
                      <TypeBadge
                        baseType={col.keboolaBaseType}
                        nativeType={col.databaseNativeType}
                      />
                    </div>

                    {/* Nullable */}
                    <div className="py-2 px-1 shrink-0 w-10 text-center">
                      {col.nullable ? (
                        <span title="Nullable"><CircleDot className="h-3 w-3 text-[var(--muted-foreground)] mx-auto" /></span>
                      ) : (
                        <span className="text-[10px] text-[var(--muted-foreground)]">-</span>
                      )}
                    </div>
                  </div>

                  {/* Expandable profile drawer */}
                  {isExpanded && colProfile && profile && (
                    <ColumnProfileDrawer
                      profile={colProfile}
                      sampleSize={profile.sampleSize}
                      totalRows={profile.totalRows}
                      hasNativeProfile={profile.hasNativeProfile}
                      keboolaBaseType={col.keboolaBaseType}
                      isIdColumn={isIdColumn}
                    />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Confirm dialog for column description edits */}
      <ConfirmDialog
        open={!!editor.pendingEdit}
        title="Update Column Description"
        message={
          editor.pendingEdit
            ? `Save new description for column "${editor.pendingEdit.label}"?\n\nThis will update the metadata in the storage API.`
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
