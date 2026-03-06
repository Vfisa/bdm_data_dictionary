import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Maximize2, Download, CalendarDays, Image, FileCode, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORY_CONFIG, CATEGORY_ORDER } from '@/lib/constants'
import type { Category } from '@/lib/types'
import { timeAgo } from '@/lib/utils'

export type ExportFormat = 'png' | 'svg' | 'mermaid'

interface ErdToolbarProps {
  visibleCategories: Set<Category>
  onToggleCategory: (category: Category) => void
  lastRefresh: string | null
  isRefreshing: boolean
  onRefresh: () => void
  onFitView: () => void
  onExport: (format: ExportFormat) => void
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

        {/* Export dropdown */}
        <ExportDropdown onExport={onExport} />

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

/** Export format dropdown menu */
function ExportDropdown({ onExport }: { onExport: (format: ExportFormat) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        title="Export ERD"
      >
        <Download className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg py-1 z-50">
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] flex items-center gap-2"
            onClick={() => { onExport('png'); setOpen(false) }}
          >
            <Image className="h-3.5 w-3.5" />
            PNG (3x)
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] flex items-center gap-2"
            onClick={() => { onExport('svg'); setOpen(false) }}
          >
            <FileCode className="h-3.5 w-3.5" />
            SVG (vector)
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] flex items-center gap-2"
            onClick={() => { onExport('mermaid'); setOpen(false) }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Mermaid (.mmd)
          </button>
        </div>
      )}
    </div>
  )
}
