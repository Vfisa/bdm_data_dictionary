import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Columns3, Rows3 } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import type { TableNodeData } from './useErdLayout'

type TableNodeProps = NodeProps & {
  data: TableNodeData
}

function TableNodeComponent({ data, selected }: TableNodeProps) {
  return (
    <div
      className={`
        rounded-lg border overflow-hidden shadow-sm transition-shadow
        bg-[var(--card)] border-[var(--border)]
        ${selected ? 'shadow-lg ring-2 ring-[var(--ring)]' : 'hover:shadow-md'}
      `}
      style={{ width: 220 }}
    >
      {/* Color header bar */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: data.color }}
      />

      {/* Content */}
      <div className="px-3 py-2">
        {/* Category badge + table name */}
        <div className="flex items-start gap-1.5 mb-1.5">
          <span
            className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded-sm uppercase shrink-0 mt-0.5"
            style={{
              backgroundColor: `${data.color}18`,
              color: data.color,
            }}
          >
            {data.category}
          </span>
          <span className="text-sm font-medium text-[var(--foreground)] leading-tight truncate">
            {data.tableName}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Columns3 className="h-3 w-3" />
            {data.columnCount} cols
          </span>
          <span className="flex items-center gap-1">
            <Rows3 className="h-3 w-3" />
            {formatNumber(data.rowsCount)} rows
          </span>
        </div>
      </div>

      {/* Handles for edges */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[var(--muted-foreground)] !border-[var(--card)]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[var(--muted-foreground)] !border-[var(--card)]"
      />
    </div>
  )
}

export const TableNode = memo(TableNodeComponent)
