import { CATEGORY_CONFIG } from '@/lib/constants'
import { DocTableCard } from './DocTableCard'
import type { TablesByLayer } from './useDocSections'
import type { Edge, LineageIndex } from '@/lib/types'

interface DocDataModelSectionProps {
  tablesByLayer: TablesByLayer[]
  edges: Edge[]
  lineage: LineageIndex
  allExpanded: boolean
}

export function DocDataModelSection({
  tablesByLayer,
  edges,
  lineage,
  allExpanded,
}: DocDataModelSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
        2. Data Model by Layer
      </h2>

      {tablesByLayer.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No tables found.</p>
      ) : (
        <div className="space-y-6">
          {tablesByLayer.map(({ layer, label, tables }) => (
            <div key={layer} id={`doc-model-${layer}`}>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: CATEGORY_CONFIG[layer].color }}
                />
                {label}
                <span className="text-sm font-normal text-[var(--muted-foreground)]">
                  ({tables.length} table{tables.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="space-y-1.5">
                {tables.map((table) => {
                  const outgoing = edges.filter(e => e.source === table.name)
                  const incoming = edges.filter(e => e.target === table.name)
                  const producedBy = lineage.producedBy[table.id] || []
                  const usedBy = lineage.usedBy[table.id] || []
                  return (
                    <DocTableCard
                      key={table.id}
                      table={table}
                      outgoing={outgoing}
                      incoming={incoming}
                      producedBy={producedBy}
                      usedBy={usedBy}
                      allExpanded={allExpanded}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
