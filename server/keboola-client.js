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
    return res.json();
  }

  /**
   * Fetch up to 1000 rows of actual data from a table as CSV.
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @param {number} [limit=1000] - max rows
   * @returns {Promise<string>} Raw CSV text
   */
  async function getDataPreview(tableId, limit = 1000) {
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
  };
}
