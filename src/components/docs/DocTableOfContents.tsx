import { useEffect, useState } from 'react'
import type { TablesByLayer, TransformationsByLayer, ExtractorGroup } from './useDocSections'
import type { Flow } from '@/lib/types'

interface DocTableOfContentsProps {
  tablesByLayer: TablesByLayer[]
  transformationsByLayer: TransformationsByLayer[]
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
  tablesByLayer,
  transformationsByLayer,
}: DocTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('doc-sources')

  // IntersectionObserver scroll-spy
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
      ...tablesByLayer.map(l => `doc-model-${l.layer}`),
      ...transformationsByLayer.map(l => `doc-transform-${l.layer}`),
    ]

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [tablesByLayer, transformationsByLayer])

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
    <nav className="py-4 space-y-1" aria-label="Documentation sections">
      {TOC_SECTIONS.map((section) => (
        <div key={section.id}>
          <button
            className={linkClass(section.id)}
            onClick={() => scrollTo(section.id)}
          >
            {section.label}
          </button>

          {/* Data Model sublayers */}
          {section.id === 'doc-data-model' && tablesByLayer.map((l) => (
            <button
              key={l.layer}
              className={`${linkClass(`doc-model-${l.layer}`)} pl-6`}
              onClick={() => scrollTo(`doc-model-${l.layer}`)}
            >
              {l.layer} ({l.tables.length})
            </button>
          ))}

          {/* Transformation sublayers */}
          {section.id === 'doc-transformations' && transformationsByLayer.map((l) => (
            <button
              key={l.layer}
              className={`${linkClass(`doc-transform-${l.layer}`)} pl-6`}
              onClick={() => scrollTo(`doc-transform-${l.layer}`)}
            >
              {l.layer} ({l.configs.length})
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}
