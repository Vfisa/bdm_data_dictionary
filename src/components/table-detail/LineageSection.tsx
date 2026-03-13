import { CheckCircle2, XCircle, AlertTriangle, Minus, GitBranch } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import type { LineageEntry, LineageIndex } from '@/lib/types'

interface LineageSectionProps {
  tableId: string
  lineage: LineageIndex
}

/**
 * Renders the Lineage section showing transformations that produce or consume a table.
 * Displayed in both Table Browser expanded detail and ERD floating panel.
 */
export function LineageSection({ tableId, lineage }: LineageSectionProps) {
  const producedBy = lineage.producedBy[tableId] || []
  const usedBy = lineage.usedBy[tableId] || []
  const totalCount = producedBy.length + usedBy.length

  return (
    <div className="space-y-3">
      {totalCount === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)] italic py-1">
          No transformations reference this table
        </p>
      ) : (
        <>
          {/* Created by (output-of) */}
          {producedBy.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Created by ({producedBy.length})
              </h4>
              <div className="space-y-0.5">
                {producedBy.map((entry) => (
                  <LineageRow key={`prod-${entry.configId}`} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {/* Used by (input-to) */}
          {usedBy.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Used by ({usedBy.length})
              </h4>
              <div className="space-y-0.5">
                {usedBy.map((entry) => (
                  <LineageRow key={`used-${entry.configId}`} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Status icon for last run */
function RunStatusIcon({ status }: { status: LineageEntry['lastRunStatus'] }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
    case 'error':
      return <XCircle className="h-3 w-3 text-red-500 shrink-0" />
    case 'warning':
      return <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />
    default:
      return <Minus className="h-3 w-3 text-[var(--muted-foreground)] shrink-0" />
  }
}

/** Color config for component type badges */
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  SQL: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6' },   // blue
  PY:  { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },   // amber
  dbt: { bg: 'rgba(239, 68, 68, 0.12)',  text: '#ef4444' },    // red
}
const DEFAULT_TYPE_COLOR = { bg: 'rgba(107, 114, 128, 0.12)', text: '#6b7280' } // gray

/** Component type badge with semantic colors */
function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_COLORS[type] || DEFAULT_TYPE_COLOR
  return (
    <span
      className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {type}
    </span>
  )
}

/** Keboola octopus logo — transparent background, blue octopus */
function KeboolaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Octopus head */}
      <ellipse cx="12" cy="8" rx="4.5" ry="5.2" fill="#2F8CFF" />
      {/* Eyes */}
      <circle cx="10.3" cy="9.8" r="0.9" fill="white" />
      <circle cx="13.7" cy="9.8" r="0.9" fill="white" />
      {/* Smile */}
      <path d="M10.2 11.8c0 0 0.8 1.1 1.8 1.1s1.8-1.1 1.8-1.1" stroke="white" strokeWidth="0.7" strokeLinecap="round" fill="none" />
      {/* Tentacles — 6 legs spreading outward */}
      <path d="M8.2 12.5C6.8 14.2 5.2 16.8 4 19" stroke="#2F8CFF" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.8 13.2C9.2 15 8.2 17.5 7.5 19.5" stroke="#2F8CFF" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11.3 13.5C11.1 15.5 10.8 17.8 10.5 20" stroke="#2F8CFF" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.7 13.5C12.9 15.5 13.2 17.8 13.5 20" stroke="#2F8CFF" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14.2 13.2C14.8 15 15.8 17.5 16.5 19.5" stroke="#2F8CFF" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15.8 12.5C17.2 14.2 18.8 16.8 20 19" stroke="#2F8CFF" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Single lineage row — transformation name + metadata */
function LineageRow({ entry }: { entry: LineageEntry }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[var(--muted)] transition-colors group">
      <TypeBadge type={entry.componentType} />
      <a
        href={entry.keboolaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-[var(--primary)] hover:underline truncate"
        title={`Open ${entry.configName} in Keboola`}
      >
        {entry.configName}
      </a>
      <span className="inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
        <KeboolaIcon className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1" />
      <span className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap hidden sm:inline">
        {entry.lastChangeDate ? timeAgo(entry.lastChangeDate) : '—'}
      </span>
      <RunStatusIcon status={entry.lastRunStatus} />
      <span className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap hidden sm:inline">
        {entry.lastRunDate ? timeAgo(entry.lastRunDate) : 'never'}
      </span>
    </div>
  )
}

/** Section header with icon and count — for use in parent components */
export function LineageSectionHeader({ count }: { count: number }) {
  return (
    <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <GitBranch className="h-4 w-4" />
      Lineage ({count})
    </h3>
  )
}

/** Larger section header matching ERD panel style */
export function LineageSectionHeaderLg({ count }: { count: number }) {
  return (
    <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <GitBranch className="h-4 w-4" />
      Lineage ({count})
    </h3>
  )
}
