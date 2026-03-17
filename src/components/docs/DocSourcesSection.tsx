import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Database } from 'lucide-react'
import type { ExtractorGroup } from './useDocSections'

interface DocSourcesSectionProps {
  extractorGroups: ExtractorGroup[]
  allExpanded: boolean
}

export function DocSourcesSection({ extractorGroups, allExpanded }: DocSourcesSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
        1. Data Sources & Integrations
      </h2>
      {extractorGroups.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No extractor configurations found.</p>
      ) : (
        <div className="space-y-4">
          {extractorGroups.map((group) => (
            <ExtractorGroupCard key={group.componentId} group={group} allExpanded={allExpanded} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExtractorGroupCard({ group, allExpanded }: { group: ExtractorGroup; allExpanded: boolean }) {
  const [open, setOpen] = useState(false)
  const isOpen = allExpanded || open

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <button
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        )}
        <span title="Data source">
          <Database className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
        </span>
        <span className="font-medium text-sm text-[var(--foreground)]">{group.componentName}</span>
        <span className="text-xs text-[var(--muted-foreground)]">
          ({group.configs.length} config{group.configs.length !== 1 ? 's' : ''})
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-3">
          {group.configs.map((config) => (
            <div key={config.configId} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--foreground)]">{config.configName}</span>
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
                <p className="text-xs text-[var(--muted-foreground)]">{config.description}</p>
              )}
              {config.outputTables.length > 0 && (
                <div className="text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium">Output tables:</span>{' '}
                  {config.outputTables.map(t => t.split('.').pop()).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
