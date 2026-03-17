import { useEffect, useState } from 'react'
import type { TransformationFolder, ExtractorGroup } from './useDocSections'
import type { Flow, StorageBucket } from '@/lib/types'

interface DocTableOfContentsProps {
  storageBuckets: StorageBucket[]
  transformationFolders: TransformationFolder[]
  extractorGroups: ExtractorGroup[]
  flows: Flow[]
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
}: DocTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('doc-sources')

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

    const ids = [
      ...TOC_SECTIONS.map(s => s.id),
      ...storageBuckets.map(b => `doc-bucket-${b.id}`),
      ...transformationFolders.map(f => `doc-transform-${f.folder}`),
    ]

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [storageBuckets, transformationFolders])

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

          {/* Storage bucket sublists */}
          {section.id === 'doc-storage' && storageBuckets.map((b) => (
            <button
              key={b.id}
              className={`${linkClass(`doc-bucket-${b.id}`)} pl-6`}
              onClick={() => scrollTo(`doc-bucket-${b.id}`)}
            >
              {b.id} ({b.tables.length})
            </button>
          ))}

          {/* Transformation folder sublists */}
          {section.id === 'doc-transformations' && transformationFolders.map((f) => (
            <button
              key={f.folder}
              className={`${linkClass(`doc-transform-${f.folder}`)} pl-6`}
              onClick={() => scrollTo(`doc-transform-${f.folder}`)}
            >
              {f.folder} ({f.configs.length})
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}
