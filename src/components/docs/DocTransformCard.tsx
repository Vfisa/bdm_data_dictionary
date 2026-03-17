import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react'
import { COMPONENT_TYPE_COLORS, DEFAULT_TYPE_COLOR, deriveTypeLabel } from '@/lib/constants'
import type { ComponentConfig } from '@/lib/types'

interface DocTransformCardProps {
  config: ComponentConfig
  allExpanded: boolean
}

export function DocTransformCard({ config, allExpanded }: DocTransformCardProps) {
  const [open, setOpen] = useState(false)
  const isOpen = allExpanded || open

  const typeLabel = deriveTypeLabel(config.componentId)
  const colors = COMPONENT_TYPE_COLORS[typeLabel] || DEFAULT_TYPE_COLOR

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <button
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        )}
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
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
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-3 text-sm">
          {config.description && (
            <p className="text-[var(--muted-foreground)] leading-relaxed">{config.description}</p>
          )}

          {config.inputTables.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-[var(--foreground)] mb-1">Input Tables</div>
              <div className="flex flex-wrap gap-1.5">
                {config.inputTables.map(t => {
                  const tableName = t.split('.').pop() || t
                  const bucketId = t.split('.').slice(0, 2).join('.')
                  return (
                    <a
                      key={t}
                      href={`#doc-bucket-${bucketId}`}
                      className="inline-flex items-center rounded px-2 py-0.5 bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-mono hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        const el = document.getElementById(`doc-bucket-${bucketId}`)
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      {tableName}
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {config.inputTables.length > 0 && config.outputTables.length > 0 && (
            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            </div>
          )}

          {config.outputTables.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-[var(--foreground)] mb-1">Output Tables</div>
              <div className="flex flex-wrap gap-1.5">
                {config.outputTables.map(t => {
                  const tableName = t.split('.').pop() || t
                  const bucketId = t.split('.').slice(0, 2).join('.')
                  return (
                    <a
                      key={t}
                      href={`#doc-bucket-${bucketId}`}
                      className="inline-flex items-center rounded px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-medium hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        const el = document.getElementById(`doc-bucket-${bucketId}`)
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      {tableName}
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
