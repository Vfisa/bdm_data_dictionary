import { ExternalLink, CheckCircle2, XCircle, AlertTriangle, Minus, GitBranch } from 'lucide-react'
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

/** Component type badge */
function TypeBadge({ type }: { type: string }) {
  return (
    <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0">
      {type}
    </span>
  )
}

/** Single lineage row — transformation name + metadata */
function LineageRow({ entry }: { entry: LineageEntry }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--muted)] transition-colors group">
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
        <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)]" />
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
    <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <span title="Transformation Lineage">
        <GitBranch className="h-3.5 w-3.5" />
      </span>
      Lineage ({count})
    </h3>
  )
}
