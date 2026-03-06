import type { ColumnProfile } from '../../lib/types'
import { formatNumber } from '../../lib/utils'

interface ColumnProfileDrawerProps {
  profile: ColumnProfile
  sampleSize: number
  totalRows: number
  hasNativeProfile: boolean
  keboolaBaseType: string
  isIdColumn: boolean
}

/**
 * Expandable drawer showing per-column profiling stats.
 * Renders below a column row in the ColumnTable.
 */
export function ColumnProfileDrawer({
  profile,
  sampleSize,
  totalRows,
  hasNativeProfile,
  keboolaBaseType,
  isIdColumn,
}: ColumnProfileDrawerProps) {
  const baseType = keboolaBaseType?.toUpperCase() || 'STRING'
  const isNumericOrDate = ['INTEGER', 'NUMERIC', 'FLOAT', 'DATE', 'TIMESTAMP'].includes(baseType)

  return (
    <div className="px-3 py-2.5 bg-[var(--muted)] border-t border-[var(--border)]">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {/* Null Rate */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[var(--muted-foreground)]">Null Rate</span>
            <span className="font-mono">{(profile.nullRate * 100).toFixed(1)}%</span>
          </div>
          <RateBar rate={profile.nullRate} color="blue" />
        </div>

        {/* Distinct Count */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[var(--muted-foreground)]">Distinct</span>
            <span className="font-mono">{formatNumber(profile.distinctCount)}</span>
          </div>
          {totalRows > 0 && (
            <RateBar rate={profile.distinctCount / totalRows} color="purple" />
          )}
        </div>

        {/* Min/Max — only for numeric/date */}
        {isNumericOrDate && (profile.min !== null || profile.max !== null) && (
          <>
            <div>
              <span className="text-[var(--muted-foreground)]">Min: </span>
              <span className="font-mono">{profile.min ?? '—'}</span>
            </div>
            <div>
              <span className="text-[var(--muted-foreground)]">Max: </span>
              <span className="font-mono">{profile.max ?? '—'}</span>
            </div>
          </>
        )}

        {/* $NOVALUE — only for _ID columns */}
        {isIdColumn && (
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[var(--muted-foreground)]">$NOVALUE</span>
              <span className="font-mono">
                {profile.novalueCount > 0
                  ? `${(profile.novalueRate * 100).toFixed(1)}% (${formatNumber(profile.novalueCount)} rows)`
                  : 'None'}
              </span>
            </div>
            {profile.novalueCount > 0 && (
              <RateBar rate={profile.novalueRate} color="novalue" />
            )}
          </div>
        )}

        {/* Top Values */}
        {profile.topValues.length > 0 && (
          <div className="col-span-2">
            <span className="text-[var(--muted-foreground)]">Top Values: </span>
            <span className="font-mono text-[11px]">
              {profile.topValues.map((tv, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {tv.value}
                  <span className="text-[var(--muted-foreground)]"> ({tv.count})</span>
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      {/* Footer — source indicator */}
      <div className="mt-2 pt-1.5 border-t border-[var(--border)] text-[10px] text-[var(--muted-foreground)] text-right">
        {hasNativeProfile && profile.isExact ? (
          <span>Exact stats (all {formatNumber(totalRows)} rows)</span>
        ) : (
          <span>Based on {formatNumber(sampleSize)} row sample</span>
        )}
      </div>
    </div>
  )
}

/** Horizontal bar visualization for rates (0-1). */
function RateBar({ rate, color }: { rate: number; color: 'blue' | 'purple' | 'novalue' }) {
  const pct = Math.min(100, rate * 100)

  const colorMap = {
    blue: 'bg-blue-500/60 dark:bg-blue-400/50',
    purple: 'bg-purple-500/60 dark:bg-purple-400/50',
    novalue:
      rate >= 0.2
        ? 'bg-red-500/60 dark:bg-red-400/50'
        : rate >= 0.05
          ? 'bg-yellow-500/60 dark:bg-yellow-400/50'
          : 'bg-green-500/60 dark:bg-green-400/50',
  }

  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorMap[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
