import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Key, ArrowRight, ArrowLeft } from 'lucide-react'
import { toHumanName } from '@/lib/human-name'
import { formatNumber, formatBytes, timeAgo } from '@/lib/utils'
import { CATEGORY_CONFIG } from '@/lib/constants'
import type { TableSummary, Edge, LineageEntry } from '@/lib/types'

interface DocTableCardProps {
  table: TableSummary
  outgoing: Edge[]
  incoming: Edge[]
  producedBy: LineageEntry[]
  usedBy: LineageEntry[]
  allExpanded: boolean
}

export function DocTableCard({
  table,
  outgoing,
  incoming,
  producedBy,
  usedBy,
  allExpanded,
}: DocTableCardProps) {
  const [open, setOpen] = useState(false)
  const isOpen = allExpanded || open
  const catConfig = CATEGORY_CONFIG[table.category]

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--card)]">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        )}
        <span
          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: catConfig.color }}
        >
          {catConfig.shortCode}
        </span>
        <span className="text-sm font-medium text-[var(--foreground)]">{toHumanName(table.name)}</span>
        <span className="text-xs text-[var(--muted-foreground)]">{table.name}</span>
        <span className="ml-auto flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span>{table.columnCount} cols</span>
          <span>{formatNumber(table.rowsCount)} rows</span>
          <span>{formatBytes(table.dataSizeBytes)}</span>
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-[var(--border)] px-3 py-2 space-y-2 text-xs">
          {/* Description */}
          {table.description && (
            <p className="text-[var(--muted-foreground)]">{table.description}</p>
          )}

          {/* Tags */}
          {table.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {table.tags.map(tag => (
                <span key={tag} className="rounded px-1.5 py-0.5 bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
            {table.lastImportDate && (
              <span>Last import: {timeAgo(table.lastImportDate)}</span>
            )}
            {table.keboolaUrl && (
              <a
                href={table.keboolaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline inline-flex items-center gap-1"
              >
                Open in Keboola <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Primary key */}
          {table.primaryKey.length > 0 && (
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <span title="Primary key">
                <Key className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="font-medium">PK:</span>
              {table.primaryKey.join(', ')}
            </div>
          )}

          {/* FK relationships */}
          {outgoing.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--muted-foreground)]">References (outgoing):</div>
              {outgoing.map(e => (
                <div key={e.id} className="flex items-center gap-1 text-[var(--muted-foreground)] pl-2">
                  <ArrowRight className="h-3 w-3 text-blue-400" />
                  <span>{e.sourceColumn}</span>
                  <span className="text-[var(--muted-foreground)]">&rarr;</span>
                  <span className="font-medium">{e.target}</span>.{e.targetColumn}
                </div>
              ))}
            </div>
          )}
          {incoming.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--muted-foreground)]">Referenced by (incoming):</div>
              {incoming.map(e => (
                <div key={e.id} className="flex items-center gap-1 text-[var(--muted-foreground)] pl-2">
                  <ArrowLeft className="h-3 w-3 text-green-400" />
                  <span className="font-medium">{e.source}</span>.{e.sourceColumn}
                  <span className="text-[var(--muted-foreground)]">&rarr;</span>
                  <span>{e.targetColumn}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lineage */}
          {producedBy.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--muted-foreground)]">Produced by:</div>
              {producedBy.map(l => (
                <div key={`${l.componentId}-${l.configId}`} className="flex items-center gap-1 pl-2 text-[var(--muted-foreground)]">
                  <span className="rounded px-1 py-0.5 bg-[var(--accent)] text-[10px] font-medium">{l.componentType}</span>
                  <span>{l.configName}</span>
                  {l.keboolaUrl && (
                    <a href={l.keboolaUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {usedBy.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--muted-foreground)]">Used by:</div>
              {usedBy.map(l => (
                <div key={`${l.componentId}-${l.configId}`} className="flex items-center gap-1 pl-2 text-[var(--muted-foreground)]">
                  <span className="rounded px-1 py-0.5 bg-[var(--accent)] text-[10px] font-medium">{l.componentType}</span>
                  <span>{l.configName}</span>
                  {l.keboolaUrl && (
                    <a href={l.keboolaUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
