import { ArrowUpDown } from 'lucide-react'

export type SortField = 'category' | 'name' | 'rowsCount' | 'columnCount' | 'dataSizeBytes'
export type SortDirection = 'asc' | 'desc'

interface SortControlsProps {
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (field: SortField) => void
}

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'category', label: 'Category' },
  { field: 'name', label: 'Name' },
  { field: 'rowsCount', label: 'Rows' },
  { field: 'columnCount', label: 'Columns' },
  { field: 'dataSizeBytes', label: 'Size' },
]

export function SortControls({
  sortField,
  sortDirection,
  onSortChange,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <ArrowUpDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.field}
          onClick={() => onSortChange(opt.field)}
          className={`
            px-2 py-0.5 text-[11px] rounded cursor-pointer transition-colors
            ${sortField === opt.field
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-medium'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
            }
          `}
        >
          {opt.label}
          {sortField === opt.field && (
            <span className="ml-0.5">{sortDirection === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ))}
    </div>
  )
}
