import { Loader2, AlertCircle, FileText, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { useProjectOverview } from '@/hooks/useProjectOverview'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils'

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

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            h1: ({ children }) => <h1 className="text-[32px] font-bold text-[var(--foreground)] mb-2 mt-10 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-[24px] font-semibold text-[var(--foreground)] mb-2 mt-10">{children}</h2>,
            h3: ({ children }) => <h3 className="text-[19px] font-semibold text-[var(--foreground)] mb-2 mt-8">{children}</h3>,
            p: ({ children }) => <p className="text-[14px] text-[var(--foreground)] mb-3 leading-[1.7]">{children}</p>,
            a: ({ href, children }) => <a href={href} className="text-[oklch(0.55_0.15_250)] hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-[14px] text-[var(--foreground)] leading-[1.7]">{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-3 border-[oklch(0.65_0.15_250)] pl-4 text-[14px] text-[var(--muted-foreground)] my-4 bg-[oklch(0.96_0.01_250)] dark:bg-[oklch(0.2_0.01_250)] py-3 pr-4 rounded-r-lg">{children}</blockquote>,
            code: ({ children, className }) => {
              if (className) return <code className={`${className} font-mono text-[13px]`}>{children}</code>
              return <code className="rounded bg-[var(--secondary)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--foreground)]">{children}</code>
            },
            pre: ({ children }) => <pre className="rounded-lg bg-[var(--muted)] p-4 overflow-x-auto mb-4 text-[13px] border border-[var(--border)]">{children}</pre>,
            hr: () => <div className="my-2" />,
            strong: ({ children }) => <strong className="font-semibold text-[var(--foreground)]">{children}</strong>,
            table: ({ children }) => <div className="overflow-x-auto mb-4 rounded-lg border border-[var(--border)]"><table className="min-w-full text-[13px]">{children}</table></div>,
            thead: ({ children }) => <thead className="bg-[var(--muted)]">{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="border-b border-[var(--border)] last:border-b-0">{children}</tr>,
            th: ({ children }) => <th className="px-4 py-2.5 text-left font-semibold text-[var(--foreground)] text-[12px]">{children}</th>,
            td: ({ children }) => <td className="px-4 py-2.5 text-[var(--foreground)]">{children}</td>,
          }}
        >
          {description}
        </ReactMarkdown>
      </div>
    </div>
  )
}
