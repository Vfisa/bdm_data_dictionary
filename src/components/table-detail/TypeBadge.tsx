import {
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  HelpCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface TypeBadgeProps {
  baseType: string
  nativeType: string
}

/** Map base types to icons and colors */
function getTypeInfo(baseType: string): { icon: ReactNode; color: string; bg: string } {
  const type = baseType.toUpperCase()

  if (type === 'INTEGER' || type === 'NUMERIC' || type === 'FLOAT') {
    return {
      icon: <Hash className="h-3 w-3" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    }
  }

  if (type === 'STRING' || type === 'VARCHAR') {
    return {
      icon: <Type className="h-3 w-3" />,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950',
    }
  }

  if (type === 'DATE' || type === 'TIMESTAMP') {
    return {
      icon: <Calendar className="h-3 w-3" />,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950',
    }
  }

  if (type === 'BOOLEAN') {
    return {
      icon: <ToggleLeft className="h-3 w-3" />,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950',
    }
  }

  return {
    icon: <HelpCircle className="h-3 w-3" />,
    color: 'text-[var(--muted-foreground)]',
    bg: 'bg-[var(--muted)]',
  }
}

export function TypeBadge({ baseType, nativeType }: TypeBadgeProps) {
  const { icon, color, bg } = getTypeInfo(baseType)

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${color} ${bg}`}
      title={nativeType}
    >
      {icon}
      {baseType || nativeType}
    </span>
  )
}
