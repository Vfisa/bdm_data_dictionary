import { Key, CircleDot } from 'lucide-react'
import { TypeBadge } from './TypeBadge'
import type { Column } from '@/lib/types'

interface ColumnTableProps {
  columns: Column[]
  primaryKey: string[]
}

export function ColumnTable({ columns, primaryKey }: ColumnTableProps) {
  const pkSet = new Set(primaryKey)

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
                  </div>
                  {col.description && (
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                      {col.description}
                    </p>
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
    </div>
  )
}
