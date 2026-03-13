import { BookOpen } from 'lucide-react'

export function ProjectDocumentationPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <span title="Documentation">
          <BookOpen className="h-8 w-8 text-[var(--muted-foreground)]" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-[var(--foreground)]">Project Documentation</p>
        <p className="text-xs text-[var(--muted-foreground)]">Coming soon</p>
      </div>
    </div>
  )
}
