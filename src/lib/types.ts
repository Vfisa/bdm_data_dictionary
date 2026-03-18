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
  keboolaUrl: string
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

/** Component category for lineage entries */
export type ComponentCategory = 'extractor' | 'transformation' | 'writer' | 'application'

/** Single component lineage entry */
export interface LineageEntry {
  configId: string
  configName: string
  componentId: string
  componentType: string          // "SQL", "PY", "dbt", "R", "EXT", "WR", "APP"
  componentCategory: ComponentCategory
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

/** Row-level config detail for writers/applications */
export interface ConfigRow {
  name: string
  description: string
  inputTables: string[]
  incremental: boolean | null
  tableId: string | null
  dbName: string | null
}

/** Connection info for DB writers / data gateway */
export interface ConnectionInfo {
  host: string | null
  schema: string | null
  warehouse: string | null
  loginType: string | null
  driver: string | null
}

/** Component configuration from Keboola */
export interface ComponentConfig {
  configId: string
  configName: string
  componentId: string
  componentName: string
  componentType: string
  description: string
  inputTables: string[]
  outputTables: string[]
  lastChangeDate: string | null
  version: number
  keboolaUrl: string
  configRows?: ConfigRow[]
  connectionInfo?: ConnectionInfo
}

/** Flow task (a config reference within a flow) */
export interface FlowTask {
  id: string
  name: string
  phaseId: string
  enabled: boolean
  componentId: string
  configId: string
}

/** Flow phase */
export interface FlowPhase {
  id: string
  name: string
  description: string
  dependsOn: string[]
  hasConditions: boolean
}

/** Orchestration flow from Keboola */
export interface Flow {
  id: string
  name: string
  description: string
  componentId: string
  isDisabled: boolean
  phases: FlowPhase[]
  tasks: FlowTask[]
  phaseCount: number
  taskCount: number
  keboolaUrl: string
}

/** Data App configuration from Keboola */
export interface DataApp {
  id: string
  name: string
  description: string
  type: string
  gitRepository: string | null
  gitBranch: string | null
  authType: string | null
  deploymentUrl: string | null
  autoSuspendAfterSeconds: number | null
  keboolaUrl: string
}

/** Bucket table entry for storage documentation */
export interface StorageBucketTable {
  id: string
  name: string
  description: string
  columnCount: number
}

/** Storage bucket for documentation */
export interface StorageBucket {
  id: string
  name: string
  displayName: string
  stage: string
  description: string
  tables: StorageBucketTable[]
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
  componentConfigs: ComponentConfig[]
  flows: Flow[]
  dataApps: DataApp[]
  allBuckets: StorageBucket[]
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
