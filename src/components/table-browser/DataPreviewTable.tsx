import { Table2, Loader2, AlertTriangle } from 'lucide-react'
import type { DataPreviewResult } from '@/lib/types'

interface DataPreviewTableProps {
  data: DataPreviewResult | null
  isLoading: boolean
  error: string | null
  onFetch: () => void
}

export function DataPreviewTable({ data, isLoading, error, onFetch }: DataPreviewTableProps) {
  // Not yet loaded — show load button
  if (!data && !isLoading && !error) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center">
        <button
          onClick={onFetch}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          <Table2 className="h-3.5 w-3.5" />
          Load Data Preview
        </button>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
        <Loader2 className="h-4 w-4 animate-spin mx-auto text-[var(--muted-foreground)]" />
        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Loading preview...</p>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
        <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
          <button onClick={onFetch} className="underline hover:no-underline cursor-pointer ml-1">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No rows
  if (!data || data.rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted-foreground)]">
        No data available for preview
      </div>
    )
  }

  // Data table
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="overflow-auto max-h-[300px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
              {data.columns.map((col) => (
                <th
                  key={col}
                  className="px-2.5 py-1.5 text-left font-semibold text-[var(--foreground)] whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-[var(--border)] last:border-b-0 ${
                  i % 2 === 1 ? 'bg-[var(--muted)]/30' : ''
                }`}
              >
                {data.columns.map((col) => {
                  const val = row[col]
                  const isNovalue = val === '$NOVALUE'
                  const isEmpty = val === '' || val === null || val === undefined

                  return (
                    <td
                      key={col}
                      className={`px-2.5 py-1.5 font-mono whitespace-nowrap ${
                        isNovalue
                          ? 'bg-red-500/10 text-red-500'
                          : isEmpty
                            ? 'text-[var(--muted-foreground)] italic opacity-50'
                            : 'text-[var(--foreground)]'
                      }`}
                    >
                      {isNovalue ? '$NOVALUE' : isEmpty ? 'NULL' : val}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-2.5 py-1.5 text-[10px] text-[var(--muted-foreground)] border-t border-[var(--border)] bg-[var(--muted)]/50">
        Showing {data.rows.length} of {data.totalAvailable} rows
      </div>
    </div>
  )
}
