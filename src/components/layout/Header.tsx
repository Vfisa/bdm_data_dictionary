import { Database, Sun, Moon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Page } from '@/lib/types'

interface HeaderProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  isDark: boolean
  onToggleTheme: () => void
  onOpenSearch: () => void
}

const tabs: { id: Page; label: string }[] = [
  { id: 'erd', label: 'ERD Diagram' },
  { id: 'tables', label: 'Table Browser' },
]

export function Header({ currentPage, onNavigate, isDark, onToggleTheme, onOpenSearch }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-[var(--border)] bg-[var(--card)] px-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-2.5 mr-8">
        <Database className="h-5 w-5 text-[var(--primary)]" />
        <h1 className="text-base font-semibold text-[var(--foreground)] tracking-tight">
          Data Dictionary
        </h1>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={currentPage === tab.id}
            onClick={() => onNavigate(tab.id)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer',
              currentPage === tab.id
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]/50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search trigger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSearch}
          className="gap-1.5 text-[var(--muted-foreground)]"
          aria-label="Search tables and columns (Cmd+K)"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Search</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 text-[10px] font-medium text-[var(--muted-foreground)]">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}
