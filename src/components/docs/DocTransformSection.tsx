import { DocTransformCard } from './DocTransformCard'
import type { TransformationFolder } from './useDocSections'

interface DocTransformSectionProps {
  transformationFolders: TransformationFolder[]
  allExpanded: boolean
}

export function DocTransformSection({ transformationFolders, allExpanded }: DocTransformSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
        5. Transformation Documentation
      </h2>
      <hr className="border-[var(--border)] mb-4" />

      {transformationFolders.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No transformation configurations found.</p>
      ) : (
        <div className="space-y-6">
          {transformationFolders.map(({ folder, configs }) => (
            <div key={folder} id={`doc-transform-${folder}`}>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {folder}
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({configs.length} transformation{configs.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="space-y-2">
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
