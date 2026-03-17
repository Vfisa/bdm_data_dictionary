import type { MetadataResponse } from '@/lib/types'
import type { useDocSections } from './useDocSections'

type DocSections = ReturnType<typeof useDocSections>

/**
 * Export documentation as Markdown file.
 * Downloads a .md file with all sections.
 */
export function exportMarkdown(_metadata: MetadataResponse, sections: DocSections): void {
  const lines: string[] = []
  lines.push('# Project Documentation')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')

  // Section 1: Data Sources
  lines.push('## 1. Data Sources & Integrations')
  lines.push('')
  for (const group of sections.extractorGroups) {
    lines.push(`### ${group.componentName}`)
    for (const config of group.configs) {
      lines.push(`- **${config.configName}**${config.description ? `: ${config.description}` : ''}`)
      if (config.keboolaUrl) lines.push(`  - [Open in Keboola](${config.keboolaUrl})`)
      if (config.outputTables.length > 0) {
        lines.push(`  - Output: ${config.outputTables.map(t => t.split('.').pop()).join(', ')}`)
      }
    }
    lines.push('')
  }

  // Section 2: Data Model
  lines.push('## 2. Data Model by Layer')
  lines.push('')
  for (const { label, tables } of sections.tablesByLayer) {
    lines.push(`### ${label}`)
    for (const table of tables) {
      lines.push(`- **${table.name}** — ${table.columnCount} columns, ${table.rowsCount} rows`)
      if (table.description) lines.push(`  - ${table.description}`)
      if (table.primaryKey.length > 0) lines.push(`  - PK: ${table.primaryKey.join(', ')}`)
      if (table.keboolaUrl) lines.push(`  - [Open in Keboola](${table.keboolaUrl})`)
    }
    lines.push('')
  }

  // Section 3: Storage
  lines.push('## 3. Storage & Buckets')
  lines.push('')
  lines.push('| Bucket | Stage | Tables | Size |')
  lines.push('|--------|-------|--------|------|')
  for (const bucket of sections.buckets) {
    lines.push(`| ${bucket.id} | ${bucket.stage} | ${bucket.tableCount} | ${formatBytesSimple(bucket.totalSize)} |`)
  }
  lines.push('')

  // Section 4: Orchestration
  lines.push('## 4. Orchestration')
  lines.push('')
  for (const flow of sections.flows) {
    lines.push(`### ${flow.name}`)
    if (flow.description) lines.push(flow.description)
    if (flow.keboolaUrl) lines.push(`[Open in Keboola](${flow.keboolaUrl})`)
    for (const phase of flow.phases) {
      lines.push(`- **Phase: ${phase.name || 'Unnamed'}**`)
      const phaseTasks = (flow.tasks || []).filter(t => t.phaseId === phase.id)
      for (const task of phaseTasks) {
        lines.push(`  - ${task.name || task.configId} (${task.componentId.split('.').pop()})`)
      }
    }
    lines.push('')
  }

  // Section 5: Transformations
  lines.push('## 5. Transformation Documentation')
  lines.push('')
  for (const { label, configs } of sections.transformationsByLayer) {
    lines.push(`### ${label}`)
    for (const config of configs) {
      lines.push(`#### ${config.configName}`)
      if (config.description) lines.push(config.description)
      if (config.inputTables.length > 0) {
        lines.push(`- Input: ${config.inputTables.map(t => t.split('.').pop()).join(', ')}`)
      }
      if (config.outputTables.length > 0) {
        lines.push(`- Output: ${config.outputTables.map(t => t.split('.').pop()).join(', ')}`)
      }
      if (config.keboolaUrl) lines.push(`- [Open in Keboola](${config.keboolaUrl})`)
    }
    lines.push('')
  }

  // Section 6: Writers, Apps & Data Apps
  lines.push('## 6. Data Writers, Custom Applications & Data Apps')
  lines.push('')
  if (sections.writers.length > 0) {
    lines.push('### 6a. Data Writers')
    for (const w of sections.writers) {
      lines.push(`- **${w.configName}** (${w.componentName})${w.description ? `: ${w.description}` : ''}`)
      if (w.keboolaUrl) lines.push(`  - [Open in Keboola](${w.keboolaUrl})`)
    }
    lines.push('')
  }
  if (sections.dataGatewayConfigs.length > 0) {
    lines.push('### 6b. Data Gateway')
    for (const gw of sections.dataGatewayConfigs) {
      lines.push(`- **${gw.configName}**${gw.description ? `: ${gw.description}` : ''}`)
      if (gw.keboolaUrl) lines.push(`  - [Open in Keboola](${gw.keboolaUrl})`)
    }
    lines.push('')
  }
  if (sections.customApps.length > 0) {
    lines.push('### 6c. Custom Applications')
    for (const app of sections.customApps) {
      lines.push(`- **${app.configName}** (${app.componentName})${app.description ? `: ${app.description}` : ''}`)
      if (app.keboolaUrl) lines.push(`  - [Open in Keboola](${app.keboolaUrl})`)
    }
    lines.push('')
  }
  if (sections.dataApps.length > 0) {
    lines.push('### 6d. Data Apps')
    for (const app of sections.dataApps) {
      lines.push(`- **${app.name}**${app.description ? `: ${app.description}` : ''}`)
      if (app.deploymentUrl) lines.push(`  - Deployment: ${app.deploymentUrl}`)
      if (app.gitRepository) lines.push(`  - Repository: ${app.gitRepository}`)
      if (app.authType) lines.push(`  - Auth: ${app.authType}`)
      if (app.keboolaUrl) lines.push(`  - [Open in Keboola](${app.keboolaUrl})`)
    }
    lines.push('')
  }

  // Download
  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bdm-data-dictionary-${new Date().toISOString().slice(0, 10)}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatBytesSimple(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${bytes} B`
}
