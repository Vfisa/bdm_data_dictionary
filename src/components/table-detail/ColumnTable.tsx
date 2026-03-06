import { Key, CircleDot, Info, Pencil } from 'lucide-react'
import { useState } from 'react'
import { TypeBadge } from './TypeBadge'
import { InlineEditor } from '@/components/ui/InlineEditor'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDescriptionEditor } from '@/hooks/useDescriptionEditor'
import type { Column } from '@/lib/types'
import { NOVALUE_SENTINEL } from '@/lib/qa-stats'

interface ColumnTableProps {
  columns: Column[]
  primaryKey: string[]
  tableId?: string
  onDescriptionUpdated?: () => void
}

export function ColumnTable({ columns, primaryKey, tableId, onDescriptionUpdated }: ColumnTableProps) {
  const pkSet = new Set(primaryKey)
  const editor = useDescriptionEditor()
  const [editingColumn, setEditingColumn] = useState<string | null>(null)

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
            return (
              <tr
                key={col.name}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors"
              >
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5">
                    {isPK && (
                      <span title="Primary Key"><Key className="h-3 w-3 text-amber-500 shrink-0" /></span>
                    )}
                    <span className={`font-mono text-xs ${isPK ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--foreground)]'}`}>
                      {col.name}
                    </span>
                    {isIdColumn && !isPK && (
                      <span title={`May contain ${NOVALUE_SENTINEL} for missing references`}>
                        <Info className="h-3 w-3 text-[var(--muted-foreground)] opacity-40 shrink-0" />
                      </span>
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
                </td>
                <td className="py-2 px-2">
                  <TypeBadge
                    baseType={col.keboolaBaseType}
                    nativeType={col.databaseNativeType}
                  />
                </td>
                <td className="py-2 px-1 text-center">
                  {col.nullable ? (
                    <span title="Nullable"><CircleDot className="h-3 w-3 text-[var(--muted-foreground)] mx-auto" /></span>
                  ) : (
                    <span className="text-[10px] text-[var(--muted-foreground)]">-</span>
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
