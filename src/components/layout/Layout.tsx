import type { ReactNode } from 'react'
import { Header } from './Header'
import type { Page } from '@/lib/types'

interface LayoutProps {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
  isDark: boolean
  onToggleTheme: () => void
  onOpenSearch: () => void
}

export function Layout({
  children,
  currentPage,
  onNavigate,
  isDark,
  onToggleTheme,
  onOpenSearch,
}: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onOpenSearch={onOpenSearch}
      />
      <main className="flex-1 overflow-hidden" role="main" aria-label={
        currentPage === 'overview' ? 'Project Overview' :
        currentPage === 'erd' ? 'ERD Diagram' :
        currentPage === 'docs' ? 'Project Documentation' :
        'Table Browser'
      }>
        {children}
      </main>
    </div>
  )
}
