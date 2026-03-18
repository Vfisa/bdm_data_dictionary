import { useState, useEffect, useRef } from 'react'
import { ExternalLink, ArrowRight, Settings, Code2, ChevronRight } from 'lucide-react'
import { COMPONENT_TYPE_COLORS, DEFAULT_TYPE_COLOR, deriveTypeLabel } from '@/lib/constants'
import { MarkdownContent } from '@/lib/markdown-components'
import type { ComponentConfig } from '@/lib/types'

interface DocTransformCardProps {
  config: ComponentConfig
  allExpanded: boolean
  tableUrlMap: Map<string, string>
}

function TableChip({
  tableId,
  variant,
  keboolaUrl,
}: {
  tableId: string
  variant: 'input' | 'output'
  keboolaUrl?: string
}) {
  const tableName = tableId.split('.').pop() || tableId
  const bucketId = tableId.split('.').slice(0, 2).join('.')

  const chipClass = variant === 'input'
    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'

  return (
    <span className="inline-flex items-center gap-0.5">
      <a
        href={`#doc-bucket-${bucketId}`}
        className={`rounded px-2 py-0.5 text-xs font-mono hover:underline cursor-pointer ${chipClass}`}
        onClick={(e) => {
          e.preventDefault()
          const el = document.getElementById(`doc-bucket-${bucketId}`)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      >
        {tableName}
      </a>
      {keboolaUrl && (
        <a
          href={keboolaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--muted-foreground)] hover:text-[var(--primary)] opacity-60 hover:opacity-100"
          title="Open table in Keboola"
        >
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
    </span>
  )
}

export function DocTransformCard({ config, allExpanded, tableUrlMap }: DocTransformCardProps) {
  const [expanded, setExpanded] = useState(true)
  const prevAllExpanded = useRef(allExpanded)
  const typeLabel = deriveTypeLabel(config.componentId)
  const colors = COMPONENT_TYPE_COLORS[typeLabel] || DEFAULT_TYPE_COLOR

  // Sync with allExpanded toggle — only react to actual changes
  useEffect(() => {
    if (prevAllExpanded.current !== allExpanded) {
      prevAllExpanded.current = allExpanded
      setExpanded(allExpanded)
    }
  }, [allExpanded])

  const hasInputs = config.inputTables.length > 0
  const hasOutputs = config.outputTables.length > 0
  const hasVariables = config.variables && config.variables.length > 0
  const hasSharedCode = !!config.sharedCodeId
  const hasBody = config.description || hasInputs || hasOutputs || hasVariables || hasSharedCode

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Header: chevron + type badge + name + table counts + external link */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 gap-3 text-left hover:bg-[var(--accent)]/30 transition-colors rounded-t-lg"
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span title={expanded ? 'Collapse' : 'Expand'}>
            <ChevronRight
              className={`h-4 w-4 text-[var(--muted-foreground)] shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </span>
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {typeLabel}
          </span>
          <span className="font-semibold text-[var(--foreground)] truncate">
            {config.configName}
          </span>
          {!expanded && (hasInputs || hasOutputs) && (
            <span className="text-xs text-[var(--muted-foreground)] shrink-0">
              {hasInputs ? `${config.inputTables.length} in` : ''}
              {hasInputs && hasOutputs ? ' / ' : ''}
              {hasOutputs ? `${config.outputTables.length} out` : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {config.keboolaUrl && (
            <a
              href={config.keboolaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline flex items-center gap-1 text-xs"
              title="Open in Keboola"
            >
              <span className="hidden sm:inline">Open</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </button>

      {/* Collapsible body */}
      {expanded && hasBody && (
        <div className="border-t border-[var(--border)]">
          {/* Description subtitle */}
          {config.description && (
            <div className="px-4 py-3 pl-10 text-xs text-[var(--muted-foreground)] leading-relaxed">
              <MarkdownContent content={config.description} />
            </div>
          )}

          {/* I/O Flow Diagram */}
          {(hasInputs || hasOutputs) && (
            <div className="border-t border-[var(--border)] px-4 py-3">
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
                          <TableChip key={t} tableId={t} variant="input" keboolaUrl={tableUrlMap.get(t)} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Center: arrows + mini type node */}
                <div className="flex items-center gap-2">
                  {hasInputs && (
                    <span title="Flows into transformation">
                      <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" aria-hidden="true" />
                    </span>
                  )}
                  <span
                    className="rounded-md border px-2 py-1 text-[10px] font-bold shrink-0"
                    style={{ borderColor: colors.text, color: colors.text }}
                  >
                    {typeLabel}
                  </span>
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
                          <TableChip key={t} tableId={t} variant="output" keboolaUrl={tableUrlMap.get(t)} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer: variables + shared code */}
          {(hasVariables || hasSharedCode) && (
            <div className="border-t border-[var(--border)] px-4 py-2 space-y-1">
              {hasVariables && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <span title="Variables">
                    <Settings className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </span>
                  <span className="font-mono truncate">
                    {config.variables!.map(v => `${v.name}=${v.value}`).join(', ')}
                  </span>
                </div>
              )}
              {hasSharedCode && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <span title="Shared code">
                    <Code2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </span>
                  <span>Shared: {config.sharedCodeName || config.sharedCodeId}</span>
                  {config.sharedCodeUrl && (
                    <a
                      href={config.sharedCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline"
                      title="Open shared code in Keboola"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
