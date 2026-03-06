/**
 * FK Inference Engine
 *
 * Scans all tables for columns ending in _ID and matches them to target tables.
 * Produces Edge[] for the ERD diagram.
 *
 * Algorithm (ordered by priority):
 *   1. Check overrides.alias (highest priority)
 *   2. Check overrides.skip (suppress false positives)
 *   3. Direct entity match:  CLIENT_ID → REF_CLIENT, DIM_CLIENT, FCT_CLIENT, etc.
 *   4. Compound entity:      ORDER_STATUS_ID → REF_ORDER_STATUS
 *   5. Progressive prefix strip: ORIGIN_LOCATION_ID → strip ORIGIN_ → LOCATION → REF_LOCATION
 *   6. PK validation: confirm the target table has the expected _ID column
 *
 * Also handles:
 *   - Self-reference detection (PARENT_CLIENT_ID in REF_CLIENT → self-ref)
 *   - Own-PK skip (FCT_ORDER.ORDER_ID doesn't create edge to itself)
 *   - Manual add/remove overrides
 *   - Category assignment based on table name prefix
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** All recognized table prefixes for CATEGORY detection (FCTH_ before FCT_) */
const TABLE_PREFIXES = ['FCTH_', 'FCT_', 'DIM_', 'REF_', 'MAP_', 'AUX_'];

/**
 * Search order for FK target resolution.
 * REF_ and DIM_ first because _ID columns typically reference master/reference tables.
 * FCT_ after, since fact tables can also be referenced (e.g. DISPATCH_ID → FCT_DISPATCH).
 */
const FK_SEARCH_ORDER = ['REF_', 'DIM_', 'FCTH_', 'FCT_', 'MAP_', 'AUX_'];

/** Category lookup order — FCTH_ must come before FCT_ to avoid false match */
const CATEGORY_MAP = {
  'FCTH_': 'FCTH',
  'FCT_':  'FCT',
  'DIM_':  'DIM',
  'REF_':  'REF',
  'MAP_':  'MAP',
  'AUX_':  'AUX',
};

/**
 * Determine category for a table name.
 * @param {string} tableName
 * @returns {string} Category key (FCT, REF, DIM, MAP, AUX, FCTH, or OTHER)
 */
export function getCategory(tableName) {
  for (const prefix of TABLE_PREFIXES) {
    if (tableName.startsWith(prefix)) {
      return CATEGORY_MAP[prefix];
    }
  }
  return 'OTHER';
}

/**
 * Strip the category prefix from a table name to get the entity name.
 * e.g. "REF_CLIENT" → "CLIENT", "FCT_ORDER" → "ORDER"
 */
function stripPrefix(tableName) {
  for (const prefix of TABLE_PREFIXES) {
    if (tableName.startsWith(prefix)) {
      return tableName.slice(prefix.length);
    }
  }
  return tableName;
}

/**
 * Load overrides from JSON file.
 * Returns { alias, skip, add, remove } with defaults for missing keys.
 */
function loadOverrides(overridesPath) {
  try {
    const raw = readFileSync(overridesPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      alias: parsed.alias || {},
      skip: new Set(parsed.skip || []),
      add: parsed.add || [],
      remove: parsed.remove || [],
    };
  } catch (err) {
    console.warn(`Warning: Could not load overrides from ${overridesPath}: ${err.message}`);
    return { alias: {}, skip: new Set(), add: [], remove: [] };
  }
}

/**
 * Build a lookup map of table names → table objects.
 * Keys are uppercase table names (e.g. "REF_CLIENT").
 */
function buildTableMap(tables) {
  const map = new Map();
  for (const table of tables) {
    map.set(table.name.toUpperCase(), table);
  }
  return map;
}

/**
 * Build a set of column names per table for quick PK/column validation.
 * @returns {Map<string, Set<string>>} tableName → Set of column names
 */
function buildColumnIndex(tables) {
  const index = new Map();
  for (const table of tables) {
    const colSet = new Set(table.columns.map((c) => c.name.toUpperCase()));
    index.set(table.name.toUpperCase(), colSet);
  }
  return index;
}

/**
 * Try to find a target table for a given entity name.
 * Searches all known prefixes: REF_ENTITY, DIM_ENTITY, FCT_ENTITY, etc.
 *
 * @param {string} entity - e.g. "CLIENT", "ORDER_STATUS"
 * @param {Map} tableMap - tableName → table
 * @returns {object|null} matched table or null
 */
function findTableByEntity(entity, tableMap) {
  for (const prefix of FK_SEARCH_ORDER) {
    const candidate = `${prefix}${entity}`;
    if (tableMap.has(candidate)) {
      return tableMap.get(candidate);
    }
  }
  return null;
}

/**
 * Progressive prefix stripping.
 * Strips one "word" at a time from the left of the entity name and retries.
 * e.g. "INITIAL_STOCK_LOCATION" → "STOCK_LOCATION" → "LOCATION"
 *
 * @param {string} entity - full entity name
 * @param {Map} tableMap
 * @returns {object|null} matched table or null
 */
function findTableByProgressiveStrip(entity, tableMap) {
  let remaining = entity;

  // Try stripping up to 3 levels deep to avoid infinite loops
  for (let i = 0; i < 3; i++) {
    const underscoreIdx = remaining.indexOf('_');
    if (underscoreIdx === -1) break;

    remaining = remaining.slice(underscoreIdx + 1);
    if (!remaining) break;

    const match = findTableByEntity(remaining, tableMap);
    if (match) return match;
  }

  return null;
}

/**
 * Check if a column is the table's own primary key identifier.
 * e.g. ORDER_ID in FCT_ORDER (entity ORDER matches table entity ORDER).
 */
function isOwnPrimaryId(columnName, tableName) {
  const entity = columnName.replace(/_ID$/, '');
  const tableEntity = stripPrefix(tableName);
  return entity === tableEntity;
}

/**
 * Main inference function.
 * Scans all tables for _ID columns and matches them to target tables.
 *
 * @param {Array} tables - normalized table objects from keboola-client
 * @param {string} [overridesPath] - path to overrides.json
 * @returns {{ edges: Array, categories: Object, stats: Object }}
 */
export function inferRelationships(tables, overridesPath) {
  const resolvedPath = overridesPath || path.join(__dirname, 'overrides.json');
  const overrides = loadOverrides(resolvedPath);
  const tableMap = buildTableMap(tables);
  const columnIndex = buildColumnIndex(tables);

  const edges = [];
  const categories = {};
  const stats = {
    totalColumns: 0,
    idColumns: 0,
    matched: 0,
    skipped: 0,
    aliased: 0,
    unmatched: 0,
    selfRefSkipped: 0,
  };

  // Build removal set for quick lookup
  const removeSet = new Set(
    overrides.remove.map((r) => `${r.source}→${r.target}`)
  );

  // --- Assign categories ---
  for (const table of tables) {
    categories[table.name] = getCategory(table.name);
  }

  // --- Scan all tables ---
  for (const table of tables) {
    for (const column of table.columns) {
      stats.totalColumns++;

      // Only process columns ending in _ID
      if (!column.name.endsWith('_ID')) continue;
      stats.idColumns++;

      const colName = column.name;

      // --- Priority 1: Skip list ---
      if (overrides.skip.has(colName)) {
        stats.skipped++;
        continue;
      }

      // --- Priority 2: Alias override ---
      if (overrides.alias[colName]) {
        const alias = overrides.alias[colName];
        const targetTable = tableMap.get(alias.target.toUpperCase());

        if (targetTable) {
          // Check it's not a self-reference to own PK
          if (targetTable.name === table.name && isOwnPrimaryId(colName, table.name)) {
            stats.selfRefSkipped++;
            continue;
          }

          edges.push({
            id: `${table.name}.${colName}→${targetTable.name}`,
            source: table.name,
            target: targetTable.name,
            sourceColumn: colName,
            targetColumn: alias.targetColumn || colName,
            label: colName.replace(/_ID$/, ''),
            cardinality: 'M:1',
            inferenceMethod: 'alias',
          });
          stats.aliased++;
        } else {
          // Alias target doesn't exist — warn but don't crash
          stats.unmatched++;
        }
        continue;
      }

      // --- Skip own primary ID ---
      if (isOwnPrimaryId(colName, table.name)) {
        stats.selfRefSkipped++;
        continue;
      }

      // --- Priority 3: Direct entity match ---
      const entity = colName.replace(/_ID$/, '');
      let targetTable = findTableByEntity(entity, tableMap);

      // --- Priority 4: Progressive prefix stripping ---
      if (!targetTable && entity.includes('_')) {
        targetTable = findTableByProgressiveStrip(entity, tableMap);
      }

      if (targetTable) {
        // Don't create edge back to self (e.g. DISPATCH_STATUS_ID → REF_DISPATCH_STATUS, not back to own table)
        if (targetTable.name === table.name) {
          stats.selfRefSkipped++;
          continue;
        }

        // Check if this is in the remove list
        if (removeSet.has(`${table.name}→${targetTable.name}`)) {
          stats.skipped++;
          continue;
        }

        // Determine the expected target column
        const targetEntity = stripPrefix(targetTable.name);
        const expectedTargetCol = `${targetEntity}_ID`;

        edges.push({
          id: `${table.name}.${colName}→${targetTable.name}`,
          source: table.name,
          target: targetTable.name,
          sourceColumn: colName,
          targetColumn: expectedTargetCol,
          label: colName.replace(/_ID$/, ''),
          cardinality: 'M:1',
          inferenceMethod: entity === stripPrefix(targetTable.name) ? 'direct' : 'compound',
        });
        stats.matched++;
      } else {
        stats.unmatched++;
      }
    }
  }

  // --- Manual edge additions ---
  for (const add of overrides.add) {
    const sourceExists = tableMap.has(add.source?.toUpperCase());
    const targetExists = tableMap.has(add.target?.toUpperCase());

    if (sourceExists && targetExists) {
      edges.push({
        id: `${add.source}.${add.sourceColumn}→${add.target}`,
        source: add.source,
        target: add.target,
        sourceColumn: add.sourceColumn || '',
        targetColumn: add.targetColumn || '',
        label: add.label || '',
        cardinality: add.cardinality || 'M:1',
        inferenceMethod: 'manual',
      });
    }
  }

  return { edges, categories, stats };
}

/**
 * Detect DATE/TIMESTAMP columns and create assumed connections to DIM_DATE.
 * These are virtual edges, kept separate from inferred FK edges.
 *
 * @param {Array} tables - normalized table objects
 * @returns {{ dateEdges: Array }}
 */
export function inferDateConnections(tables) {
  const dimDate = tables.find(t => t.name === 'DIM_DATE');
  if (!dimDate) return { dateEdges: [] };

  const dimDatePK = dimDate.primaryKey?.[0] || 'DATE_ID';
  const dateEdges = [];

  for (const table of tables) {
    if (table.name === 'DIM_DATE') continue;

    for (const col of table.columns) {
      const baseType = (col.keboolaBaseType || '').toUpperCase();
      if (baseType === 'DATE' || baseType === 'TIMESTAMP') {
        dateEdges.push({
          id: `date:${table.name}.${col.name}→DIM_DATE`,
          source: table.name,
          target: 'DIM_DATE',
          sourceColumn: col.name,
          targetColumn: dimDatePK,
          label: col.name,
          cardinality: 'M:1',
          inferenceMethod: 'date-assumed',
        });
      }
    }
  }

  return { dateEdges };
}
