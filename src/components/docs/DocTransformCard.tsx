import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react'
import type { ComponentConfig } from '@/lib/types'

interface DocTransformCardProps {
  config: ComponentConfig
  allExpanded: boolean
}

export function DocTransformCard({ config, allExpanded }: DocTransformCardProps) {
  const [open, setOpen] = useState(false)
  const isOpen = allExpanded || open

  // Derive short type label from componentId
  const typeLabel = deriveTypeLabel(config.componentId)

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
        <span className="rounded px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
          {typeLabel}
        </span>
        <span className="text-sm font-medium text-[var(--foreground)]">{config.configName}</span>
        {config.keboolaUrl && (
          <a
            href={config.keboolaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[var(--primary)] hover:underline"
            onClick={(e) => e.stopPropagation()}
            title="Open in Keboola"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </button>

      {isOpen && (
        <div className="border-t border-[var(--border)] px-3 py-2 space-y-2 text-xs">
          {/* Description / Logic */}
          {config.description && (
            <p className="text-[var(--muted-foreground)]">{config.description}</p>
          )}

          {/* I/O Mapping */}
          {(config.inputTables.length > 0 || config.outputTables.length > 0) && (
            <div className="space-y-1">
              <div className="font-medium text-[var(--muted-foreground)]">Data Flow:</div>
              <div className="flex items-start gap-2 flex-wrap text-[var(--muted-foreground)]">
                {config.inputTables.length > 0 && (
                  <div className="space-y-0.5">
                    {config.inputTables.map(t => (
                      <div key={t} className="font-mono text-[11px]">{t.split('.').pop()}</div>
                    ))}
                  </div>
                )}
                {config.inputTables.length > 0 && config.outputTables.length > 0 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] mt-0.5" />
                )}
                {config.outputTables.length > 0 && (
                  <div className="space-y-0.5">
                    {config.outputTables.map(t => (
                      <div key={t} className="font-mono text-[11px] font-medium text-[var(--foreground)]">{t.split('.').pop()}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function deriveTypeLabel(componentId: string): string {
  const id = componentId.toLowerCase()
  if (id.includes('snowflake')) return 'SQL'
  if (id.includes('synapse')) return 'SQL'
  if (id.includes('bigquery')) return 'SQL'
  if (id.includes('redshift')) return 'SQL'
  if (id.includes('python')) return 'PY'
  if (id.includes('julia')) return 'JL'
  if (id.includes('r-transformation') || id.includes('.r-')) return 'R'
  if (id.includes('dbt')) return 'dbt'
  if (id.includes('openrefine')) return 'OR'
  return 'SQL'
}
