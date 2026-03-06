import { useState, type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, side = 'top', className, ...props }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap',
            'bg-[var(--popover)] text-[var(--popover-foreground)]',
            'border border-[var(--border)] shadow-md',
            'animate-in fade-in-0 zoom-in-95',
            positions[side],
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}
