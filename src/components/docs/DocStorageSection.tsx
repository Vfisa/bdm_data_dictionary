import { useState } from 'react'
import { ChevronDown, ChevronRight, Database, Table2 } from 'lucide-react'
import type { StorageBucket } from '@/lib/types'

interface DocStorageSectionProps {
  storageBuckets: StorageBucket[]
  allExpanded: boolean
}

export function DocStorageSection({ storageBuckets, allExpanded }: DocStorageSectionProps) {
  // Group by stage: input first, then output
  const inputBuckets = storageBuckets.filter(b => b.stage === 'in')
  const outputBuckets = storageBuckets.filter(b => b.stage === 'out')

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
        3. Storage & Buckets
      </h2>
      <hr className="border-[var(--border)] mb-4" />

      {storageBuckets.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No storage buckets found.</p>
      ) : (
        <div className="space-y-6">
          {inputBuckets.length > 0 && (
            <div id="doc-storage-in">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Input Stage
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({inputBuckets.length} bucket{inputBuckets.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="space-y-2">
                {inputBuckets.map(bucket => (
                  <BucketCard key={bucket.id} bucket={bucket} allExpanded={allExpanded} />
                ))}
              </div>
            </div>
          )}

          {outputBuckets.length > 0 && (
            <div id="doc-storage-out">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Output Stage
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({outputBuckets.length} bucket{outputBuckets.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="space-y-2">
                {outputBuckets.map(bucket => (
                  <BucketCard key={bucket.id} bucket={bucket} allExpanded={allExpanded} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BucketCard({ bucket, allExpanded }: { bucket: StorageBucket; allExpanded: boolean }) {
  const [open, setOpen] = useState(false)
  const isOpen = allExpanded || open

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]" id={`doc-bucket-${bucket.id}`}>
      <button
        className="flex w-full items-start gap-2 px-4 py-2.5 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="mt-0.5">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          )}
        </div>
        <span title="Bucket" className="mt-0.5">
          <Database className="h-4 w-4 shrink-0 text-cyan-500" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium font-mono text-[var(--foreground)]">{bucket.id}</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              ({bucket.tables.length} table{bucket.tables.length !== 1 ? 's' : ''})
            </span>
          </div>
          {bucket.description && bucket.description.length > 0 && (
            <p className="text-xs text-[var(--foreground)]/60 mt-0.5 line-clamp-2">{bucket.description}</p>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-2">
          {bucket.tables.length > 0 ? (
            <div className="space-y-1">
              {bucket.tables.map(table => (
                <div key={table.id} className="flex items-start gap-2 py-1 text-sm">
                  <span title="Table">
                    <Table2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-[var(--foreground)]">{table.name}</span>
                    {table.columnCount > 0 && (
                      <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                        {table.columnCount} columns
                      </span>
                    )}
                    {table.description && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{table.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted-foreground)] italic">No tables</p>
          )}
        </div>
      )}
    </div>
  )
}
