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
 * Get sort priority for a folder name based on its prefix.
 * Folders are sorted by TRANSFORM_FOLDER_ORDER prefix, then alphabetically.
 * "Other" always sorts last.
 */
function getFolderSortKey(folder: string): string {
  if (folder === 'Other') return 'zzz'
  const prefix = folder.split(' - ')[0]?.replace('/', '') ?? ''
  const prefixOrder = TRANSFORM_FOLDER_ORDER as readonly string[]
  const idx = prefixOrder.findIndex(p => prefix.toUpperCase().startsWith(p))
  const order = idx >= 0 ? String(idx).padStart(2, '0') : '99'
  return `${order}:${folder}`
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

  // Transformations grouped by API folder name (KBC.configuration.folderName metadata)
  const transformationFolders = useMemo<TransformationFolder[]>(() => {
    if (!metadata?.componentConfigs) return []
    const transforms = metadata.componentConfigs.filter(c => c.componentType === 'transformation')
    const folderMap = new Map<string, ComponentConfig[]>()

    for (const config of transforms) {
      const folder = config.folderName || 'Other'
      const existing = folderMap.get(folder)
      if (existing) {
        existing.push(config)
      } else {
        folderMap.set(folder, [config])
      }
    }

    // Sort configs within each folder by name
    for (const configs of folderMap.values()) {
      configs.sort((a, b) => a.configName.localeCompare(b.configName))
    }

    // Sort folders by prefix priority (TRANSFORM_FOLDER_ORDER), then alphabetically
    return Array.from(folderMap.entries())
      .filter(([, configs]) => configs.length > 0)
      .sort(([a], [b]) => getFolderSortKey(a).localeCompare(getFolderSortKey(b)))
      .map(([folder, configs]) => ({ folder, configs }))
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
