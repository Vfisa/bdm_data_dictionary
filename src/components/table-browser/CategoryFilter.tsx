import { CATEGORY_CONFIG, CATEGORY_ORDER } from '@/lib/constants'
import type { Category } from '@/lib/types'

interface CategoryFilterProps {
  visibleCategories: Set<Category>
  onToggleCategory: (category: Category) => void
  tableCounts: Record<Category, number>
}

export function CategoryFilter({
  visibleCategories,
  onToggleCategory,
  tableCounts,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {CATEGORY_ORDER.map((cat) => {
        const config = CATEGORY_CONFIG[cat]
        const isVisible = visibleCategories.has(cat)
        const count = tableCounts[cat] ?? 0
        if (count === 0) return null

        return (
          <button
            key={cat}
            onClick={() => onToggleCategory(cat)}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full
              border transition-all cursor-pointer
              ${isVisible
                ? 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                : 'border-transparent bg-[var(--muted)] text-[var(--muted-foreground)] opacity-60'
              }
            `}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{
                backgroundColor: isVisible ? config.color : 'var(--muted-foreground)',
                opacity: isVisible ? 1 : 0.4,
              }}
            />
            {config.label}
            <span className="text-[10px] opacity-60">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
