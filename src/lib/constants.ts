import type { Category } from './types'

/** Category display configuration */
export const CATEGORY_CONFIG: Record<Category, {
  label: string
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

/** Ordered list of categories for display (rank order for ERD layout) */
export const CATEGORY_ORDER: Category[] = [
  'DIM', 'FCT', 'FCTH', 'MAP', 'AUX', 'REF', 'OTHER',
]
