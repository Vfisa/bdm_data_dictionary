import { useMemo } from 'react'
import dagre from 'dagre'
import type { Node, Edge as FlowEdge } from '@xyflow/react'
import type { MetadataResponse, Edge as DataEdge, Category } from '@/lib/types'
import { CATEGORY_CONFIG, CATEGORY_ORDER } from '@/lib/constants'

/** Width/height of the custom table node */
const NODE_WIDTH = 220
const NODE_HEIGHT = 80

const NODE_SEP = 60
const RANK_SEP = 100

export interface TableNodeData {
  tableName: string
  category: Category
  columnCount: number
  rowsCount: number
  color: string
  tableId: string
  [key: string]: unknown
}

export interface ErdLayoutResult {
  nodes: Node<TableNodeData>[]
  edges: FlowEdge[]
}

/**
 * Convert metadata tables + edges into React Flow nodes/edges with Dagre layout.
 * Supports category filtering, node highlighting, and optional date edges.
 */
export function useErdLayout(
  metadata: MetadataResponse | null,
  visibleCategories: Set<Category>,
  selectedNodeId?: string | null,
  dateEdges?: DataEdge[],
): ErdLayoutResult {
  return useMemo(() => {
    if (!metadata) return { nodes: [], edges: [] }

    // Filter tables by visible categories
    const filteredTables = metadata.tables.filter((t) =>
      visibleCategories.has(t.category),
    )
    const visibleTableNames = new Set(filteredTables.map((t) => t.name))

    // Filter edges to only include those between visible tables
    const filteredEdges = metadata.edges.filter(
      (e) => visibleTableNames.has(e.source) && visibleTableNames.has(e.target),
    )

    // Build Dagre graph
    const g = new dagre.graphlib.Graph()
    g.setGraph({
      rankdir: 'TB',
      nodesep: NODE_SEP,
      ranksep: RANK_SEP,
      marginx: 40,
      marginy: 40,
    })
    g.setDefaultEdgeLabel(() => ({}))

    // Create a rank index for each category
    const categoryRank = new Map<Category, number>()
    CATEGORY_ORDER.forEach((cat, idx) => {
      categoryRank.set(cat, idx)
    })

    // Add nodes with rank hints
    filteredTables.forEach((table) => {
      const rank = categoryRank.get(table.category) ?? CATEGORY_ORDER.length
      g.setNode(table.name, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        rank: rank,
      })
    })

    // Add edges (only FK edges for layout — date edges excluded to avoid distortion)
    filteredEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target)
    })

    // Run Dagre layout
    dagre.layout(g)

    // Compute connected node set for highlighting
    const connectedNodeIds = new Set<string>()
    const connectedEdgeIds = new Set<string>()
    if (selectedNodeId) {
      connectedNodeIds.add(selectedNodeId)
      for (const edge of filteredEdges) {
        if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
          connectedNodeIds.add(edge.source)
          connectedNodeIds.add(edge.target)
          connectedEdgeIds.add(edge.id)
        }
      }
      if (dateEdges) {
        for (const edge of dateEdges) {
          if (
            (edge.source === selectedNodeId || edge.target === selectedNodeId) &&
            visibleTableNames.has(edge.source) &&
            visibleTableNames.has(edge.target)
          ) {
            connectedNodeIds.add(edge.source)
            connectedNodeIds.add(edge.target)
            connectedEdgeIds.add(edge.id)
          }
        }
      }
    }

    const hasSelection = !!selectedNodeId

    // Convert to React Flow nodes
    const nodes: Node<TableNodeData>[] = filteredTables.map((table) => {
      const nodeData = g.node(table.name)
      const config = CATEGORY_CONFIG[table.category]

      const isConnected = connectedNodeIds.has(table.name)
      const isDimmed = hasSelection && !isConnected

      return {
        id: table.name,
        type: 'tableNode',
        position: {
          x: nodeData.x - NODE_WIDTH / 2,
          y: nodeData.y - NODE_HEIGHT / 2,
        },
        data: {
          tableName: table.name,
          category: table.category,
          columnCount: table.columnCount,
          rowsCount: table.rowsCount,
          color: config.nodeHeader,
          tableId: table.id,
        },
        draggable: false,
        className: isDimmed ? 'dimmed' : isConnected && hasSelection ? 'highlighted' : '',
        style: isDimmed ? { opacity: 0.15, transition: 'opacity 0.2s ease' } : { transition: 'opacity 0.2s ease' },
      }
    })

    // Convert to React Flow edges (FK edges)
    const flowEdges: FlowEdge[] = filteredEdges.map((edge) => {
      const isConnected = connectedEdgeIds.has(edge.id)
      const isDimmed = hasSelection && !isConnected

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'default',
        animated: false,
        label: edge.label,
        labelStyle: { fontSize: 10, fill: 'var(--muted-foreground)' },
        labelShowBg: true,
        labelBgStyle: {
          fill: 'var(--background)',
          fillOpacity: 0.8,
        },
        labelBgPadding: [4, 2] as [number, number],
        style: isDimmed
          ? { stroke: 'var(--muted-foreground)', strokeWidth: 1, opacity: 0.08, transition: 'opacity 0.2s ease' }
          : isConnected && hasSelection
          ? { stroke: 'var(--primary)', strokeWidth: 2.5, opacity: 1, transition: 'opacity 0.2s ease' }
          : { stroke: 'var(--muted-foreground)', strokeWidth: 1, opacity: 0.6, transition: 'opacity 0.2s ease' },
        markerEnd: {
          type: 'arrowclosed' as const,
          color: isConnected && hasSelection ? 'var(--primary)' : 'var(--muted-foreground)',
          width: 16,
          height: 16,
        },
      }
    })

    // Append date edges (after layout — they connect existing nodes without affecting positioning)
    if (dateEdges && dateEdges.length > 0) {
      for (const edge of dateEdges) {
        if (!visibleTableNames.has(edge.source) || !visibleTableNames.has(edge.target)) continue

        const isConnected = connectedEdgeIds.has(edge.id)
        const isDimmed = hasSelection && !isConnected

        flowEdges.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'default',
          animated: false,
          label: edge.label,
          labelStyle: { fontSize: 9, fill: '#a855f7' },
          labelShowBg: true,
          labelBgStyle: {
            fill: 'var(--background)',
            fillOpacity: 0.8,
          },
          labelBgPadding: [4, 2] as [number, number],
          style: isDimmed
            ? { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '6 3', opacity: 0.05, transition: 'opacity 0.2s ease' }
            : { stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '6 3', opacity: 0.4, transition: 'opacity 0.2s ease' },
          markerEnd: {
            type: 'arrowclosed' as const,
            color: '#a855f7',
            width: 12,
            height: 12,
          },
        })
      }
    }

    return { nodes, edges: flowEdges }
  }, [metadata, visibleCategories, selectedNodeId, dateEdges])
}
