import { useMemo, useState, useRef, useEffect } from 'react'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { computeQAStats } from '@/lib/qa-stats'
import { formatNumber, formatBytes } from '@/lib/utils'
import type { MetadataResponse, StatsFilter } from '@/lib/types'

interface StatsDashboardProps {
  metadata: MetadataResponse
  activeFilter?: StatsFilter
  onFilterClick?: (filter: StatsFilter) => void
}

/** Cycle order for the ⚠ badge click */
const FILTER_CYCLE: StatsFilter[] = ['missingTableDesc', 'missingColDesc', 'emptyTables', null]

export function StatsDashboard({ metadata, activeFilter, onFilterClick }: StatsDashboardProps) {
  const stats = useMemo(() => computeQAStats(metadata.tables), [metadata.tables])
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPopover])

  const qaColor =
    stats.qaScore >= 80 ? 'text-green-500' :
    stats.qaScore >= 50 ? 'text-yellow-500' :
    'text-red-500'

  const qaBg =
    stats.qaScore >= 80 ? 'bg-green-500/15' :
    stats.qaScore >= 50 ? 'bg-yellow-500/15' :
    'bg-red-500/15'

  const totalIssues = stats.tablesWithoutDescription + stats.columnsWithoutDescription + stats.emptyTables

  // Cycle through stats filters on ⚠ badge click
  const handleIssuesClick = () => {
    if (!onFilterClick) return
    const currentIdx = FILTER_CYCLE.indexOf(activeFilter ?? null)
    const nextIdx = (currentIdx + 1) % FILTER_CYCLE.length
    onFilterClick(FILTER_CYCLE[nextIdx] ?? null)
  }

  // Active filter label
  const filterLabel =
    activeFilter === 'missingTableDesc' ? `${stats.tablesWithoutDescription} missing table desc` :
    activeFilter === 'missingColDesc' ? `${stats.columnsWithoutDescription} missing col desc` :
    activeFilter === 'emptyTables' ? `${stats.emptyTables} empty tables` :
    null

  // Total data size
  const totalBytes = useMemo(
    () => metadata.tables.reduce((sum, t) => sum + t.dataSizeBytes, 0),
    [metadata.tables],
  )

  return (
    <div className="flex items-center gap-2">
      {/* QA Score badge — hover/click shows popover */}
      <div className="relative" ref={triggerRef}>
        <button
          onClick={() => setShowPopover((v) => !v)}
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md
            ${qaBg} ${qaColor} cursor-pointer transition-all hover:opacity-80
          `}
        >
          <ShieldCheck className="h-3 w-3" />
          QA {stats.qaScore}%
        </button>

        {/* Popover */}
        {showPopover && (
          <div
            ref={popoverRef}
            className="absolute top-full mt-1.5 right-0 z-50 w-64 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg p-3 space-y-2"
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">Project Overview</p>
            <div className="text-xs text-[var(--muted-foreground)] space-y-1">
              <p>{stats.totalTables} tables · {formatNumber(stats.totalColumns)} columns</p>
              <p>{formatNumber(stats.totalRows)} total rows · {formatBytes(totalBytes)}</p>
            </div>
            {/* QA bar */}
            <div className="space-y-1">
              <p className={`text-xs font-medium ${qaColor}`}>QA Score: {stats.qaScore}%</p>
              <div className="h-1.5 w-full rounded-full bg-[var(--muted)]">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.qaScore >= 80 ? 'bg-green-500' :
                    stats.qaScore >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${stats.qaScore}%` }}
                />
              </div>
            </div>
            {/* Issues breakdown */}
            <div className="text-xs text-[var(--muted-foreground)] space-y-0.5">
              {stats.tablesWithoutDescription > 0 && (
                <p>⚠ {stats.tablesWithoutDescription} tables missing description</p>
              )}
              {stats.columnsWithoutDescription > 0 && (
                <p>⚠ {formatNumber(stats.columnsWithoutDescription)} columns missing description</p>
              )}
              {stats.emptyTables > 0 ? (
                <p>⚠ {stats.emptyTables} empty tables</p>
              ) : (
                <p className="text-green-500">✓ 0 empty tables</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Issues badge — click cycles through filters */}
      {totalIssues > 0 && (
        <button
          onClick={handleIssuesClick}
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md
            cursor-pointer transition-all
            ${activeFilter
              ? 'bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/30'
              : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/15'
            }
          `}
        >
          <AlertTriangle className="h-3 w-3" />
          {filterLabel || totalIssues}
          {activeFilter && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onFilterClick?.(null)
              }}
              className="ml-0.5 hover:text-orange-300 cursor-pointer"
            >
              ✕
            </span>
          )}
        </button>
      )}
    </div>
  )
}
