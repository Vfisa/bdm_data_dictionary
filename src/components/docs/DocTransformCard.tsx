import { ExternalLink, ArrowRight } from 'lucide-react'
import { COMPONENT_TYPE_COLORS, DEFAULT_TYPE_COLOR, deriveTypeLabel } from '@/lib/constants'
import { MarkdownContent } from '@/lib/markdown-components'
import type { ComponentConfig } from '@/lib/types'

interface DocTransformCardProps {
  config: ComponentConfig
  allExpanded: boolean
}

function TableChip({ tableId, variant }: { tableId: string; variant: 'input' | 'output' }) {
  const tableName = tableId.split('.').pop() || tableId
  const bucketId = tableId.split('.').slice(0, 2).join('.')

  const chipClass = variant === 'input'
    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'

  return (
    <a
      href={`#doc-bucket-${bucketId}`}
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-mono hover:underline cursor-pointer ${chipClass}`}
      onClick={(e) => {
        e.preventDefault()
        const el = document.getElementById(`doc-bucket-${bucketId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
    >
      {tableName}
    </a>
  )
}

export function DocTransformCard({ config }: DocTransformCardProps) {
  const typeLabel = deriveTypeLabel(config.componentId)
  const colors = COMPONENT_TYPE_COLORS[typeLabel] || DEFAULT_TYPE_COLOR

  const hasInputs = config.inputTables.length > 0
  const hasOutputs = config.outputTables.length > 0

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* 3-column I/O mapping grid */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Input Tables column */}
          <div className="min-w-0">
            {hasInputs && (
              <>
                <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                  Input Tables
                </div>
                <div className="flex flex-col gap-1">
                  {config.inputTables.map(t => (
                    <TableChip key={t} tableId={t} variant="input" />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Center: arrows + transformation name + type badge + link */}
          <div className="flex items-center gap-2">
            {hasInputs && (
              <span title="Flows into transformation">
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" aria-hidden="true" />
              </span>
            )}
            <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 min-w-[140px]">
              <span className="text-sm font-semibold text-[var(--foreground)] text-center leading-tight">
                {config.configName}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {typeLabel}
                </span>
                {config.keboolaUrl && (
                  <a
                    href={config.keboolaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                    title="Open in Keboola"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            {hasOutputs && (
              <span title="Produces output">
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" aria-hidden="true" />
              </span>
            )}
          </div>

          {/* Output Tables column */}
          <div className="min-w-0">
            {hasOutputs && (
              <>
                <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                  Output Tables
                </div>
                <div className="flex flex-col gap-1">
                  {config.outputTables.map(t => (
                    <TableChip key={t} tableId={t} variant="output" />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description below the grid */}
      {config.description && (
        <div className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
          <MarkdownContent content={config.description} />
        </div>
      )}
    </div>
  )
}
