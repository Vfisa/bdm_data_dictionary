import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { Loader2 } from 'lucide-react'

export function DocDataModelSection() {
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/resource/data-model')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setMarkdown(data?.content ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
        2. Data Model
      </h2>
      <hr className="border-[var(--border)] mb-4" />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading data model description...
        </div>
      ) : markdown ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--foreground)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {markdown}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)] italic">
          No data model description found. Add content to <code className="text-xs">resources/data-model.md</code> to populate this section.
        </p>
      )}
    </div>
  )
}
