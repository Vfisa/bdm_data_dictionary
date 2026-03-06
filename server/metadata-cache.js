/**
 * Metadata Cache
 *
 * In-memory cache built at startup from Keboola Storage API.
 * Stores tables, columns, inferred edges, and categories.
 * Supports manual refresh and auto-refresh on a timer.
 */

import { createClient } from './keboola-client.js';
import { inferRelationships, inferDateConnections, getCategory } from './inference.js';

export class MetadataCache {
  /**
   * @param {object} options
   * @param {string} options.kbcUrl - Keboola connection URL
   * @param {string} options.kbcToken - Storage API token
   * @param {string} options.bucketId - Primary bucket ID (default: out.c-bdm)
   * @param {string[]} [options.bucketIds] - All bucket IDs to fetch
   * @param {string} [options.overridesPath] - Path to overrides.json
   * @param {number} [options.refreshInterval] - Auto-refresh interval in ms (default: 15 min)
   */
  constructor(options) {
    this.client = createClient(options.kbcUrl, options.kbcToken);
    this.bucketId = options.bucketId || 'out.c-bdm';
    this.bucketIds = options.bucketIds || [this.bucketId, `${this.bucketId}_aux`];
    this.overridesPath = options.overridesPath || undefined;
    this.refreshInterval = options.refreshInterval ?? 15 * 60 * 1000; // 15 min

    // Cache state
    this._data = null;
    this._refreshTimer = null;
    this._isRefreshing = false;
    this._lastError = null;
  }

  /**
   * Initialize the cache. Blocks until first load completes.
   * Must be called before the server starts accepting requests.
   */
  async init() {
    console.log('MetadataCache: Initializing...');
    const startTime = Date.now();

    await this._loadData();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const tableCount = this._data?.tables?.length || 0;
    const edgeCount = this._data?.edges?.length || 0;
    console.log(`MetadataCache: Ready in ${elapsed}s — ${tableCount} tables, ${edgeCount} edges`);

    // Start auto-refresh timer
    if (this.refreshInterval > 0) {
      this._refreshTimer = setInterval(() => {
        this.refresh().catch((err) => {
          console.error('MetadataCache: Auto-refresh failed:', err.message);
        });
      }, this.refreshInterval);

      // Don't prevent process exit
      if (this._refreshTimer.unref) {
        this._refreshTimer.unref();
      }
    }
  }

  /**
   * Refresh the cache. Non-blocking — old data continues to serve during refresh.
   * Uses atomic swap to prevent partial reads.
   *
   * @returns {{ tableCount: number, edgeCount: number, duration: number }}
   */
  async refresh() {
    if (this._isRefreshing) {
      console.log('MetadataCache: Refresh already in progress, skipping');
      return null;
    }

    this._isRefreshing = true;
    const startTime = Date.now();

    try {
      await this._loadData();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const result = {
        tableCount: this._data.tables.length,
        edgeCount: this._data.edges.length,
        duration: parseFloat(duration),
      };
      console.log(`MetadataCache: Refreshed in ${duration}s — ${result.tableCount} tables, ${result.edgeCount} edges`);
      return result;
    } catch (err) {
      this._lastError = err;
      console.error('MetadataCache: Refresh failed:', err.message);
      throw err;
    } finally {
      this._isRefreshing = false;
    }
  }

  /**
   * Fetch all table data and run inference. Atomic swap into cache.
   */
  async _loadData() {
    // Fetch all tables from all buckets
    const tables = await this.client.listAllTables(this.bucketIds);

    // Run FK inference
    const { edges, categories, stats } = inferRelationships(tables, this.overridesPath);

    // Run date connection inference
    const { dateEdges } = inferDateConnections(tables);

    // Atomic swap — old data is replaced all at once
    this._data = {
      tables,
      edges,
      dateEdges,
      categories,
      stats,
      lastRefresh: new Date().toISOString(),
      tableCount: tables.length,
      edgeCount: edges.length,
    };
    this._lastError = null;
  }

  /**
   * Get full metadata payload for the frontend.
   * Returns null if cache is not yet initialized.
   */
  getMetadata() {
    if (!this._data) return null;

    return {
      tables: this._data.tables.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        primaryKey: t.primaryKey,
        rowsCount: t.rowsCount,
        dataSizeBytes: t.dataSizeBytes,
        columnCount: t.columns.length,
        columns: t.columns,
        bucket: t.bucket,
        category: this._data.categories[t.name] || 'OTHER',
        lastImportDate: t.lastImportDate,
      })),
      edges: this._data.edges,
      dateEdges: this._data.dateEdges || [],
      categories: this._data.categories,
      lastRefresh: this._data.lastRefresh,
      stats: this._data.stats,
    };
  }

  /**
   * Get a single table with full detail.
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @returns {object|null}
   */
  getTable(tableId) {
    if (!this._data) return null;

    const table = this._data.tables.find((t) => t.id === tableId);
    if (!table) return null;

    // Find related edges
    const outgoing = this._data.edges.filter((e) => e.source === table.name);
    const incoming = this._data.edges.filter((e) => e.target === table.name);

    return {
      ...table,
      category: this._data.categories[table.name] || 'OTHER',
      relationships: {
        outgoing,
        incoming,
      },
    };
  }

  /**
   * Update a table or column description.
   * Pushes to Keboola API, then updates in-memory cache optimistically.
   *
   * @param {string} tableId - e.g. "out.c-bdm.REF_CLIENT"
   * @param {string|null} columnName - null for table description, column name for column
   * @param {string} description - New description text
   */
  async updateDescription(tableId, columnName, description) {
    // Push to Keboola API
    if (columnName) {
      await this.client.updateColumnDescription(tableId, columnName, description);
    } else {
      await this.client.updateTableDescription(tableId, description);
    }

    // Optimistic in-memory update
    if (this._data) {
      const table = this._data.tables.find((t) => t.id === tableId);
      if (table) {
        if (columnName) {
          const col = table.columns.find((c) => c.name === columnName);
          if (col) col.description = description;
        } else {
          table.description = description;
        }
      }
    }
  }

  /**
   * Get cache status for health checks.
   */
  getStatus() {
    return {
      initialized: !!this._data,
      tableCount: this._data?.tableCount || 0,
      edgeCount: this._data?.edgeCount || 0,
      lastRefresh: this._data?.lastRefresh || null,
      isRefreshing: this._isRefreshing,
      lastError: this._lastError?.message || null,
    };
  }

  /**
   * Stop auto-refresh timer. Call on shutdown.
   */
  destroy() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }
}
