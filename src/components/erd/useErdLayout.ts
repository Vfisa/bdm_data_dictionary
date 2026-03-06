import { useMemo } from 'react'
import dagre from 'dagre'
import type { Node, Edge as FlowEdge } from '@xyflow/react'
import type { MetadataResponse, Category } from '@/lib/types'
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
 * Supports category filtering.
 */
export function useErdLayout(
  metadata: MetadataResponse | null,
  visibleCategories: Set<Category>,
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
        // Use rank as a hint for vertical positioning
        rank: rank,
      })
    })

    // Add edges
    filteredEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target)
    })

    // Run Dagre layout
    dagre.layout(g)

    // Convert to React Flow nodes
    const nodes: Node<TableNodeData>[] = filteredTables.map((table) => {
      const nodeData = g.node(table.name)
      const config = CATEGORY_CONFIG[table.category]
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
      }
    })

    // Convert to React Flow edges
    const edges: FlowEdge[] = filteredEdges.map((edge) => ({
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
      style: {
        stroke: 'var(--muted-foreground)',
        strokeWidth: 1,
        opacity: 0.6,
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: 'var(--muted-foreground)',
        width: 16,
        height: 16,
      },
    }))

    return { nodes, edges }
  }, [metadata, visibleCategories])
}
