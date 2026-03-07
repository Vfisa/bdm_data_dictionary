import { useMemo } from 'react'
import { Database, Columns3, Rows3, ShieldCheck, FileWarning, AlertTriangle } from 'lucide-react'
import { computeQAStats } from '@/lib/qa-stats'
import { formatNumber } from '@/lib/utils'
import type { MetadataResponse, StatsFilter } from '@/lib/types'

interface StatsDashboardProps {
  metadata: MetadataResponse
  activeFilter?: StatsFilter
  onFilterClick?: (filter: StatsFilter) => void
}

export function StatsDashboard({ metadata, activeFilter, onFilterClick }: StatsDashboardProps) {
  const stats = useMemo(() => computeQAStats(metadata.tables), [metadata.tables])

  const qaColor =
    stats.qaScore >= 80 ? 'text-green-500' :
    stats.qaScore >= 50 ? 'text-yellow-500' :
    'text-red-500'

  const qaBg =
    stats.qaScore >= 80 ? 'bg-green-500/10' :
    stats.qaScore >= 50 ? 'bg-yellow-500/10' :
    'bg-red-500/10'

  const cards: {
    icon: typeof Database
    label: string
    value: string
    color: string
    bg: string
    filterKey?: StatsFilter
  }[] = [
    {
      icon: Database,
      label: 'Tables',
      value: stats.totalTables.toString(),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Columns3,
      label: 'Columns',
      value: formatNumber(stats.totalColumns),
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: Rows3,
      label: 'Total Rows',
      value: formatNumber(stats.totalRows),
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: ShieldCheck,
      label: 'QA Score',
      value: `${stats.qaScore}%`,
      color: qaColor,
      bg: qaBg,
    },
    {
      icon: FileWarning,
      label: 'Missing Table Desc',
      value: stats.tablesWithoutDescription.toString(),
      color: stats.tablesWithoutDescription > 0 ? 'text-orange-500' : 'text-green-500',
      bg: stats.tablesWithoutDescription > 0 ? 'bg-orange-500/10' : 'bg-green-500/10',
      filterKey: 'missingTableDesc',
    },
    {
      icon: FileWarning,
      label: 'Missing Col Desc',
      value: formatNumber(stats.columnsWithoutDescription),
      color: stats.columnsWithoutDescription > 0 ? 'text-orange-500' : 'text-green-500',
      bg: stats.columnsWithoutDescription > 0 ? 'bg-orange-500/10' : 'bg-green-500/10',
      filterKey: 'missingColDesc',
    },
    {
      icon: AlertTriangle,
      label: 'Empty Tables',
      value: stats.emptyTables.toString(),
      color: stats.emptyTables > 0 ? 'text-red-500' : 'text-green-500',
      bg: stats.emptyTables > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
      filterKey: 'emptyTables',
    },
  ]

  return (
    <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
      {cards.map((card) => {
        const isClickable = !!card.filterKey && onFilterClick && parseInt(card.value.replace(/[^0-9]/g, '')) > 0
        const isActive = card.filterKey != null && activeFilter === card.filterKey
        const Tag = isClickable ? 'button' : 'div'

        return (
          <Tag
            key={card.label}
            onClick={isClickable ? () => onFilterClick(isActive ? null : card.filterKey!) : undefined}
            className={`
              flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-[var(--card)] min-w-0 shrink-0
              ${isActive
                ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/30 shadow-sm'
                : 'border-[var(--border)]'
              }
              ${isClickable ? 'cursor-pointer hover:border-[var(--primary)]/50 transition-all' : ''}
            `}
          >
            <div className={`p-1.5 rounded-md ${card.bg}`}>
              <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider leading-none mb-0.5">
                {card.label}
              </p>
              <p className={`text-sm font-semibold ${card.color} leading-none`}>
                {card.value}
              </p>
            </div>
          </Tag>
        )
      })}
    </div>
  )
}
