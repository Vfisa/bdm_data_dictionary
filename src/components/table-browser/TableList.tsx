import { useEffect, useRef } from 'react'
import { TableExpandedDetail } from './TableExpandedDetail'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { toHumanName } from '@/lib/human-name'
import type { TableSummary, MetadataResponse } from '@/lib/types'

interface TableListProps {
  tables: TableSummary[]
  onSelectTable: (tableName: string) => void
  searchQuery: string
  expandedTable: string | null
  metadata: MetadataResponse
  onNavigate: (tableName: string) => void
  onDescriptionUpdated?: () => void
}

/** Find matching column names for search highlighting */
function getMatchedColumns(table: TableSummary, query: string): string[] {
  if (!query) return []
  const q = query.toLowerCase()
  return table.columns
    .filter((col) => col.name.toLowerCase().includes(q))
    .map((col) => col.name)
    .slice(0, 3)
}

export function TableList({ tables, onSelectTable, searchQuery, expandedTable, metadata, onNavigate, onDescriptionUpdated }: TableListProps) {
  const expandedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (expandedTable && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [expandedTable])

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
    <div className="space-y-1">
      {tables.map((table) => {
        const config = CATEGORY_CONFIG[table.category]
        const matchedCols = getMatchedColumns(table, searchQuery)
        const isExpanded = expandedTable === table.name

        return (
          <div
            key={table.id}
            ref={isExpanded ? expandedRef : undefined}
            className={`rounded-lg border transition-all ${
              isExpanded
                ? 'border-[var(--primary)]/50 ring-1 ring-[var(--primary)]/20 shadow-sm'
                : 'border-[var(--border)]'
            }`}
          >
            {/* Collapsed card — ~52px: name + description subtitle + column count */}
            <button
              onClick={() => onSelectTable(table.name)}
              className={`w-full text-left px-3 py-2 transition-colors cursor-pointer group ${
                isExpanded
                  ? 'bg-[var(--card)]'
                  : 'bg-[var(--card)] hover:bg-[var(--muted)]'
              } ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
            >
              <div className="flex items-start gap-2">
                {/* Category color bar */}
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Line 1: Table name + column count */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)]">
                      {toHumanName(table.name)}
                    </span>

                    {/* Matched columns indicator */}
                    {matchedCols.length > 0 && (
                      <span className="text-[10px] text-[var(--primary)] font-medium shrink-0">
                        {matchedCols.join(', ')}
                        {table.columns.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 3 && '…'}
                      </span>
                    )}

                    <span className="text-xs text-[var(--muted-foreground)] ml-auto shrink-0">
                      {table.columnCount} columns
                    </span>
                  </div>

                  {/* Line 2: Description subtitle */}
                  {table.description ? (
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {table.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--muted-foreground)]/50 italic">
                      No description
                    </p>
                  )}
                </div>
              </div>
            </button>

            {/* Inline expanded detail */}
            {isExpanded && (
              <TableExpandedDetail
                table={table}
                metadata={metadata}
                onNavigate={onNavigate}
                onDescriptionUpdated={onDescriptionUpdated}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
