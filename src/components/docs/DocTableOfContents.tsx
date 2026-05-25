import { useEffect, useMemo, useState } from 'react'
import type { TransformationFolder, ExtractorGroup } from './useDocSections'
import type { Flow, StorageBucket, ComponentConfig, DataApp } from '@/lib/types'

interface DocTableOfContentsProps {
  storageBuckets: StorageBucket[]
  transformationFolders: TransformationFolder[]
  extractorGroups: ExtractorGroup[]
  flows: Flow[]
  writers: ComponentConfig[]
  dataGatewayConfigs: ComponentConfig[]
  customApps: ComponentConfig[]
  dataApps: DataApp[]
}

interface TocSubItem {
  id: string
  label: string
}

const TOC_SECTIONS = [
  { id: 'doc-sources', label: 'Data Sources' },
  { id: 'doc-data-model', label: 'Data Model' },
  { id: 'doc-storage', label: 'Storage & Buckets' },
  { id: 'doc-orchestration', label: 'Orchestration' },
  { id: 'doc-transformations', label: 'Transformations' },
  { id: 'doc-writers-apps', label: 'Writers, Apps & Data Apps' },
]

export function DocTableOfContents({
  storageBuckets,
  transformationFolders,
  extractorGroups,
  flows,
  writers,
  dataGatewayConfigs,
  customApps,
  dataApps,
}: DocTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('doc-sources')

  // Build subsection maps
  const subsections = useMemo(() => {
    const map = new Map<string, TocSubItem[]>()

    // Data Sources — per component
    if (extractorGroups.length > 0) {
      map.set('doc-sources', extractorGroups.map(g => ({
        id: `doc-source-${g.componentId}`,
        label: `${g.componentName} (${g.configs.length})`,
      })))
    }

    // Storage — per stage
    const inputCount = storageBuckets.filter(b => b.stage === 'in').length
    const outputCount = storageBuckets.filter(b => b.stage === 'out').length
    const storageItems: TocSubItem[] = []
    if (inputCount > 0) storageItems.push({ id: 'doc-storage-in', label: `Input Stage (${inputCount})` })
    if (outputCount > 0) storageItems.push({ id: 'doc-storage-out', label: `Output Stage (${outputCount})` })
    if (storageItems.length > 0) map.set('doc-storage', storageItems)

    // Orchestration — per flow
    if (flows.length > 0) {
      map.set('doc-orchestration', flows.map(f => ({
        id: `doc-flow-${f.id}`,
        label: f.name,
      })))
    }

    // Transformations — per folder (unchanged)
    if (transformationFolders.length > 0) {
      map.set('doc-transformations', transformationFolders.map(f => ({
        id: `doc-transform-${f.folder}`,
        label: `${f.folder} (${f.configs.length})`,
      })))
    }

    // Writers, Apps & Data Apps — per category
    const writerItems: TocSubItem[] = []
    if (writers.length > 0) writerItems.push({ id: 'doc-writers', label: `Data Writers (${writers.length})` })
    if (dataGatewayConfigs.length > 0) writerItems.push({ id: 'doc-data-gateway', label: `Data Gateway (${dataGatewayConfigs.length})` })
    if (customApps.length > 0) writerItems.push({ id: 'doc-custom-apps', label: `Custom Applications (${customApps.length})` })
    if (dataApps.length > 0) writerItems.push({ id: 'doc-data-apps', label: `Data Apps (${dataApps.length})` })
    if (writerItems.length > 0) map.set('doc-writers-apps', writerItems)

    return map
  }, [extractorGroups, storageBuckets, flows, transformationFolders, writers, dataGatewayConfigs, customApps, dataApps])

  // Collect all observable IDs
  const allIds = useMemo(() => {
    const ids = TOC_SECTIONS.map(s => s.id)
    for (const items of subsections.values()) {
      for (const item of items) ids.push(item.id)
    }
    return ids
  }, [subsections])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    for (const id of allIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [allIds])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const linkClass = (id: string) =>
    `block py-1 px-3 text-xs cursor-pointer rounded transition-colors ${
      activeId === id
        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-medium'
        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]/50'
    }`

  return (
    <nav className="py-4 space-y-0.5" aria-label="Documentation sections">
      {TOC_SECTIONS.map((section) => (
        <div key={section.id}>
          <button
            className={linkClass(section.id)}
            onClick={() => scrollTo(section.id)}
          >
            {section.label}
          </button>

          {/* Render subsections for this section */}
          {subsections.get(section.id)?.map((sub) => (
            <button
              key={sub.id}
              className={`${linkClass(sub.id)} pl-6`}
              onClick={() => scrollTo(sub.id)}
            >
              {sub.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}
