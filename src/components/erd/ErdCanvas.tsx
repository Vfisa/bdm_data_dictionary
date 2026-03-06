import { useCallback, useState, useRef } from 'react'
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { toPng } from 'html-to-image'
import { TableNode } from './TableNode'
import { ErdToolbar } from './ErdToolbar'
import { useErdLayout, type TableNodeData } from './useErdLayout'
import { CATEGORY_ORDER } from '@/lib/constants'
import type { MetadataResponse, Category } from '@/lib/types'

/** Register custom node types */
const nodeTypes: NodeTypes = {
  tableNode: TableNode as any,
}

interface ErdCanvasInnerProps {
  metadata: MetadataResponse
  isRefreshing: boolean
  onRefresh: () => void
  onSelectTable: (tableName: string) => void
  selectedTable: string | null
}

function ErdCanvasInner({
  metadata,
  isRefreshing,
  onRefresh,
  onSelectTable,
  selectedTable,
}: ErdCanvasInnerProps) {
  const { fitView } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)

  // Category visibility state — all visible by default
  const [visibleCategories, setVisibleCategories] = useState<Set<Category>>(
    () => new Set(CATEGORY_ORDER),
  )

  // Date links toggle — off by default
  const [showDateLinks, setShowDateLinks] = useState(false)

  const toggleCategory = useCallback((category: Category) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        if (next.size > 1) {
          next.delete(category)
        }
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  // Compute layout with highlighting and optional date edges
  const dateEdges = showDateLinks ? metadata.dateEdges : undefined
  const { nodes, edges } = useErdLayout(metadata, visibleCategories, selectedTable, dateEdges)

  // Handle node click → open detail panel
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onSelectTable(node.id)
    },
    [onSelectTable],
  )

  // Handle pane click → clear selection
  const handlePaneClick = useCallback(() => {
    onSelectTable('')
  }, [onSelectTable])

  // Handle fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1, duration: 300 })
  }, [fitView])

  // Handle export as PNG
  const handleExport = useCallback(async () => {
    const viewport = containerRef.current?.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) return
    try {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
      const dataUrl = await toPng(viewport, {
        backgroundColor: bgColor.startsWith('oklch') ? '#1a1a1a' : bgColor,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `erd-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }, [])

  // Count visible tables/edges
  const visibleTableCount = nodes.length
  const visibleEdgeCount = edges.length

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      <ErdToolbar
        visibleCategories={visibleCategories}
        onToggleCategory={toggleCategory}
        lastRefresh={metadata.lastRefresh}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onFitView={handleFitView}
        onExport={handleExport}
        tableCount={visibleTableCount}
        edgeCount={visibleEdgeCount}
        showDateLinks={showDateLinks}
        onToggleDateLinks={() => setShowDateLinks((v) => !v)}
        hasDateEdges={(metadata.dateEdges?.length ?? 0) > 0}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnScroll
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'default',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--muted-foreground)"
          style={{ opacity: 0.15 }}
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as TableNodeData
            return data?.color ?? 'var(--muted-foreground)'
          }}
          nodeStrokeWidth={0}
          nodeBorderRadius={4}
          maskColor="var(--background)"
          maskStrokeColor="var(--border)"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}

/** Wrapped with ReactFlowProvider */
interface ErdCanvasProps {
  metadata: MetadataResponse
  isRefreshing: boolean
  onRefresh: () => void
  onSelectTable: (tableName: string) => void
  selectedTable: string | null
}

export function ErdCanvas(props: ErdCanvasProps) {
  return (
    <ReactFlowProvider>
      <ErdCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
