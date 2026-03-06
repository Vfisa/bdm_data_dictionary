import { Columns3, Rows3, HardDrive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TagChips } from '@/components/tags/TagEditor'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { formatNumber, formatBytes } from '@/lib/utils'
import type { TableSummary } from '@/lib/types'

interface TableListProps {
  tables: TableSummary[]
  onSelectTable: (tableName: string) => void
  searchQuery: string
}

/** Find matching column names for search highlighting */
function getMatchedColumns(table: TableSummary, query: string): string[] {
  if (!query) return []
  const q = query.toLowerCase()
  return table.columns
    .filter((col) => col.name.toLowerCase().includes(q))
    .map((col) => col.name)
    .slice(0, 3) // max 3 shown
}

export function TableList({ tables, onSelectTable, searchQuery }: TableListProps) {
  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[var(--muted-foreground)]">
          No tables match your filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tables.map((table) => {
        const config = CATEGORY_CONFIG[table.category]
        const matchedCols = getMatchedColumns(table, searchQuery)

        return (
          <button
            key={table.id}
            onClick={() => onSelectTable(table.name)}
            className="w-full text-left p-3 rounded-lg border border-[var(--border)]
              bg-[var(--card)] hover:bg-[var(--muted)] transition-colors cursor-pointer
              group"
          >
            <div className="flex items-start gap-3">
              {/* Category color indicator */}
              <div
                className="w-1 h-full min-h-[40px] rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: config.color }}
              />

              <div className="flex-1 min-w-0">
                {/* Header: badge + name */}
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className="shrink-0"
                    style={{
                      backgroundColor: `${config.color}18`,
                      color: config.color,
                      borderColor: `${config.color}30`,
                    }}
                  >
                    {table.category}
                  </Badge>
                  <span className="text-base font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)]">
                    {table.name}
                  </span>
                </div>

                {/* Description */}
                {table.description ? (
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-1">
                    {table.description}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic mb-1">
                    No description
                  </p>
                )}

                {/* Tags */}
                {table.tags && table.tags.length > 0 && (
                  <div className="mb-1.5">
                    <TagChips tags={table.tags} />
                  </div>
                )}

                {/* Stats + matched columns */}
                <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Columns3 className="h-3 w-3" />
                    {table.columnCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Rows3 className="h-3 w-3" />
                    {formatNumber(table.rowsCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatBytes(table.dataSizeBytes)}
                  </span>

                  {/* Matched column indicator */}
                  {matchedCols.length > 0 && (
                    <span className="text-[var(--primary)] font-medium">
                      Matched: {matchedCols.join(', ')}
                      {table.columns.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 3 && '...'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
