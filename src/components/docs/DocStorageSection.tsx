import { HardDrive } from 'lucide-react'
import { formatBytes, formatNumber } from '@/lib/utils'
import type { BucketInfo } from './useDocSections'
import type { TableSummary } from '@/lib/types'

interface DocStorageSectionProps {
  buckets: BucketInfo[]
  tables: TableSummary[]
}

export function DocStorageSection({ buckets, tables }: DocStorageSectionProps) {
  const totalSize = tables.reduce((sum, t) => sum + t.dataSizeBytes, 0)
  const totalRows = tables.reduce((sum, t) => sum + t.rowsCount, 0)
  const largestTables = [...tables]
    .sort((a, b) => b.dataSizeBytes - a.dataSizeBytes)
    .slice(0, 5)

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
        3. Storage & Buckets
      </h2>

      {/* Summary */}
      <div className="flex items-center gap-6 mb-4 text-sm text-[var(--muted-foreground)]">
        <span title="Storage">
          <HardDrive className="h-4 w-4 inline mr-1" aria-hidden="true" />
        </span>
        <span><strong>{tables.length}</strong> tables</span>
        <span><strong>{formatBytes(totalSize)}</strong> total</span>
        <span><strong>{formatNumber(totalRows)}</strong> rows</span>
      </div>

      {/* Bucket table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--accent)]/50 text-left text-xs text-[var(--muted-foreground)]">
              <th className="px-3 py-2 font-medium">Bucket</th>
              <th className="px-3 py-2 font-medium">Stage</th>
              <th className="px-3 py-2 font-medium text-right">Tables</th>
              <th className="px-3 py-2 font-medium text-right">Size</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr key={bucket.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 text-[var(--foreground)] font-mono text-xs">{bucket.id}</td>
                <td className="px-3 py-2 text-[var(--muted-foreground)]">{bucket.stage}</td>
                <td className="px-3 py-2 text-right text-[var(--foreground)]">{bucket.tableCount}</td>
                <td className="px-3 py-2 text-right text-[var(--muted-foreground)]">{formatBytes(bucket.totalSize)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Largest tables */}
      {largestTables.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Largest Tables</h3>
          <div className="space-y-1">
            {largestTables.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <span className="w-5 text-right font-medium">{i + 1}.</span>
                <span className="text-[var(--foreground)] font-mono">{t.name}</span>
                <span className="ml-auto">{formatBytes(t.dataSizeBytes)}</span>
                <span>({formatNumber(t.rowsCount)} rows)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
