import { Loader2, AlertCircle, FileText, RefreshCw } from 'lucide-react'
import { useProjectOverview } from '@/hooks/useProjectOverview'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils'
import { MarkdownContent } from '@/lib/markdown-components'

export function ProjectOverviewPage() {
  const { description, lastRefresh, isLoading, isRefreshing, error, refresh } = useProjectOverview()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center" role="status" aria-label="Loading project overview">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" aria-hidden="true" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading project overview…</p>
        </div>
      </div>
    )
  }

  if (error && !description) {
    return (
      <div className="flex h-full items-center justify-center" role="alert">
        <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
          <AlertCircle className="h-8 w-8 text-[var(--destructive)]" aria-hidden="true" />
          <p className="text-sm font-medium text-[var(--foreground)]">Failed to load project overview</p>
          <p className="text-xs text-[var(--muted-foreground)]">{error}</p>
        </div>
      </div>
    )
  }

  if (!description) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <span title="No description">
            <FileText className="h-8 w-8 text-[var(--muted-foreground)]" aria-hidden="true" />
          </span>
          <p className="text-sm text-[var(--muted-foreground)]">No project description available</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Set <code className="rounded bg-[var(--muted)] px-1 py-0.5 font-mono text-xs">KBC.projectDescription</code> in your branch metadata to display it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Toolbar with refresh */}
        <div className="flex items-center justify-end gap-1 mb-6">
          {lastRefresh && (
            <span className="text-[11px] text-[var(--muted-foreground)]">
              {timeAgo(lastRefresh)}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={isRefreshing}
            title="Refresh project description"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <MarkdownContent content={description} />
      </div>
    </div>
  )
}
