import { useState, useCallback } from 'react'
import { DocToolbar } from '@/components/docs/DocToolbar'
import { DocTableOfContents } from '@/components/docs/DocTableOfContents'
import { DocSourcesSection } from '@/components/docs/DocSourcesSection'
import { DocDataModelSection } from '@/components/docs/DocDataModelSection'
import { DocStorageSection } from '@/components/docs/DocStorageSection'
import { DocOrchestrationSection } from '@/components/docs/DocOrchestrationSection'
import { DocTransformSection } from '@/components/docs/DocTransformSection'
import { DocWritersAppsSection } from '@/components/docs/DocWritersAppsSection'
import { useDocSections } from '@/components/docs/useDocSections'
import type { MetadataResponse } from '@/lib/types'

interface ProjectDocumentationPageProps {
  metadata: MetadataResponse
  isRefreshing: boolean
  onRefresh: () => void
  onDescriptionUpdated: () => void
}

export function ProjectDocumentationPage({
  metadata,
  isRefreshing,
  onRefresh,
}: ProjectDocumentationPageProps) {
  const [allExpanded, setAllExpanded] = useState(false)
  const sections = useDocSections(metadata)

  const handleToggleExpand = useCallback(() => {
    setAllExpanded(prev => !prev)
  }, [])

  const handlePrint = useCallback(() => {
    setAllExpanded(true)
    setTimeout(() => window.print(), 200)
  }, [])

  const handleExportMarkdown = useCallback(() => {
    import('@/components/docs/doc-export').then(mod => {
      mod.exportMarkdown(metadata, sections)
    })
  }, [metadata, sections])

  return (
    <div className="flex h-full flex-col">
      <DocToolbar
        lastRefresh={metadata.lastRefresh}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        allExpanded={allExpanded}
        onToggleExpand={handleToggleExpand}
        onPrint={handlePrint}
        onExportMarkdown={handleExportMarkdown}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar TOC */}
        <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] lg:block print:hidden">
          <DocTableOfContents
            storageBuckets={sections.storageBuckets}
            transformationFolders={sections.transformationFolders}
            extractorGroups={sections.extractorGroups}
            flows={sections.flows}
            writers={sections.writers}
            dataGatewayConfigs={sections.dataGatewayConfigs}
            customApps={sections.customApps}
            dataApps={sections.dataApps}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 print:px-0 print:py-0" id="doc-content">
          <div className="mx-auto max-w-4xl space-y-10">
            <section id="doc-sources">
              <DocSourcesSection
                extractorGroups={sections.extractorGroups}
                allExpanded={allExpanded}
              />
            </section>

            <section id="doc-data-model">
              <DocDataModelSection />
            </section>

            <section id="doc-storage">
              <DocStorageSection
                storageBuckets={sections.storageBuckets}
                allExpanded={allExpanded}
              />
            </section>

            <section id="doc-orchestration">
              <DocOrchestrationSection
                flows={sections.flows}
                allExpanded={allExpanded}
              />
            </section>

            <section id="doc-transformations">
              <DocTransformSection
                transformationFolders={sections.transformationFolders}
                allExpanded={allExpanded}
              />
            </section>

            <section id="doc-writers-apps">
              <DocWritersAppsSection
                writers={sections.writers}
                dataGatewayConfigs={sections.dataGatewayConfigs}
                customApps={sections.customApps}
                dataApps={sections.dataApps}
                allExpanded={allExpanded}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
