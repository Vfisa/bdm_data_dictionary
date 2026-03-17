import { useMemo } from 'react'
import { TRANSFORM_FOLDER_ORDER } from '@/lib/constants'
import type { MetadataResponse, ComponentConfig, StorageBucket } from '@/lib/types'

export interface ExtractorGroup {
  componentId: string
  componentName: string
  configs: ComponentConfig[]
}

export interface TransformationFolder {
  folder: string
  configs: ComponentConfig[]
}

/**
 * Parse transformation folder from config name.
 * E.g. "BDM - L1 - Order" → { folder: "BDM", sortKey: "L1" }
 * E.g. "UC - Client Mapping" → { folder: "UC", sortKey: "" }
 */
function parseTransformFolder(name: string): { folder: string; sortKey: string } {
  const parts = name.split(' - ').map(s => s.trim())
  if (parts.length < 2) return { folder: 'Other', sortKey: '' }
  const folder = (parts[0] ?? '').toUpperCase()
  const knownFolders = TRANSFORM_FOLDER_ORDER as readonly string[]
  if (!knownFolders.includes(folder)) return { folder: 'Other', sortKey: '' }
  const sortKey: string = parts.length >= 3 ? (parts[1] ?? '') : ''
  return { folder, sortKey }
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

  // All storage buckets (from full project listing)
  const storageBuckets = useMemo<StorageBucket[]>(() => {
    return metadata?.allBuckets ?? []
  }, [metadata?.allBuckets])

  // Transformations grouped by folder prefix
  const transformationFolders = useMemo<TransformationFolder[]>(() => {
    if (!metadata?.componentConfigs) return []
    const transforms = metadata.componentConfigs.filter(c => c.componentType === 'transformation')
    const folderMap = new Map<string, ComponentConfig[]>()

    for (const config of transforms) {
      const { folder } = parseTransformFolder(config.configName)
      const existing = folderMap.get(folder)
      if (existing) {
        existing.push(config)
      } else {
        folderMap.set(folder, [config])
      }
    }

    // Sort configs within each folder by sortKey then name
    for (const configs of folderMap.values()) {
      configs.sort((a, b) => {
        const pa = parseTransformFolder(a.configName)
        const pb = parseTransformFolder(b.configName)
        const keyCmp = pa.sortKey.localeCompare(pb.sortKey)
        if (keyCmp !== 0) return keyCmp
        return a.configName.localeCompare(b.configName)
      })
    }

    // Sort folders by defined order, then "Other" last
    const knownOrder = TRANSFORM_FOLDER_ORDER as readonly string[]
    const result: TransformationFolder[] = []
    for (const folder of knownOrder) {
      const configs = folderMap.get(folder)
      if (configs && configs.length > 0) {
        result.push({ folder, configs })
        folderMap.delete(folder)
      }
    }
    const remaining = Array.from(folderMap.entries())
      .filter(([, configs]) => configs.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
    for (const [folder, configs] of remaining) {
      result.push({ folder, configs })
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

  // Data Gateway configs
  const dataGatewayConfigs = useMemo(() => {
    if (!metadata?.componentConfigs) return []
    return metadata.componentConfigs
      .filter(c => c.componentId === 'keboola.app-data-gateway')
      .sort((a, b) => a.configName.localeCompare(b.configName))
  }, [metadata?.componentConfigs])

  // Custom applications (excluding data gateway)
  const customApps = useMemo(() => {
    if (!metadata?.componentConfigs) return []
    return metadata.componentConfigs
      .filter(c =>
        c.componentType === 'application' &&
        c.componentId !== 'keboola.app-data-gateway'
      )
      .sort((a, b) => a.configName.localeCompare(b.configName))
  }, [metadata?.componentConfigs])

  const flows = useMemo(() => metadata?.flows ?? [], [metadata?.flows])
  const dataApps = useMemo(() => metadata?.dataApps ?? [], [metadata?.dataApps])

  return {
    extractorGroups,
    storageBuckets,
    transformationFolders,
    writers,
    dataGatewayConfigs,
    customApps,
    flows,
    dataApps,
  }
}
