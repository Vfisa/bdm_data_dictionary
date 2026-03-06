import { useMemo } from 'react'
import type { MetadataResponse } from '@/lib/types'

export interface SearchResultTable {
  type: 'table'
  tableName: string
  tableId: string
  category: string
  description: string
}

export interface SearchResultColumn {
  type: 'column'
  columnName: string
  tableName: string
  tableId: string
  category: string
  columnType: string
}

export type SearchResult = SearchResultTable | SearchResultColumn

/**
 * Build a flat index of all tables and columns for the command palette.
 * cmdk handles the fuzzy filtering automatically via command-score.
 */
export function useSearch(metadata: MetadataResponse | null) {
  const tableResults = useMemo<SearchResultTable[]>(() => {
    if (!metadata) return []
    return metadata.tables.map((t) => ({
      type: 'table' as const,
      tableName: t.name,
      tableId: t.id,
      category: t.category,
      description: t.description || '',
    }))
  }, [metadata])

  const columnResults = useMemo<SearchResultColumn[]>(() => {
    if (!metadata) return []
    const results: SearchResultColumn[] = []
    for (const table of metadata.tables) {
      for (const col of table.columns) {
        results.push({
          type: 'column' as const,
          columnName: col.name,
          tableName: table.name,
          tableId: table.id,
          category: table.category,
          columnType: col.keboolaBaseType || col.databaseNativeType,
        })
      }
    }
    return results
  }, [metadata])

  return { tableResults, columnResults }
}
