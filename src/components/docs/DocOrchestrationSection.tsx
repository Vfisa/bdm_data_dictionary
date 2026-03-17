import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, GitBranch } from 'lucide-react'
import { COMPONENT_TYPE_COLORS, DEFAULT_TYPE_COLOR, deriveTypeLabel } from '@/lib/constants'
import { MarkdownContent } from '@/lib/markdown-components'
import type { Flow, FlowTask } from '@/lib/types'

interface DocOrchestrationSectionProps {
  flows: Flow[]
  allExpanded: boolean
}

export function DocOrchestrationSection({ flows, allExpanded }: DocOrchestrationSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
        4. Orchestration
      </h2>
      <hr className="border-[var(--border)] mb-4" />

      {flows.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No flow configurations found.</p>
      ) : (
        <div className="space-y-3">
          {flows.map((flow) => (
            <FlowCard key={flow.id} flow={flow} allExpanded={allExpanded} />
          ))}
        </div>
      )}
    </div>
  )
}

function FlowCard({ flow, allExpanded }: { flow: Flow; allExpanded: boolean }) {
  const [open, setOpen] = useState(false)
  const isOpen = allExpanded || open

  // Group tasks by phaseId
  const tasksByPhase = useMemo(() => {
    const map = new Map<string, FlowTask[]>()
    for (const task of flow.tasks || []) {
      const existing = map.get(task.phaseId)
      if (existing) {
        existing.push(task)
      } else {
        map.set(task.phaseId, [task])
      }
    }
    return map
  }, [flow.tasks])

  const phaseCount = flow.phases?.length ?? flow.phaseCount ?? 0
  const taskCount = flow.tasks?.length ?? flow.taskCount ?? 0

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
        <span title="Flow">
          <GitBranch className="h-4 w-4 shrink-0 text-purple-500" aria-hidden="true" />
        </span>
        <span className="font-medium text-sm text-[var(--foreground)]">{flow.name}</span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {phaseCount} phase{phaseCount !== 1 ? 's' : ''} &middot; {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
        {flow.keboolaUrl && (
          <a
            href={flow.keboolaUrl}
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
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-3">
          {flow.description && (
            <div className="text-xs text-[var(--muted-foreground)]">
              <MarkdownContent content={flow.description} />
            </div>
          )}

          {/* Phases with their tasks */}
          {(flow.phases || []).map((phase, idx) => {
            const phaseTasks = tasksByPhase.get(phase.id) || []
            return (
              <div key={phase.id || idx} className="space-y-1">
                <div className="text-xs font-medium text-[var(--foreground)]">
                  Phase {idx + 1}: {phase.name || `Phase ${idx + 1}`}
                  {phase.dependsOn.length > 0 && (
                    <span className="text-[var(--muted-foreground)] font-normal">
                      {' '}(depends on: {phase.dependsOn.join(', ')})
                    </span>
                  )}
                  {phase.hasConditions && (
                    <span className="ml-1 text-amber-500 text-[10px] font-medium">(conditional)</span>
                  )}
                </div>
                {phaseTasks.length > 0 ? (
                  <div className="pl-4 space-y-0.5">
                    {phaseTasks.map((task) => {
                      const typeLabel = deriveTypeLabel(task.componentId)
                      const colors = COMPONENT_TYPE_COLORS[typeLabel] || DEFAULT_TYPE_COLOR
                      return (
                        <div key={task.id} className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span
                            className={`rounded px-1 py-0.5 text-[10px] font-bold ${
                              task.enabled ? '' : 'line-through opacity-60'
                            }`}
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {typeLabel}
                          </span>
                          <span className={task.enabled ? '' : 'line-through opacity-60'}>{task.name || task.configId}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="pl-4 text-xs text-[var(--muted-foreground)] italic">No tasks in this phase</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
