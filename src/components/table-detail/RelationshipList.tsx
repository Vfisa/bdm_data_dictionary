import { ArrowRight, ArrowLeft } from 'lucide-react'
import { CATEGORY_SORT_PRIORITY } from '@/lib/constants'
import type { Edge, Category } from '@/lib/types'

interface RelationshipListProps {
  outgoing: Edge[]
  incoming: Edge[]
  onNavigate: (tableName: string) => void
  categories?: Record<string, Category>
}

function sortEdgesByCategory(edges: Edge[], getTable: (e: Edge) => string, categories?: Record<string, Category>): Edge[] {
  if (!categories) return edges
  return [...edges].sort((a, b) => {
    const catA = categories[getTable(a)] || 'OTHER'
    const catB = categories[getTable(b)] || 'OTHER'
    const diff = (CATEGORY_SORT_PRIORITY[catA] ?? 6) - (CATEGORY_SORT_PRIORITY[catB] ?? 6)
    if (diff !== 0) return diff
    return getTable(a).localeCompare(getTable(b))
  })
}

export function RelationshipList({ outgoing, incoming, onNavigate, categories }: RelationshipListProps) {
  const sortedOutgoing = sortEdgesByCategory(outgoing, e => e.target, categories)
  const sortedIncoming = sortEdgesByCategory(incoming, e => e.source, categories)

  if (outgoing.length === 0 && incoming.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] italic py-2">
        No relationships found
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Outgoing (this table → other) */}
      {sortedOutgoing.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
            References ({sortedOutgoing.length})
          </h4>
          <div className="space-y-0.5">
            {sortedOutgoing.map((edge) => (
              <button
                key={edge.id}
                onClick={() => onNavigate(edge.target)}
                className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-md
                  hover:bg-[var(--muted)] transition-colors group cursor-pointer"
              >
                <ArrowRight className="h-3 w-3 text-[var(--muted-foreground)] shrink-0" />
                <span className="text-xs text-[var(--primary)] group-hover:underline truncate">
                  {edge.target}
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)] truncate">
                  {edge.sourceColumn} → {edge.targetColumn}
                </span>
                <span className="text-[9px] text-[var(--muted-foreground)]/60 px-1 py-0.5 rounded bg-[var(--muted)] shrink-0 ml-auto">
                  {edge.inferenceMethod}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Incoming (other → this table) */}
      {sortedIncoming.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
            Referenced By ({sortedIncoming.length})
          </h4>
          <div className="space-y-0.5">
            {sortedIncoming.map((edge) => (
              <button
                key={edge.id}
                onClick={() => onNavigate(edge.source)}
                className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-md
                  hover:bg-[var(--muted)] transition-colors group cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3 text-[var(--muted-foreground)] shrink-0" />
                <span className="text-xs text-[var(--primary)] group-hover:underline truncate">
                  {edge.source}
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)] truncate">
                  {edge.sourceColumn} → {edge.targetColumn}
                </span>
                <span className="text-[9px] text-[var(--muted-foreground)]/60 px-1 py-0.5 rounded bg-[var(--muted)] shrink-0 ml-auto">
                  {edge.inferenceMethod}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
