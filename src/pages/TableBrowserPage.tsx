import type { MetadataResponse } from '@/lib/types'

interface TableBrowserPageProps {
  metadata: MetadataResponse
}

export function TableBrowserPage({ metadata }: TableBrowserPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-lg font-medium text-[var(--foreground)]">Table Browser</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          {metadata.tables.length} tables available
        </p>
      </div>
    </div>
  )
}
