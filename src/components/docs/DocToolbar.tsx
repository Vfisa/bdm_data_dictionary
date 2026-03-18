import { RefreshCw, Printer, Download, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocToolbarProps {
  lastRefresh: string | null
  isRefreshing: boolean
  onRefresh: () => void
  allExpanded: boolean
  onToggleExpand: () => void
  onPrint: () => void
  onExportMarkdown: () => void
}

export function DocToolbar({
  lastRefresh,
  isRefreshing,
  onRefresh,
  allExpanded,
  onToggleExpand,
  onPrint,
  onExportMarkdown,
}: DocToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-2 print:hidden">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Project Documentation</h1>
        {lastRefresh && (
          <span className="text-xs text-[var(--muted-foreground)]">
            Updated {new Date(lastRefresh).toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          title={allExpanded ? 'Collapse all sections' : 'Expand all sections'}
        >
          <span title={allExpanded ? 'Collapse all' : 'Expand all'}>
            <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="ml-1 text-xs">{allExpanded ? 'Collapse' : 'Expand'} All</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrint}
          title="Print / Save as PDF"
        >
          <span title="Print">
            <Printer className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="ml-1 text-xs">Print</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportMarkdown}
          title="Export as Markdown"
        >
          <span title="Download Markdown">
            <Download className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="ml-1 text-xs">Markdown</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh metadata"
        >
          <span title="Refresh">
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </span>
          <span className="ml-1 text-xs">Refresh</span>
        </Button>
      </div>
    </div>
  )
}
