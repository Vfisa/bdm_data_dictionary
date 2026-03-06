import { RefreshCw, Maximize2, Download, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORY_CONFIG, CATEGORY_ORDER } from '@/lib/constants'
import type { Category } from '@/lib/types'
import { timeAgo } from '@/lib/utils'

interface ErdToolbarProps {
  visibleCategories: Set<Category>
  onToggleCategory: (category: Category) => void
  lastRefresh: string | null
  isRefreshing: boolean
  onRefresh: () => void
  onFitView: () => void
  onExport: () => void
  tableCount: number
  edgeCount: number
  showDateLinks: boolean
  onToggleDateLinks: () => void
  hasDateEdges: boolean
}

export function ErdToolbar({
  visibleCategories,
  onToggleCategory,
  lastRefresh,
  isRefreshing,
  onRefresh,
  onFitView,
  onExport,
  tableCount,
  edgeCount,
  showDateLinks,
  onToggleDateLinks,
  hasDateEdges,
}: ErdToolbarProps) {
  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-3 pointer-events-none">
      {/* Left: Category filter toggles */}
      <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
        {CATEGORY_ORDER.map((cat) => {
          const config = CATEGORY_CONFIG[cat]
          const isVisible = visibleCategories.has(cat)
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className={`
                inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md
                border transition-all cursor-pointer
                ${isVisible
                  ? 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'border-transparent bg-[var(--muted)] text-[var(--muted-foreground)] opacity-60'
                }
              `}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: isVisible ? config.color : 'var(--muted-foreground)',
                  opacity: isVisible ? 1 : 0.4,
                }}
              />
              {config.label}
            </button>
          )
        })}

        {/* Date Links toggle */}
        {hasDateEdges && (
          <button
            onClick={onToggleDateLinks}
            className={`
              inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md
              border transition-all cursor-pointer
              ${showDateLinks
                ? 'border-purple-400/30 bg-purple-500/10 text-purple-400 shadow-sm'
                : 'border-transparent bg-[var(--muted)] text-[var(--muted-foreground)] opacity-60'
              }
            `}
            title="Toggle assumed date connections to DIM_DATE"
          >
            <CalendarDays className="h-3 w-3" />
            Date Links
          </button>
        )}
      </div>

      {/* Right: Stats, refresh, export, fit-view */}
      <div className="flex items-center gap-2 pointer-events-auto shrink-0">
        {/* Stats */}
        <span className="text-[11px] text-[var(--muted-foreground)] hidden md:inline">
          {tableCount} tables &middot; {edgeCount} edges
        </span>

        {/* Last refresh time */}
        {lastRefresh && (
          <span className="text-[11px] text-[var(--muted-foreground)] hidden lg:inline">
            {timeAgo(lastRefresh)}
          </span>
        )}

        {/* Refresh button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh metadata from Keboola"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>

        {/* Export button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          title="Export ERD as PNG"
        >
          <Download className="h-4 w-4" />
        </Button>

        {/* Fit view button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onFitView}
          title="Fit diagram to view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
