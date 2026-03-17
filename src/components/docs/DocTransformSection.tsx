import { CATEGORY_CONFIG } from '@/lib/constants'
import { DocTransformCard } from './DocTransformCard'
import type { TransformationsByLayer } from './useDocSections'

interface DocTransformSectionProps {
  transformationsByLayer: TransformationsByLayer[]
  allExpanded: boolean
}

export function DocTransformSection({ transformationsByLayer, allExpanded }: DocTransformSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
        5. Transformation Documentation
      </h2>

      {transformationsByLayer.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No transformation configurations found.</p>
      ) : (
        <div className="space-y-6">
          {transformationsByLayer.map(({ layer, label, configs }) => (
            <div key={layer} id={`doc-transform-${layer}`}>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: CATEGORY_CONFIG[layer].color }}
                />
                {label}
                <span className="text-sm font-normal text-[var(--muted-foreground)]">
                  ({configs.length} transformation{configs.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="space-y-1.5">
                {configs.map((config) => (
                  <DocTransformCard
                    key={config.configId}
                    config={config}
                    allExpanded={allExpanded}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
