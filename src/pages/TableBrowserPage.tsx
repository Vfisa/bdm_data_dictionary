import { useState, useMemo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CategoryFilter } from '@/components/table-browser/CategoryFilter'
import { SortControls, type SortField, type SortDirection } from '@/components/table-browser/SortControls'
import { TableList } from '@/components/table-browser/TableList'
import { StatsDashboard } from '@/components/table-browser/StatsDashboard'
import { CATEGORY_ORDER, CATEGORY_SORT_PRIORITY, TAG_CONFIG } from '@/lib/constants'
import { toHumanName } from '@/lib/human-name'
import type { MetadataResponse, Category, StatsFilter } from '@/lib/types'

interface TableBrowserPageProps {
  metadata: MetadataResponse
  onDescriptionUpdated?: () => void
}

export function TableBrowserPage({ metadata, onDescriptionUpdated }: TableBrowserPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCategories, setVisibleCategories] = useState<Set<Category>>(
    () => new Set(CATEGORY_ORDER),
  )
  const [sortField, setSortField] = useState<SortField>('category')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)
  const [activeStatsFilter, setActiveStatsFilter] = useState<StatsFilter>(null)

  // Toggle category filter
  const toggleCategory = useCallback((category: Category) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        if (next.size > 1) next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  // Handle sort toggle (click same field → flip direction, new field → asc)
  const handleSortChange = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortDirection(field === 'name' || field === 'category' ? 'asc' : 'desc')
      }
      return field
    })
  }, [])

  // Count tables per category (unfiltered)
  const tableCounts = useMemo(() => {
    const counts = {} as Record<Category, number>
    for (const cat of CATEGORY_ORDER) counts[cat] = 0
    for (const t of metadata.tables) {
      counts[t.category] = (counts[t.category] || 0) + 1
    }
    return counts
  }, [metadata.tables])

  // Collect all unique tags across tables
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const t of metadata.tables) {
      for (const tag of (t.tags || [])) tagSet.add(tag)
    }
    return Array.from(tagSet).sort()
  }, [metadata.tables])

  // Filter + sort tables
  const filteredTables = useMemo(() => {
    const q = searchQuery.toLowerCase()

    let tables = metadata.tables.filter((t) => {
      // Category filter
      if (!visibleCategories.has(t.category)) return false

      // Tag filter
      if (activeTagFilter && !(t.tags || []).includes(activeTagFilter)) return false

      // Stats KPI filter
      if (activeStatsFilter === 'missingTableDesc' && t.description) return false
      if (activeStatsFilter === 'missingColDesc' && !t.columns.some((c) => !c.description)) return false
      if (activeStatsFilter === 'emptyTables' && t.rowsCount > 0) return false

      // Search filter: match table name, human name, OR column names
      if (q) {
        const nameMatch = t.name.toLowerCase().includes(q)
        const humanMatch = toHumanName(t.name).toLowerCase().includes(q)
        const columnMatch = t.columns.some((c) =>
          c.name.toLowerCase().includes(q),
        )
        if (!nameMatch && !humanMatch && !columnMatch) return false
      }

      return true
    })

    // Sort
    tables = [...tables].sort((a, b) => {
      let cmp: number
      switch (sortField) {
        case 'category': {
          cmp = (CATEGORY_SORT_PRIORITY[a.category] ?? 6) - (CATEGORY_SORT_PRIORITY[b.category] ?? 6)
          if (cmp === 0) cmp = a.name.localeCompare(b.name)
          break
        }
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'columnCount':
          cmp = a.columnCount - b.columnCount
          break
        default:
          cmp = 0
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return tables
  }, [metadata.tables, searchQuery, visibleCategories, activeTagFilter, activeStatsFilter, sortField, sortDirection])

  // Table selection for detail panel
  const handleSelectTable = useCallback((tableName: string) => {
    setSelectedTable((prev) => (prev === tableName ? null : tableName))
  }, [])

  return (
    <div className="relative h-full flex flex-col">
      {/* Toolbar — 2 rows */}
      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--card)] px-4 py-2 space-y-1.5">
        {/* Row 1: Search + Category chips */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-7 text-sm"
            />
          </div>
          <CategoryFilter
            visibleCategories={visibleCategories}
            onToggleCategory={toggleCategory}
            tableCounts={tableCounts}
          />
        </div>

        {/* Row 2: Sort + QA badge + Issues badge + Tag filters + Results count */}
        <div className="flex items-center gap-2">
          <SortControls
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Results count */}
          <p className="text-[11px] text-[var(--muted-foreground)] shrink-0">
            {filteredTables.length} of {metadata.tables.length}
          </p>

          {/* QA + Issues badges */}
          <StatsDashboard metadata={metadata} activeFilter={activeStatsFilter} onFilterClick={setActiveStatsFilter} />

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1">
              {allTags.map((tag) => {
                const isActive = activeTagFilter === tag
                const tagConfig = TAG_CONFIG[tag as keyof typeof TAG_CONFIG]
                const color = tagConfig?.color || '#8b5cf6'
                const bg = tagConfig?.bg || '#8b5cf618'
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTagFilter(isActive ? null : tag)}
                    className={`
                      px-1.5 py-0.5 text-[11px] font-medium rounded-md border cursor-pointer transition-all
                      ${isActive ? 'ring-1 ring-offset-1 ring-offset-[var(--background)]' : 'opacity-60 hover:opacity-100'}
                    `}
                    style={{
                      backgroundColor: bg,
                      color: color,
                      borderColor: `${color}30`,
                      ...(isActive ? { ringColor: color } : {}),
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
              {activeTagFilter && (
                <button
                  onClick={() => setActiveTagFilter(null)}
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <TableList
          tables={filteredTables}
          onSelectTable={handleSelectTable}
          searchQuery={searchQuery}
          expandedTable={selectedTable}
          metadata={metadata}
          onNavigate={handleSelectTable}
          onDescriptionUpdated={onDescriptionUpdated}
        />
      </div>
    </div>
  )
}
