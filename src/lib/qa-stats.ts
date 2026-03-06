import type { TableSummary } from './types'

/** Sentinel value used in BDM for missing FK references */
export const NOVALUE_SENTINEL = '$NOVALUE'

export interface QAStats {
  totalTables: number
  totalColumns: number
  totalRows: number
  tablesWithoutDescription: number
  columnsWithoutDescription: number
  emptyTables: number
  qaScore: number
}

export function computeQAStats(tables: TableSummary[]): QAStats {
  let totalColumns = 0
  let columnsWithoutDescription = 0
  let tablesWithoutDescription = 0
  let emptyTables = 0
  let totalRows = 0

  for (const table of tables) {
    totalRows += table.rowsCount
    if (!table.description) tablesWithoutDescription++
    if (table.rowsCount === 0) emptyTables++

    for (const col of table.columns) {
      totalColumns++
      if (!col.description) columnsWithoutDescription++
    }
  }

  const describedItems = (tables.length - tablesWithoutDescription) + (totalColumns - columnsWithoutDescription)
  const totalItems = tables.length + totalColumns
  const qaScore = totalItems > 0 ? Math.round((describedItems / totalItems) * 100) : 0

  return {
    totalTables: tables.length,
    totalColumns,
    totalRows,
    tablesWithoutDescription,
    columnsWithoutDescription,
    emptyTables,
    qaScore,
  }
}
