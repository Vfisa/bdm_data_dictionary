import type { Category, PredefinedTag } from './types'

/** Category display configuration */
export const CATEGORY_CONFIG: Record<Category, {
  label: string
  shortCode: string
  groupLabel: string
  color: string
  bgLight: string
  bgDark: string
  textLight: string
  textDark: string
  borderLight: string
  borderDark: string
  nodeHeader: string
}> = {
  DIM: {
    label: 'Dimension',
    shortCode: 'DIM',
    groupLabel: 'Dimension',
    color: '#3b82f6',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950',
    textLight: 'text-blue-700',
    textDark: 'dark:text-blue-300',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800',
    nodeHeader: '#3b82f6',
  },
  FCT: {
    label: 'Fact',
    shortCode: 'FCT',
    groupLabel: 'Fact Tables',
    color: '#22c55e',
    bgLight: 'bg-green-50',
    bgDark: 'dark:bg-green-950',
    textLight: 'text-green-700',
    textDark: 'dark:text-green-300',
    borderLight: 'border-green-200',
    borderDark: 'dark:border-green-800',
    nodeHeader: '#22c55e',
  },
  FCTH: {
    label: 'Fact (Historical)',
    shortCode: 'FCTH',
    groupLabel: 'Fact Historical',
    color: '#16a34a',
    bgLight: 'bg-green-50',
    bgDark: 'dark:bg-green-950',
    textLight: 'text-green-700',
    textDark: 'dark:text-green-300',
    borderLight: 'border-green-200',
    borderDark: 'dark:border-green-800',
    nodeHeader: '#16a34a',
  },
  MAP: {
    label: 'Mapping',
    shortCode: 'MAP',
    groupLabel: 'Mapping',
    color: '#f97316',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950',
    textLight: 'text-orange-700',
    textDark: 'dark:text-orange-300',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-800',
    nodeHeader: '#f97316',
  },
  AUX: {
    label: 'Auxiliary',
    shortCode: 'AUX',
    groupLabel: 'Auxiliary',
    color: '#6b7280',
    bgLight: 'bg-gray-50',
    bgDark: 'dark:bg-gray-900',
    textLight: 'text-gray-700',
    textDark: 'dark:text-gray-300',
    borderLight: 'border-gray-200',
    borderDark: 'dark:border-gray-700',
    nodeHeader: '#6b7280',
  },
  REF: {
    label: 'Reference',
    shortCode: 'REF',
    groupLabel: 'Reference',
    color: '#06b6d4',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950',
    textLight: 'text-cyan-700',
    textDark: 'dark:text-cyan-300',
    borderLight: 'border-cyan-200',
    borderDark: 'dark:border-cyan-800',
    nodeHeader: '#06b6d4',
  },
  OTHER: {
    label: 'Other',
    shortCode: 'OTH',
    groupLabel: 'Other',
    color: '#64748b',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-900',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-300',
    borderLight: 'border-slate-200',
    borderDark: 'dark:border-slate-700',
    nodeHeader: '#64748b',
  },
}

/** Ordered list of categories for display and toolbar filters (ERD layout uses FK-based hierarchy, not category rank) */
export const CATEGORY_ORDER: Category[] = [
  'REF', 'DIM', 'FCT', 'FCTH', 'MAP', 'AUX', 'OTHER',
]

/** Tag color configuration */
export const TAG_CONFIG: Record<PredefinedTag, { color: string; bg: string; label: string }> = {
  'verified': { color: '#22c55e', bg: '#22c55e18', label: 'Verified' },
  'needs-review': { color: '#f59e0b', bg: '#f59e0b18', label: 'Needs Review' },
  'deprecated': { color: '#ef4444', bg: '#ef444418', label: 'Deprecated' },
  'core': { color: '#3b82f6', bg: '#3b82f618', label: 'Core' },
  'wip': { color: '#a855f7', bg: '#a855f718', label: 'WIP' },
  'sensitive': { color: '#ec4899', bg: '#ec489918', label: 'Sensitive' },
}

/** Component type badge colors — shared across all tabs (lineage, docs, etc.) */
export const COMPONENT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  SQL: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6' },   // blue
  PY:  { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },   // amber
  dbt: { bg: 'rgba(239, 68, 68, 0.12)',  text: '#ef4444' },    // red
  R:   { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7' },    // purple
  JL:  { bg: 'rgba(34, 197, 94, 0.12)',  text: '#22c55e' },    // green
  OR:  { bg: 'rgba(107, 114, 128, 0.12)', text: '#6b7280' },   // gray
  EXT: { bg: 'rgba(34, 197, 94, 0.12)',  text: '#22c55e' },    // green — data sources
  WR:  { bg: 'rgba(239, 68, 68, 0.12)',  text: '#ef4444' },    // red — data destinations
  APP: { bg: 'rgba(234, 179, 8, 0.12)',  text: '#ca8a04' },    // yellow — applications
}
export const DEFAULT_TYPE_COLOR = { bg: 'rgba(107, 114, 128, 0.12)', text: '#6b7280' }

/** Derive short type label from componentId */
export function deriveTypeLabel(componentId: string): string {
  const id = componentId.toLowerCase()
  if (id.includes('snowflake')) return 'SQL'
  if (id.includes('synapse')) return 'SQL'
  if (id.includes('bigquery')) return 'SQL'
  if (id.includes('redshift')) return 'SQL'
  if (id.includes('python')) return 'PY'
  if (id.includes('julia')) return 'JL'
  if (id.includes('r-transformation') || id.includes('.r-')) return 'R'
  if (id.includes('dbt')) return 'dbt'
  if (id.includes('openrefine')) return 'OR'
  return 'SQL'
}

/** Transformation folder prefix sort order (matched against first segment of folder name) */
export const TRANSFORM_FOLDER_ORDER = ['AUX', 'BDM', 'BI', 'TEST', 'UC'] as const

/** Category sort priority for Table Browser default sort */
export const CATEGORY_SORT_PRIORITY: Record<Category, number> = {
  FCT: 0,
  FCTH: 1,
  DIM: 2,
  REF: 3,
  MAP: 4,
  AUX: 5,
  OTHER: 6,
}
