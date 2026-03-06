import type { MetadataResponse } from '@/lib/types'

interface ErdPageProps {
  metadata: MetadataResponse
  isRefreshing: boolean
  onRefresh: () => void
}

export function ErdPage({ metadata, isRefreshing, onRefresh }: ErdPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-lg font-medium text-[var(--foreground)]">ERD Diagram</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          {metadata.tables.length} tables, {metadata.edges.length} relationships
        </p>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-sm text-[var(--primary)] hover:underline disabled:opacity-50 cursor-pointer"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}
