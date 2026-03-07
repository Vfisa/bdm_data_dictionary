import { useEffect, useRef, useMemo, Fragment } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TableExpandedDetail } from './TableExpandedDetail'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { toHumanName } from '@/lib/human-name'
import type { TableSummary, MetadataResponse, Category } from '@/lib/types'
import type { SortField } from './SortControls'

interface TableListProps {
  tables: TableSummary[]
  onSelectTable: (tableName: string) => void
  searchQuery: string
  expandedTable: string | null
  metadata: MetadataResponse
  onNavigate: (tableName: string) => void
  onDescriptionUpdated?: () => void
  sortField: SortField
  collapsedGroups: Set<Category>
  onToggleGroup: (category: Category) => void
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

/** Group tables by category, preserving sort order within each group */
function groupByCategory(tables: TableSummary[]): { category: Category; tables: TableSummary[] }[] {
  const groups: { category: Category; tables: TableSummary[] }[] = []
  let current: { category: Category; tables: TableSummary[] } | null = null

  for (const table of tables) {
    if (!current || current.category !== table.category) {
      current = { category: table.category, tables: [] }
      groups.push(current)
    }
    current.tables.push(table)
  }

  return groups
}

function TableCard({
  table,
  searchQuery,
  isExpanded,
  expandedRef,
  onSelectTable,
  metadata,
  onNavigate,
  onDescriptionUpdated,
}: {
  table: TableSummary
  searchQuery: string
  isExpanded: boolean
  expandedRef: React.RefObject<HTMLDivElement | null>
  onSelectTable: (name: string) => void
  metadata: MetadataResponse
  onNavigate: (name: string) => void
  onDescriptionUpdated?: () => void
}) {
  const config = CATEGORY_CONFIG[table.category]
  const matchedCols = getMatchedColumns(table, searchQuery)

  return (
    <div
      ref={isExpanded ? expandedRef : undefined}
      className={`rounded-lg border transition-all ${
        isExpanded
          ? 'border-[var(--primary)]/50 ring-1 ring-[var(--primary)]/20 shadow-sm'
          : 'border-[var(--border)]'
      }`}
    >
      <button
        onClick={() => onSelectTable(table.name)}
        className={`w-full text-left px-3 py-2 transition-colors cursor-pointer group ${
          isExpanded
            ? 'bg-[var(--card)]'
            : 'bg-[var(--card)] hover:bg-[var(--muted)]'
        } ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
      >
        <div className="flex items-start gap-2">
          <div
            className="w-1 self-stretch rounded-full shrink-0"
            style={{ backgroundColor: config.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)]">
                {toHumanName(table.name)}
              </span>
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
}

export function TableList({
  tables,
  onSelectTable,
  searchQuery,
  expandedTable,
  metadata,
  onNavigate,
  onDescriptionUpdated,
  sortField,
  collapsedGroups,
  onToggleGroup,
}: TableListProps) {
  const expandedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (expandedTable && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [expandedTable])

  const groups = useMemo(
    () => (sortField === 'category' ? groupByCategory(tables) : null),
    [tables, sortField],
  )

  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[var(--muted-foreground)]">
          No tables match your filters
        </p>
      </div>
    )
  }

  // Grouped view (category sort)
  if (groups) {
    return (
      <div className="space-y-1">
        {groups.map((group) => {
          const config = CATEGORY_CONFIG[group.category]
          const isCollapsed = collapsedGroups.has(group.category)

          return (
            <Fragment key={group.category}>
              {/* Category group header */}
              <button
                onClick={() => onToggleGroup(group.category)}
                className="w-full flex items-center gap-2 py-1.5 px-1 cursor-pointer group/header"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                )}
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: config.color }}
                >
                  {config.groupLabel}
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  ({group.tables.length})
                </span>
                <div className="flex-1 border-b border-[var(--border)] ml-1" />
              </button>

              {/* Tables in this group */}
              {!isCollapsed && (
                <div className="space-y-1">
                  {group.tables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      searchQuery={searchQuery}
                      isExpanded={expandedTable === table.name}
                      expandedRef={expandedRef}
                      onSelectTable={onSelectTable}
                      metadata={metadata}
                      onNavigate={onNavigate}
                      onDescriptionUpdated={onDescriptionUpdated}
                    />
                  ))}
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    )
  }

  // Flat view (name/columns sort)
  return (
    <div className="space-y-1">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          searchQuery={searchQuery}
          isExpanded={expandedTable === table.name}
          expandedRef={expandedRef}
          onSelectTable={onSelectTable}
          metadata={metadata}
          onNavigate={onNavigate}
          onDescriptionUpdated={onDescriptionUpdated}
        />
      ))}
    </div>
  )
}
