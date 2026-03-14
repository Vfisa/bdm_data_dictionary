/**
 * Keboola Storage API Client
 *
 * Wrapper for fetching table metadata from Keboola Storage API.
 * Uses native fetch() with X-StorageApi-Token header.
 */

/**
 * Create a Keboola Storage API client.
 *
 * @param {string} kbcUrl - Base URL (e.g. https://connection.eu-central-1.keboola.com)
 * @param {string} kbcToken - Storage API token
 * @returns {{ listBucketTables, getTable, listAllTables }}
 */
export function createClient(kbcUrl, kbcToken) {
  // Strip trailing slash and any # prefix from token (Keboola env injection quirk)
  const baseUrl = kbcUrl.replace(/\/+$/, '');
  const token = kbcToken.replace(/^#/, '');

  /**
   * Generic API request helper.
   */
  async function request(endpoint) {
    const url = `${baseUrl}/v2/storage/${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'X-StorageApi-Token': token,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `Keboola API error: ${res.status} ${res.statusText} — ${endpoint}\n${body}`
      );
    }

    return res.json();
  }

  /**
   * Normalize a raw Keboola table object to a clean schema.
   * Handles columns, metadata, and columnMetadata from the API response.
   */
  function normalizeTable(raw) {
    const tableId = raw.id; // e.g. "out.c-bdm.REF_CLIENT"
    const name = raw.name; // e.g. "REF_CLIENT"

    // Extract table description from metadata array
    const description = extractMetadataValue(raw.metadata, 'KBC.description') || '';

    // Extract tags from metadata (stored as JSON array under bdm.tags key)
    let tags = [];
    const tagsRaw = extractMetadataValue(raw.metadata, 'bdm.tags');
    if (tagsRaw) {
      try { tags = JSON.parse(tagsRaw); } catch (_) { /* ignore parse errors */ }
    }

    // Build column definitions
    const columns = (raw.columns || []).map((colName) => {
      const colMeta = (raw.columnMetadata || {})[colName] || [];

      return {
        name: colName,
        databaseNativeType: extractMetadataValue(colMeta, 'KBC.datatype.type')
          || extractMetadataValue(colMeta, 'KBC.datatype.basetype')
          || 'VARCHAR',
        keboolaBaseType: extractMetadataValue(colMeta, 'KBC.datatype.basetype') || 'STRING',
        nullable: extractMetadataValue(colMeta, 'KBC.datatype.nullable') !== '0',
        description: extractMetadataValue(colMeta, 'KBC.description') || '',
        length: extractMetadataValue(colMeta, 'KBC.datatype.length') || null,
      };
    });

    return {
      id: tableId,
      name,
      description,
      primaryKey: raw.primaryKey || [],
      rowsCount: raw.rowsCount || 0,
      dataSizeBytes: raw.dataSizeBytes || 0,
      columns,
      bucket: raw.bucket?.id || tableId.split('.').slice(0, 2).join('.'),
      lastImportDate: raw.lastImportDate || null,
      lastChangeDate: raw.lastChangeDate || null,
      tags,
    };
  }

  /**
   * Extract a value from Keboola metadata array by key.
   * Metadata is an array of { key, value, provider } objects.
   */
  function extractMetadataValue(metadataArray, key) {
    if (!Array.isArray(metadataArray)) return null;
    const entry = metadataArray.find((m) => m.key === key);
    return entry ? entry.value : null;
  }

  /**
   * Fetch all tables in a bucket, including columns and metadata.
   * Uses a single API call per bucket with the include parameter.
   *
   * @param {string} bucketId - e.g. "out.c-bdm"
   * @returns {Promise<Array>} Normalized table objects
   */
  async function listBucketTables(bucketId) {
    const raw = await request(
      `buckets/${encodeURIComponent(bucketId)}/tables?include=columns,metadata,columnMetadata`
    );

    return raw.map(normalizeTable);
  }

  /**
   * Fetch detailed info for a single table.
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @returns {Promise<Object>} Normalized table object
   */
  async function getTable(tableId) {
    const raw = await request(`tables/${encodeURIComponent(tableId)}`);
    return normalizeTable(raw);
  }

  /**
   * Fetch all tables from multiple buckets in parallel.
   * Defaults to both out.c-bdm and out.c-bdm_aux.
   *
   * @param {string[]} [bucketIds] - Array of bucket IDs to fetch
   * @returns {Promise<Array>} Combined normalized table objects
   */
  async function listAllTables(bucketIds) {
    const ids = bucketIds || ['out.c-bdm', 'out.c-bdm_aux'];

    const results = await Promise.allSettled(
      ids.map((id) => listBucketTables(id))
    );

    const tables = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        tables.push(...result.value);
      } else {
        // Log but don't crash — bucket might not exist (e.g. aux bucket)
        console.warn(
          `Warning: Failed to fetch bucket "${ids[i]}": ${result.reason?.message || result.reason}`
        );
      }
    }

    return tables;
  }

  /**
   * Update a table description via Keboola metadata API.
   * Uses JSON body format (form-urlencoded is deprecated).
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @param {string} description - New description text
   */
  async function updateTableDescription(tableId, description) {
    const url = `${baseUrl}/v2/storage/tables/${encodeURIComponent(tableId)}/metadata`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-StorageApi-Token': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        provider: 'user',
        metadata: [
          {
            key: 'KBC.description',
            value: description,
          },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Failed to update table description: ${res.status} ${res.statusText}\n${body}`);
    }
    return res.json();
  }

  /**
   * Update a column description via Keboola metadata API.
   * Uses the table metadata endpoint with columnsMetadata for column-level updates.
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @param {string} columnName - e.g. "CLIENT_ID"
   * @param {string} description - New description text
   */
  async function updateColumnDescription(tableId, columnName, description) {
    const url = `${baseUrl}/v2/storage/tables/${encodeURIComponent(tableId)}/metadata`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-StorageApi-Token': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        provider: 'user',
        columnsMetadata: {
          [columnName]: [
            {
              key: 'KBC.description',
              value: description,
            },
          ],
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Failed to update column description: ${res.status} ${res.statusText}\n${body}`);
    }
    return res.json();
  }

  /**
   * Update tags for a table via Keboola metadata API.
   * Tags are stored as a JSON array under the bdm.tags key.
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @param {string[]} tags - Array of tag strings
   */
  async function updateTableTags(tableId, tags) {
    const url = `${baseUrl}/v2/storage/tables/${encodeURIComponent(tableId)}/metadata`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-StorageApi-Token': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        provider: 'user',
        metadata: [
          {
            key: 'bdm.tags',
            value: JSON.stringify(tags),
          },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Failed to update table tags: ${res.status} ${res.statusText}\n${body}`);
    }
    return res.json();
  }

  /**
   * Trigger async data profiling for a table.
   * Keboola runs profiling in the background (BigQuery/Snowflake backends).
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @returns {Promise<Object>} Job info
   */
  async function createProfile(tableId) {
    const url = `${baseUrl}/v2/storage/tables/${encodeURIComponent(tableId)}/profile`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-StorageApi-Token': token,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Failed to create profile: ${res.status} ${res.statusText}\n${body}`);
    }
    return res.json();
  }

  /**
   * Get the latest profiling result for a table.
   * Returns null if no profile has been created yet.
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @returns {Promise<Object|null>} Profile data or null
   */
  async function getLatestProfile(tableId) {
    const url = `${baseUrl}/v2/storage/tables/${encodeURIComponent(tableId)}/profile/latest`;
    const res = await fetch(url, {
      headers: {
        'X-StorageApi-Token': token,
        'Accept': 'application/json',
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Failed to get profile: ${res.status} ${res.statusText}\n${body}`);
    }
    const data = await res.json();
    // Empty object {} means no profile exists yet
    if (!data || !data.columns || data.columns.length === 0) return null;
    return data;
  }

  /**
   * Fetch up to 1000 rows of actual data from a table as CSV.
   * For tables with >30 columns, batches requests in chunks of 30
   * and merges results (Keboola sync export limit is 30 columns).
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @param {number} [limit=1000] - max rows
   * @param {string[]} [columnNames] - column names (required for tables >30 cols)
   * @returns {Promise<string>} Raw CSV text
   */
  async function getDataPreview(tableId, limit = 1000, columnNames = null) {
    const MAX_SYNC_COLUMNS = 30;

    // If column names provided and >30, batch the requests
    if (columnNames && columnNames.length > MAX_SYNC_COLUMNS) {
      return _batchedDataPreview(tableId, limit, columnNames, MAX_SYNC_COLUMNS);
    }

    const url = `${baseUrl}/v2/storage/tables/${encodeURIComponent(tableId)}/data-preview?limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'X-StorageApi-Token': token,
        'Accept': 'text/csv',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Data preview error: ${res.status} ${res.statusText} — ${tableId}\n${body}`);
    }
    return res.text();
  }

  /**
   * Fetch data preview in column batches for wide tables.
   * Each batch requests up to batchSize columns, then merges CSV results.
   */
  async function _batchedDataPreview(tableId, limit, columnNames, batchSize) {
    const chunks = [];
    for (let i = 0; i < columnNames.length; i += batchSize) {
      chunks.push(columnNames.slice(i, i + batchSize));
    }

    // Fetch all batches (sequential to respect rate limits)
    const batchResults = [];
    for (const chunk of chunks) {
      const colsParam = chunk.join(',');
      const url = `${baseUrl}/v2/storage/tables/${encodeURIComponent(tableId)}/data-preview?limit=${limit}&columns=${encodeURIComponent(colsParam)}`;
      const res = await fetch(url, {
        headers: {
          'X-StorageApi-Token': token,
          'Accept': 'text/csv',
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Data preview error: ${res.status} ${res.statusText} — ${tableId} (batch)\n${body}`);
      }
      batchResults.push(await res.text());
    }

    // Merge CSV batches: each has same rows, different columns
    // Parse each, merge row-by-row, re-serialize as CSV
    if (batchResults.length === 0) return '';

    const { parse: csvParse } = await import('csv-parse/sync');
    const parsedBatches = batchResults.map((csv) =>
      csvParse(csv, { columns: true, skip_empty_lines: true, relax_column_count: true })
    );

    // All batches should have the same number of rows
    const rowCount = parsedBatches[0].length;
    const mergedRows = [];
    for (let i = 0; i < rowCount; i++) {
      const merged = {};
      for (const batch of parsedBatches) {
        if (batch[i]) Object.assign(merged, batch[i]);
      }
      mergedRows.push(merged);
    }

    // Re-serialize as CSV for the profiling cache to parse
    const allCols = columnNames;
    const header = allCols.map((c) => `"${c}"`).join(',');
    const rows = mergedRows.map((row) =>
      allCols.map((c) => {
        const v = row[c] ?? '';
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  }

  /**
   * List all buckets in the project.
   * Used to build extractor→bucket→table mapping for lineage inference.
   *
   * @returns {Promise<Array>} Array of { id, name, tables: [] }
   */
  async function listBuckets() {
    return request('buckets');
  }

  /**
   * List tables in a specific bucket (lightweight — no column metadata).
   *
   * @param {string} bucketId
   * @returns {Promise<Array>} Array of { id, name }
   */
  async function listBucketTableIds(bucketId) {
    return request(`buckets/${encodeURIComponent(bucketId)}/tables`);
  }

  /**
   * List ALL component configurations (extractors, transformations, writers, apps).
   * For each config, extracts input/output table mappings using a waterfall:
   *   1. Explicit storage.output/input.tables (transformations, some apps)
   *   2. Explicit parameters.outputTable in rows (DB extractors)
   *   3. Bucket naming convention in.c-{componentId}-{configId} (API extractors)
   *
   * @param {Map<string, string[]>} [bucketTableMap] - Map of bucketId → tableId[] for inference strategy 3
   * @returns {Promise<Array>} Array of component config objects with inputTables/outputTables
   */
  async function listAllComponentConfigs(bucketTableMap) {
    // Fetch ALL components (no type filter)
    const components = await request('components');

    const allConfigs = [];

    for (const component of components) {
      if (!component.id) continue;

      try {
        const configs = await request(
          `components/${encodeURIComponent(component.id)}/configs`
        );

        for (const config of configs) {
          const inputTables = [];
          const outputTables = [];

          // Strategy 1: Explicit storage.input/output.tables
          const storage = config.configuration?.storage || {};
          inputTables.push(
            ...(storage.input?.tables || []).map(t => t.source).filter(Boolean)
          );
          outputTables.push(
            ...(storage.output?.tables || []).map(t => t.destination).filter(Boolean)
          );

          // Check rows for storage mappings + Strategy 2 (parameters.outputTable)
          const rows = config.rows || [];
          for (const row of rows) {
            const rowStorage = row.configuration?.storage || {};
            inputTables.push(
              ...(rowStorage.input?.tables || []).map(t => t.source).filter(Boolean)
            );
            outputTables.push(
              ...(rowStorage.output?.tables || []).map(t => t.destination).filter(Boolean)
            );

            // Strategy 2: parameters.outputTable (DB extractors like Oracle, NetSuite)
            const rowOutputTable = row.configuration?.parameters?.outputTable;
            if (rowOutputTable) {
              outputTables.push(rowOutputTable);
            }
          }

          // Strategy 3: Bucket naming convention in.c-{componentId}-{configId}
          // Only if we still have no output tables and a bucketTableMap is provided
          if (outputTables.length === 0 && bucketTableMap) {
            const conventionBucketId = `in.c-${component.id}-${config.id}`;
            const bucketTables = bucketTableMap.get(conventionBucketId);
            if (bucketTables) {
              outputTables.push(...bucketTables);
            }
          }

          allConfigs.push({
            componentId: component.id,
            componentName: component.name || component.id,
            componentType: component.type || 'other',
            configId: config.id,
            configName: config.name || `Config ${config.id}`,
            description: config.description || '',
            lastChangeDate: config.changeDescription
              ? config.currentVersion?.created || null
              : config.created || null,
            version: config.version || null,
            inputTables: [...new Set(inputTables)],
            outputTables: [...new Set(outputTables)],
          });
        }
      } catch (err) {
        console.warn(`Warning: Failed to fetch configs for ${component.id}: ${err.message}`);
      }
    }

    return allConfigs;
  }

  /**
   * Build a bucket→tableId[] map for extractor output inference.
   * Only includes `in.*` buckets (where extractors write).
   *
   * @returns {Promise<Map<string, string[]>>}
   */
  async function buildBucketTableMap() {
    const map = new Map();
    try {
      const buckets = await listBuckets();
      // Only care about input-stage buckets (where extractors write)
      const inputBuckets = buckets.filter(b => b.id.startsWith('in.'));

      // Fetch tables for each input bucket in parallel
      const results = await Promise.allSettled(
        inputBuckets.map(async (bucket) => {
          const tables = await listBucketTableIds(bucket.id);
          return { bucketId: bucket.id, tableIds: tables.map(t => t.id) };
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.tableIds.length > 0) {
          map.set(result.value.bucketId, result.value.tableIds);
        }
      }
    } catch (err) {
      console.warn(`Warning: Failed to build bucket table map: ${err.message}`);
    }
    return map;
  }

  /**
   * List recent jobs to find last run date/status per configuration.
   * Returns a map of configId → { lastRunDate, lastRunStatus }.
   *
   * @param {number} [limit=100] - Max jobs to fetch
   * @returns {Promise<Map<string, { lastRunDate: string, lastRunStatus: string }>>}
   */
  async function listRecentJobs(limit = 500) {
    try {
      const jobs = await request(`jobs?limit=${limit}`);

      // Build map: "componentId:configId" → most recent job
      const jobMap = new Map();
      for (const job of jobs) {
        const key = `${job.component}:${job.config}`;
        if (!jobMap.has(key)) {
          jobMap.set(key, {
            lastRunDate: job.endTime || job.startTime || job.createdTime || null,
            lastRunStatus: job.status || null,
          });
        }
      }
      return jobMap;
    } catch (err) {
      console.warn(`Warning: Failed to fetch jobs: ${err.message}`);
      return new Map();
    }
  }

  /**
   * Verify the API token and retrieve project info.
   * Returns { projectId, projectName } from the token owner.
   *
   * @returns {Promise<{ projectId: string, projectName: string }>}
   */
  async function verifyToken() {
    const data = await request('tokens/verify');
    return {
      projectId: String(data.owner?.id || ''),
      projectName: data.owner?.name || '',
    };
  }

  /**
   * Fetch metadata for a specific branch.
   * @param {string} branchId - Branch ID or "default"
   * @returns {Promise<Array<{ id: string, key: string, value: string, provider: string, timestamp: string }>>}
   */
  async function getBranchMetadata(branchId) {
    return request(`branch/${encodeURIComponent(branchId)}/metadata`);
  }

  return {
    listBucketTables,
    getTable,
    listAllTables,
    updateTableDescription,
    updateColumnDescription,
    updateTableTags,
    createProfile,
    getLatestProfile,
    getDataPreview,
    listAllComponentConfigs,
    buildBucketTableMap,
    listRecentJobs,
    verifyToken,
    getBranchMetadata,
  };
}
