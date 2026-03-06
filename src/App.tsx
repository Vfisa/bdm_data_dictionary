import { useState, useCallback, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ErdPage } from '@/pages/ErdPage'
import { TableBrowserPage } from '@/pages/TableBrowserPage'
import { CommandPalette } from '@/components/search/CommandPalette'
import { useTheme } from '@/hooks/useTheme'
import { useMetadata } from '@/hooks/useMetadata'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Page } from '@/lib/types'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('erd')
  const [searchOpen, setSearchOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { data, isLoading, error, refresh, isRefreshing } = useMetadata()

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true)
  }, [])

  // Handle table selection from search — navigate to ERD and select the table
  const handleSearchSelectTable = useCallback((tableName: string) => {
    setCurrentPage('erd')
    // Small delay to ensure page switch, then dispatch custom event
    // ErdPage will pick this up to select the table
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('selectTable', { detail: { tableName } }),
      )
    }, 100)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading metadata...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
          <AlertCircle className="h-8 w-8 text-[var(--destructive)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">Failed to load metadata</p>
          <p className="text-xs text-[var(--muted-foreground)]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-[var(--primary)] hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No data (shouldn't happen after loading)
  if (!data) return null

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSearch={handleOpenSearch}
      >
        {currentPage === 'erd' && (
          <ErdPage
            metadata={data}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
          />
        )}
        {currentPage === 'tables' && (
          <TableBrowserPage metadata={data} />
        )}
      </Layout>

      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        metadata={data}
        onSelectTable={handleSearchSelectTable}
      />
    </>
  )
}

export default App
