import { useEffect, useRef } from 'react'
import { Columns3, Rows3, HardDrive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TagChips } from '@/components/tags/TagEditor'
import { TableExpandedDetail } from './TableExpandedDetail'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { formatNumber, formatBytes } from '@/lib/utils'
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
    .slice(0, 3) // max 3 shown
}

export function TableList({ tables, onSelectTable, searchQuery, expandedTable, metadata, onNavigate, onDescriptionUpdated }: TableListProps) {
  const expandedRef = useRef<HTMLDivElement | null>(null)

  // Scroll expanded table into view
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
    <div className="space-y-2">
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
            <button
              onClick={() => onSelectTable(table.name)}
              className={`w-full text-left p-3 transition-colors cursor-pointer group ${
                isExpanded
                  ? 'bg-[var(--card)]'
                  : 'bg-[var(--card)] hover:bg-[var(--muted)]'
              } ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
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
                    <div className="min-w-0">
                      <span className="text-base font-medium text-[var(--foreground)] truncate block group-hover:text-[var(--primary)]">
                        {toHumanName(table.name)}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--muted-foreground)] truncate block">
                        {table.name}
                      </span>
                    </div>
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
