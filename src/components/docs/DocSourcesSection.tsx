import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Database } from 'lucide-react'
import { MarkdownContent } from '@/lib/markdown-components'
import type { ExtractorGroup } from './useDocSections'

interface DocSourcesSectionProps {
  extractorGroups: ExtractorGroup[]
  allExpanded: boolean
}

export function DocSourcesSection({ extractorGroups, allExpanded }: DocSourcesSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
        1. Data Sources & Integrations
      </h2>
      <hr className="border-[var(--border)] mb-4" />
      {extractorGroups.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No extractor configurations found.</p>
      ) : (
        <div className="space-y-3">
          {extractorGroups.map((group) => (
            <ExtractorGroupCard key={group.componentId} group={group} allExpanded={allExpanded} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExtractorGroupCard({ group, allExpanded }: { group: ExtractorGroup; allExpanded: boolean }) {
  const [open, setOpen] = useState(true)
  const isOpen = allExpanded || open

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]" id={`doc-source-${group.componentId}`}>
      <button
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        )}
        <span title="Data source">
          <Database className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-[var(--foreground)]">{group.componentName}</span>
        <span className="text-xs text-[var(--muted-foreground)]">
          ({group.configs.length} config{group.configs.length !== 1 ? 's' : ''})
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-4">
          {group.configs.map((config) => (
            <div key={config.configId} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">{config.configName}</h4>
                {config.keboolaUrl && (
                  <a
                    href={config.keboolaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                    title="Open in Keboola"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {config.description && (
                <div className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  <MarkdownContent content={config.description} />
                </div>
              )}
              {config.outputTables.length > 0 && (
                <div className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Output tables:</span>{' '}
                  {config.outputTables.map((t, i) => (
                    <span key={t}>
                      {i > 0 && ', '}
                      <span className="font-mono text-blue-500">{t.split('.').pop()}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
