import type { ColumnProfile } from '../../lib/types'

interface NoValueBadgeProps {
  columnProfile: ColumnProfile
  sampleSize: number
}

/**
 * Inline pill badge showing $NOVALUE rate for _ID columns.
 * Color-coded: green <5%, yellow 5-20%, red >=20%.
 */
export function NoValueBadge({ columnProfile, sampleSize }: NoValueBadgeProps) {
  const { novalueCount, novalueRate } = columnProfile

  if (novalueCount === 0) return null

  const pct = (novalueRate * 100).toFixed(1)
  const colorClass =
    novalueRate >= 0.2
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      : novalueRate >= 0.05
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'

  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${colorClass}`}
      title={`${novalueCount} of ${sampleSize} sampled rows contain $NOVALUE`}
    >
      $NV: {pct}%
    </span>
  )
}
