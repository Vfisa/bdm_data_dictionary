import { Key, CircleDot, Pencil, ChevronRight, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { TypeBadge } from './TypeBadge'
import { NoValueBadge } from './NoValueBadge'
import { ColumnProfileDrawer } from './ColumnProfileDrawer'
import { InlineEditor } from '@/components/ui/InlineEditor'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDescriptionEditor } from '@/hooks/useDescriptionEditor'
import { toHumanName } from '@/lib/human-name'
import type { Column, TableProfile } from '@/lib/types'
import { NOVALUE_SENTINEL } from '@/lib/qa-stats'

interface ColumnTableProps {
  columns: Column[]
  primaryKey: string[]
  tableId?: string
  onDescriptionUpdated?: () => void
  profile?: TableProfile | null
  /** Map of column name → FK target table name (e.g. "CARRIER_ID" → "REF_CARRIER") */
  fkTargetMap?: Map<string, string>
  /** Navigate to a table by name */
  onNavigate?: (tableName: string) => void
}

export function ColumnTable({ columns, primaryKey, tableId, onDescriptionUpdated, profile, fkTargetMap, onNavigate }: ColumnTableProps) {
  const pkSet = new Set(primaryKey)
  const editor = useDescriptionEditor()
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set())

  const toggleExpanded = (colName: string) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(colName)) next.delete(colName)
      else next.add(colName)
      return next
    })
  }

  const profileMap = new Map(
    (profile?.columns ?? []).map((cp) => [cp.columnName, cp])
  )

  return (
    <div className="overflow-auto max-h-[400px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[var(--card)] z-10">
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-1.5 px-2 text-[11px] font-medium text-[var(--muted-foreground)]">
              Column
            </th>
            <th className="text-left py-1.5 px-2 text-[11px] font-medium text-[var(--muted-foreground)]">
              Type
            </th>
            <th className="text-center py-1.5 px-1 text-[11px] font-medium text-[var(--muted-foreground)] w-10" title="Nullable">
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
            const fkTarget = fkTargetMap?.get(col.name)

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
                    {/* Column name + FK link + description */}
                    <div className="flex-1 py-1.5 px-2">
                      {/* Line 1: column metadata */}
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
                        {isIdColumn && !colProfile && !fkTarget && (
                          <span title={`May contain ${NOVALUE_SENTINEL} for missing references`}>
                            <span className="text-[var(--muted-foreground)] opacity-40 text-[10px]">ℹ</span>
                          </span>
                        )}
                        {isIdColumn && colProfile && profile && (
                          <NoValueBadge columnProfile={colProfile} sampleSize={profile.sampleSize} />
                        )}
                        {/* FK link */}
                        {fkTarget && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onNavigate?.(fkTarget)
                            }}
                            className="inline-flex items-center gap-0.5 text-[10px] text-[var(--primary)] hover:underline cursor-pointer shrink-0"
                            title={`Navigate to ${fkTarget}`}
                          >
                            <ArrowRight className="h-2.5 w-2.5" />
                            {toHumanName(fkTarget)}
                          </button>
                        )}
                      </div>

                      {/* Line 2: description subtitle (always visible) */}
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
                            <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">
                              {col.description}
                            </p>
                          ) : (
                            <p className="text-[11px] text-[var(--muted-foreground)]/50 italic">
                              No description
                            </p>
                          )}
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
                    <div className="py-1.5 px-2 shrink-0">
                      <TypeBadge
                        baseType={col.keboolaBaseType}
                        nativeType={col.databaseNativeType}
                      />
                    </div>

                    {/* Nullable */}
                    <div className="py-1.5 px-1 shrink-0 w-10 text-center">
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
