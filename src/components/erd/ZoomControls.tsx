import { useReactFlow } from '@xyflow/react'
import { Plus, Minus, Maximize2 } from 'lucide-react'

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  const btnClass =
    'flex items-center justify-center w-8 h-8 text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer'

  return (
    <div className="absolute bottom-24 right-3 z-10 flex flex-col rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-md overflow-hidden">
      <button
        className={btnClass}
        onClick={() => zoomIn({ duration: 200 })}
        title="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="h-px bg-[var(--border)]" />
      <button
        className={btnClass}
        onClick={() => zoomOut({ duration: 200 })}
        title="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="h-px bg-[var(--border)]" />
      <button
        className={btnClass}
        onClick={() => fitView({ padding: 0.1, duration: 300 })}
        title="Fit to view"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
