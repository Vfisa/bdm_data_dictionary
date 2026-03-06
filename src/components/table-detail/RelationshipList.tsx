import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { Edge } from '@/lib/types'

interface RelationshipListProps {
  outgoing: Edge[]
  incoming: Edge[]
  onNavigate: (tableName: string) => void
}

export function RelationshipList({ outgoing, incoming, onNavigate }: RelationshipListProps) {
  if (outgoing.length === 0 && incoming.length === 0) {
    return (
      <p className="text-xs text-[var(--muted-foreground)] italic py-2">
        No relationships found
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Outgoing (this table → other) */}
      {outgoing.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
            References ({outgoing.length})
          </h4>
          <div className="space-y-1">
            {outgoing.map((edge) => (
              <button
                key={edge.id}
                onClick={() => onNavigate(edge.target)}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md
                  hover:bg-[var(--muted)] transition-colors group cursor-pointer"
              >
                <ArrowRight className="h-3 w-3 text-[var(--muted-foreground)] shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-[var(--primary)] group-hover:underline truncate block">
                    {edge.target}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] truncate block">
                    {edge.sourceColumn} → {edge.targetColumn}
                  </span>
                </div>
                <span className="text-[9px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--muted)] shrink-0">
                  {edge.inferenceMethod}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Incoming (other → this table) */}
      {incoming.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
            Referenced By ({incoming.length})
          </h4>
          <div className="space-y-1">
            {incoming.map((edge) => (
              <button
                key={edge.id}
                onClick={() => onNavigate(edge.source)}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md
                  hover:bg-[var(--muted)] transition-colors group cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3 text-[var(--muted-foreground)] shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-[var(--primary)] group-hover:underline truncate block">
                    {edge.source}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] truncate block">
                    {edge.sourceColumn} → {edge.targetColumn}
                  </span>
                </div>
                <span className="text-[9px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded bg-[var(--muted)] shrink-0">
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
