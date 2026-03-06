import type { MetadataResponse } from './types'

/**
 * Generate a Mermaid erDiagram from full metadata.
 * Includes all tables and all edges (regardless of filters).
 */
export function generateMermaidERD(metadata: MetadataResponse): string {
  const lines: string[] = ['erDiagram']

  // Add relationships
  for (const edge of metadata.edges) {
    // Mermaid cardinality: }o--|| means many-to-one
    lines.push(`    ${edge.source} }o--|| ${edge.target} : "${edge.sourceColumn}"`)
  }

  // Add tables that have no relationships (orphans)
  const connected = new Set<string>()
  for (const edge of metadata.edges) {
    connected.add(edge.source)
    connected.add(edge.target)
  }
  for (const table of metadata.tables) {
    if (!connected.has(table.name)) {
      // Orphan table — add as standalone entity
      lines.push(`    ${table.name} {`)
      lines.push(`    }`)
    }
  }

  return lines.join('\n')
}
