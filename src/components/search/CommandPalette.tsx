import { Command } from 'cmdk'
import { Database, Columns3, Search } from 'lucide-react'
import { useSearch } from './useSearch'
import { CATEGORY_CONFIG } from '@/lib/constants'
import type { MetadataResponse, Category } from '@/lib/types'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metadata: MetadataResponse | null
  onSelectTable: (tableName: string) => void
}

export function CommandPalette({
  open,
  onOpenChange,
  metadata,
  onSelectTable,
}: CommandPaletteProps) {
  const { tableResults, columnResults } = useSearch(metadata)

  // Handle selection
  const handleSelect = (value: string) => {
    // Value format: "table:TABLE_NAME" or "column:TABLE_NAME.COLUMN_NAME"
    const [type, ...rest] = value.split(':')
    const payload = rest.join(':')

    if (type === 'table') {
      onSelectTable(payload)
    } else if (type === 'column') {
      // Navigate to the table that contains this column
      const tableName = payload.split('.')[0] ?? payload
      onSelectTable(tableName)
    }

    onOpenChange(false)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search tables and columns"
      className="fixed inset-0 z-50"
      overlayClassName=""
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-4 border-b border-[var(--border)]">
            <Search className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
            <Command.Input
              placeholder="Search tables and columns..."
              className="flex-1 py-3 text-sm bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          {/* Results */}
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
              No results found
            </Command.Empty>

            {/* Tables group */}
            <Command.Group
              heading="Tables"
              className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--muted-foreground)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {tableResults.map((result) => {
                const config = CATEGORY_CONFIG[result.category as Category]
                return (
                  <Command.Item
                    key={`table:${result.tableName}`}
                    value={`table:${result.tableName}`}
                    keywords={[result.tableName, result.description]}
                    onSelect={handleSelect}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer
                      text-sm text-[var(--foreground)]
                      data-[selected=true]:bg-[var(--muted)]
                      hover:bg-[var(--muted)] transition-colors"
                  >
                    <Database className="h-4 w-4 shrink-0" style={{ color: config?.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">{result.tableName}</span>
                      {result.description && (
                        <span className="text-xs text-[var(--muted-foreground)] truncate block">
                          {result.description}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm uppercase shrink-0"
                      style={{
                        backgroundColor: `${config?.color}18`,
                        color: config?.color,
                      }}
                    >
                      {result.category}
                    </span>
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Columns group */}
            <Command.Group
              heading="Columns"
              className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--muted-foreground)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {columnResults.map((result) => (
                <Command.Item
                  key={`column:${result.tableName}.${result.columnName}`}
                  value={`column:${result.tableName}.${result.columnName}`}
                  keywords={[result.columnName, result.tableName]}
                  onSelect={handleSelect}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer
                    text-sm text-[var(--foreground)]
                    data-[selected=true]:bg-[var(--muted)]
                    hover:bg-[var(--muted)] transition-colors"
                >
                  <Columns3 className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">
                      {result.columnName}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] truncate block">
                      {result.tableName}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
                    {result.columnType}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer hint */}
          <div className="border-t border-[var(--border)] px-4 py-2 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  )
}
