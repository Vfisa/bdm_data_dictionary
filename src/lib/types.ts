/** Column definition from Keboola metadata */
export interface Column {
  name: string
  databaseNativeType: string
  keboolaBaseType: string
  nullable: boolean
  description: string
  length: string | null
}

/** Table summary (from /api/metadata) */
export interface TableSummary {
  id: string
  name: string
  description: string
  primaryKey: string[]
  rowsCount: number
  dataSizeBytes: number
  columnCount: number
  columns: Column[]
  bucket: string
  category: Category
  lastImportDate: string | null
}

/** Table detail with relationships (from /api/table/:id) */
export interface TableDetail extends TableSummary {
  relationships: {
    outgoing: Edge[]
    incoming: Edge[]
  }
}

/** Inferred FK edge */
export interface Edge {
  id: string
  source: string
  target: string
  sourceColumn: string
  targetColumn: string
  label: string
  cardinality: string
  inferenceMethod: 'direct' | 'compound' | 'alias' | 'manual'
}

/** Table category */
export type Category = 'DIM' | 'FCT' | 'FCTH' | 'REF' | 'MAP' | 'AUX' | 'OTHER'

/** Inference stats */
export interface InferenceStats {
  totalColumns: number
  idColumns: number
  matched: number
  skipped: number
  aliased: number
  unmatched: number
  selfRefSkipped: number
}

/** Full metadata response from /api/metadata */
export interface MetadataResponse {
  tables: TableSummary[]
  edges: Edge[]
  categories: Record<string, Category>
  lastRefresh: string
  stats: InferenceStats
}

/** App navigation page */
export type Page = 'erd' | 'tables'
