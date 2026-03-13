/** Column definition from Keboola metadata */
export interface Column {
  name: string
  databaseNativeType: string
  keboolaBaseType: string
  nullable: boolean
  description: string
  length: string | null
}

/** Predefined tag values */
export const PREDEFINED_TAGS = ['verified', 'needs-review', 'deprecated', 'core', 'wip', 'sensitive'] as const
export type PredefinedTag = typeof PREDEFINED_TAGS[number]

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
  tags: string[]
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
  inferenceMethod: 'direct' | 'compound' | 'alias' | 'manual' | 'date-assumed'
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

/** Single transformation lineage entry */
export interface LineageEntry {
  configId: string
  configName: string
  componentId: string
  componentType: string          // "SQL", "PY", "dbt", "R", etc.
  lastChangeDate: string | null
  lastRunDate: string | null
  lastRunStatus: 'success' | 'error' | 'warning' | null
  keboolaUrl: string
}

/** Lineage index: maps table IDs to transformation entries */
export interface LineageIndex {
  producedBy: Record<string, LineageEntry[]>
  usedBy: Record<string, LineageEntry[]>
}

/** Full metadata response from /api/metadata */
export interface MetadataResponse {
  tables: TableSummary[]
  edges: Edge[]
  dateEdges: Edge[]
  categories: Record<string, Category>
  lastRefresh: string
  stats: InferenceStats
  lineage: LineageIndex
}

/** Description update payload for PUT /api/descriptions */
export interface DescriptionUpdate {
  itemId: string
  description: string
}

/** Per-column profiling statistics */
export interface ColumnProfile {
  columnName: string
  nullCount: number
  nullRate: number
  distinctCount: number
  duplicateCount: number
  isExact: boolean
  min: string | number | null
  max: string | number | null
  novalueCount: number
  novalueRate: number
  topValues: { value: string; count: number }[]
  sampleValues: string[]
}

/** Table-level profiling result from GET /api/profile/:tableId */
export interface TableProfile {
  tableId: string
  sampleSize: number
  totalRows: number
  profiledAt: string
  hasNativeProfile: boolean
  columns: ColumnProfile[]
}

/** Data preview result from GET /api/preview/:tableId */
export interface DataPreviewResult {
  columns: string[]
  rows: Record<string, string>[]
  totalAvailable: number
}

/** Stats filter for clickable KPI cards */
export type StatsFilter = 'missingTableDesc' | 'missingColDesc' | 'emptyTables' | null

/** App navigation page */
export type Page = 'overview' | 'tables' | 'erd' | 'docs'
