import { useMemo } from 'react'
import type { MetadataResponse, ComponentConfig, TableSummary, Category } from '@/lib/types'

/** Data layer ordering for documentation sections */
const LAYER_ORDER: Category[] = ['AUX', 'REF', 'DIM', 'FCT', 'FCTH', 'MAP', 'OTHER']

const LAYER_LABELS: Record<Category, string> = {
  AUX: 'Auxiliary (AUX)',
  REF: 'Reference (REF)',
  DIM: 'Dimension (DIM)',
  FCT: 'Fact (FCT)',
  FCTH: 'Fact Historical (FCTH)',
  MAP: 'Mapping (MAP)',
  OTHER: 'Other',
}

export interface ExtractorGroup {
  componentId: string
  componentName: string
  configs: ComponentConfig[]
}

export interface TablesByLayer {
  layer: Category
  label: string
  tables: TableSummary[]
}

export interface TransformationsByLayer {
  layer: Category
  label: string
  configs: ComponentConfig[]
}

export interface BucketInfo {
  id: string
  displayName: string
  stage: string
  tableCount: number
  totalSize: number
}

export function useDocSections(metadata: MetadataResponse | null) {
  // Group extractors by component
  const extractorGroups = useMemo<ExtractorGroup[]>(() => {
    if (!metadata?.componentConfigs) return []
    const extractors = metadata.componentConfigs.filter(c => c.componentType === 'extractor')
    const groups = new Map<string, ExtractorGroup>()
    for (const config of extractors) {
      const existing = groups.get(config.componentId)
      if (existing) {
        existing.configs.push(config)
      } else {
        groups.set(config.componentId, {
          componentId: config.componentId,
          componentName: config.componentName,
          configs: [config],
        })
      }
    }
    return Array.from(groups.values()).sort((a, b) => a.componentName.localeCompare(b.componentName))
  }, [metadata?.componentConfigs])

  // Tables grouped by data layer
  const tablesByLayer = useMemo<TablesByLayer[]>(() => {
    if (!metadata?.tables) return []
    const result: TablesByLayer[] = []
    for (const layer of LAYER_ORDER) {
      const tables = metadata.tables
        .filter(t => t.category === layer)
        .sort((a, b) => a.name.localeCompare(b.name))
      if (tables.length > 0) {
        result.push({ layer, label: LAYER_LABELS[layer], tables })
      }
    }
    return result
  }, [metadata?.tables])

  // Bucket summary
  const buckets = useMemo<BucketInfo[]>(() => {
    if (!metadata?.tables) return []
    const bucketMap = new Map<string, BucketInfo>()
    for (const t of metadata.tables) {
      const existing = bucketMap.get(t.bucket)
      if (existing) {
        existing.tableCount++
        existing.totalSize += t.dataSizeBytes
      } else {
        const parts = t.bucket.split('.')
        const stage = parts[0] === 'in' ? 'Input' : 'Output'
        bucketMap.set(t.bucket, {
          id: t.bucket,
          displayName: parts.slice(1).join('.').replace(/^c-/, ''),
          stage,
          tableCount: 1,
          totalSize: t.dataSizeBytes,
        })
      }
    }
    return Array.from(bucketMap.values()).sort((a, b) => a.id.localeCompare(b.id))
  }, [metadata?.tables])

  // Transformations grouped by output layer
  const transformationsByLayer = useMemo<TransformationsByLayer[]>(() => {
    if (!metadata?.componentConfigs) return []
    const transforms = metadata.componentConfigs.filter(c => c.componentType === 'transformation')
    const layerMap = new Map<Category, ComponentConfig[]>()

    for (const config of transforms) {
      // Determine the output layer from output table names
      let layer: Category = 'OTHER'
      for (const outTable of config.outputTables) {
        const tableName = outTable.split('.').pop() || ''
        if (tableName.startsWith('FCTH_')) { layer = 'FCTH'; break }
        if (tableName.startsWith('FCT_')) { layer = 'FCT'; break }
        if (tableName.startsWith('REF_')) { layer = 'REF'; break }
        if (tableName.startsWith('DIM_')) { layer = 'DIM'; break }
        if (tableName.startsWith('MAP_')) { layer = 'MAP'; break }
        if (tableName.startsWith('AUX_')) { layer = 'AUX'; break }
      }
      const existing = layerMap.get(layer)
      if (existing) {
        existing.push(config)
      } else {
        layerMap.set(layer, [config])
      }
    }

    const result: TransformationsByLayer[] = []
    for (const layer of LAYER_ORDER) {
      const configs = layerMap.get(layer)
      if (configs && configs.length > 0) {
        configs.sort((a, b) => a.configName.localeCompare(b.configName))
        result.push({ layer, label: LAYER_LABELS[layer], configs })
      }
    }
    return result
  }, [metadata?.componentConfigs])

  // Writers
  const writers = useMemo(() => {
    if (!metadata?.componentConfigs) return []
    return metadata.componentConfigs
      .filter(c => c.componentType === 'writer')
      .sort((a, b) => a.configName.localeCompare(b.configName))
  }, [metadata?.componentConfigs])

  // Data Gateway configs (keboola.app-data-gateway)
  const dataGatewayConfigs = useMemo(() => {
    if (!metadata?.componentConfigs) return []
    return metadata.componentConfigs
      .filter(c => c.componentId === 'keboola.app-data-gateway')
      .sort((a, b) => a.configName.localeCompare(b.configName))
  }, [metadata?.componentConfigs])

  // Custom applications (excluding data gateway and data apps)
  const customApps = useMemo(() => {
    if (!metadata?.componentConfigs) return []
    return metadata.componentConfigs
      .filter(c =>
        c.componentType === 'application' &&
        c.componentId !== 'keboola.app-data-gateway'
      )
      .sort((a, b) => a.configName.localeCompare(b.configName))
  }, [metadata?.componentConfigs])

  // Flows
  const flows = useMemo(() => {
    return metadata?.flows ?? []
  }, [metadata?.flows])

  // Data Apps
  const dataApps = useMemo(() => {
    return metadata?.dataApps ?? []
  }, [metadata?.dataApps])

  return {
    extractorGroups,
    tablesByLayer,
    buckets,
    transformationsByLayer,
    writers,
    dataGatewayConfigs,
    customApps,
    flows,
    dataApps,
  }
}
