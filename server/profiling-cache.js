/**
 * Profiling Cache — Hybrid Native Profile + Data Preview
 *
 * Fetches and merges two data sources:
 * 1. Keboola native profiling API → exact null/distinct/duplicate counts (all rows)
 * 2. Data-preview API (1000-row CSV) → $NOVALUE rates, min/max, top values, samples
 *
 * Per-table cache with 30-minute TTL, request deduplication, and rate limiting.
 */

import { parse } from 'csv-parse/sync';

/**
 * @param {{ client: object, cacheTTL?: number, requestDelay?: number }} opts
 */
export function createProfilingCache({ client, cacheTTL = 1800000, requestDelay = 200 }) {
  /** @type {Map<string, { data: object, fetchedAt: number, error?: string }>} */
  const _profiles = new Map();

  /** @type {Map<string, Promise<object>>} */
  const _pendingRequests = new Map();

  let _lastRequestTime = 0;

  /**
   * Get profile for a table. Returns cached result if fresh, otherwise fetches.
   *
   * @param {string} tableId
   * @param {Array<{ name: string, keboolaBaseType: string }>} columns
   * @returns {Promise<object>}
   */
  async function getProfile(tableId, columns) {
    // Check cache
    const cached = _profiles.get(tableId);
    if (cached && !cached.error && (Date.now() - cached.fetchedAt) < cacheTTL) {
      return cached.data;
    }

    // Deduplicate in-flight requests
    if (_pendingRequests.has(tableId)) {
      return _pendingRequests.get(tableId);
    }

    const promise = _fetchAndCompute(tableId, columns)
      .then((data) => {
        _profiles.set(tableId, { data, fetchedAt: Date.now() });
        _pendingRequests.delete(tableId);
        return data;
      })
      .catch((err) => {
        _profiles.set(tableId, { data: null, fetchedAt: Date.now(), error: err.message });
        _pendingRequests.delete(tableId);
        throw err;
      });

    _pendingRequests.set(tableId, promise);
    return promise;
  }

  /**
   * Rate-limit helper — wait until requestDelay ms since last request.
   */
  async function _rateLimit() {
    const elapsed = Date.now() - _lastRequestTime;
    if (elapsed < requestDelay) {
      await new Promise((r) => setTimeout(r, requestDelay - elapsed));
    }
    _lastRequestTime = Date.now();
  }

  /**
   * Fetch native profile + data preview, merge into unified result.
   */
  async function _fetchAndCompute(tableId, columns) {
    let nativeProfile = null;
    let previewRows = null;

    // 1. Try to get native profile (exact stats)
    try {
      await _rateLimit();
      nativeProfile = await client.getLatestProfile(tableId);

      // If no profile exists, trigger one for next time (fire-and-forget)
      if (!nativeProfile) {
        client.createProfile(tableId).catch((err) => {
          console.warn(`[profile] Failed to trigger profiling for ${tableId}:`, err.message);
        });
      }
    } catch (err) {
      console.warn(`[profile] Native profile fetch failed for ${tableId}:`, err.message);
    }

    // 2. Fetch data preview (CSV sample)
    try {
      await _rateLimit();
      const colNames = columns.map((c) => c.name);
      const csvText = await client.getDataPreview(tableId, 1000, colNames);
      if (csvText && csvText.trim()) {
        previewRows = parse(csvText, {
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true,
        });
        console.log(`[profile] ${tableId}: ${previewRows.length} sample rows, ${colNames.length} columns`);
      } else {
        console.warn(`[profile] Data preview returned empty for ${tableId}`);
      }
    } catch (err) {
      console.warn(`[profile] Data preview failed for ${tableId}:`, err.message);
    }

    // If both failed, throw
    if (!nativeProfile && !previewRows) {
      throw new Error(`Failed to fetch any profiling data for ${tableId}`);
    }

    // 3. Compute preview stats from CSV rows
    const previewStats = previewRows ? _computePreviewStats(previewRows, columns) : {};

    // 4. Merge native + preview
    return _mergeProfiles(tableId, nativeProfile, previewStats, columns, previewRows?.length || 0);
  }

  /**
   * Compute stats from the 1000-row sample.
   *
   * @param {Array<object>} rows - Parsed CSV rows (array of { colName: value } objects)
   * @param {Array<{ name: string, keboolaBaseType: string }>} columns
   * @returns {object} Map of columnName → stats
   */
  function _computePreviewStats(rows, columns) {
    const stats = {};
    const sampleSize = rows.length;

    for (const col of columns) {
      const colName = col.name;
      const values = rows.map((r) => r[colName] ?? null);
      const isIdColumn = colName.endsWith('_ID');

      // Null count (empty string or null in CSV)
      let nullCount = 0;
      let novalueCount = 0;
      const nonNullValues = [];

      for (const v of values) {
        if (v === null || v === '' || v === undefined) {
          nullCount++;
        } else {
          nonNullValues.push(v);
          if (isIdColumn && v === '$NOVALUE') {
            novalueCount++;
          }
        }
      }

      // Distinct count
      const distinctSet = new Set(nonNullValues);
      const distinctCount = distinctSet.size;

      // Min / Max (type-aware)
      let min = null;
      let max = null;
      const baseType = col.keboolaBaseType?.toUpperCase() || 'STRING';

      if (nonNullValues.length > 0) {
        if (['INTEGER', 'NUMERIC', 'FLOAT'].includes(baseType)) {
          const nums = nonNullValues
            .map((v) => parseFloat(v))
            .filter((n) => !isNaN(n));
          if (nums.length > 0) {
            min = Math.min(...nums);
            max = Math.max(...nums);
          }
        } else if (['DATE', 'TIMESTAMP'].includes(baseType)) {
          const dates = nonNullValues
            .map((v) => new Date(v))
            .filter((d) => !isNaN(d.getTime()));
          if (dates.length > 0) {
            dates.sort((a, b) => a.getTime() - b.getTime());
            min = dates[0].toISOString().split('T')[0];
            max = dates[dates.length - 1].toISOString().split('T')[0];
          }
        } else {
          // String: lexicographic min/max (skip for very long strings)
          if (nonNullValues.every((v) => v.length < 200)) {
            const sorted = [...nonNullValues].sort();
            min = sorted[0];
            max = sorted[sorted.length - 1];
          }
        }
      }

      // Top 5 values by frequency
      const freqMap = new Map();
      for (const v of nonNullValues) {
        freqMap.set(v, (freqMap.get(v) || 0) + 1);
      }
      const topValues = [...freqMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));

      // First 5 distinct non-null sample values
      const sampleValues = [...distinctSet].slice(0, 5);

      stats[colName] = {
        nullCount,
        nullRate: sampleSize > 0 ? nullCount / sampleSize : 0,
        distinctCount,
        duplicateCount: Math.max(0, nonNullValues.length - distinctCount),
        novalueCount: isIdColumn ? novalueCount : 0,
        novalueRate: isIdColumn && sampleSize > 0 ? novalueCount / sampleSize : 0,
        min,
        max,
        topValues,
        sampleValues,
      };
    }

    return stats;
  }

  /**
   * Merge native profile (exact) with preview stats (sample).
   * Native profile takes precedence for null/distinct/duplicate counts.
   */
  function _mergeProfiles(tableId, nativeProfile, previewStats, columns, sampleSize) {
    const hasNative = !!nativeProfile;

    // Build native stats lookup if available
    const nativeMap = {};
    if (nativeProfile?.columns) {
      for (const col of nativeProfile.columns) {
        nativeMap[col.name] = col;
      }
    }

    const columnProfiles = columns.map((col) => {
      const colName = col.name;
      const native = nativeMap[colName];
      const preview = previewStats[colName];

      // Base stats: prefer native (exact) over preview (approximate)
      const nullCount = native?.nullCount ?? preview?.nullCount ?? 0;
      const nullRate = native?.nullRate ?? preview?.nullRate ?? 0;
      const distinctCount = native?.distinctCount ?? preview?.distinctCount ?? 0;
      const duplicateCount = native?.duplicateCount ?? preview?.duplicateCount ?? 0;
      const isExact = !!native;

      return {
        columnName: colName,
        nullCount,
        nullRate,
        distinctCount,
        duplicateCount,
        isExact,
        // Preview-only stats
        min: preview?.min ?? null,
        max: preview?.max ?? null,
        novalueCount: preview?.novalueCount ?? 0,
        novalueRate: preview?.novalueRate ?? 0,
        topValues: preview?.topValues ?? [],
        sampleValues: preview?.sampleValues ?? [],
      };
    });

    return {
      tableId,
      sampleSize,
      totalRows: nativeProfile?.rowsCount || 0,
      profiledAt: new Date().toISOString(),
      hasNativeProfile: hasNative,
      columns: columnProfiles,
    };
  }

  /**
   * Clear cached profile for a specific table or all tables.
   */
  function clearCache(tableId) {
    if (tableId) {
      _profiles.delete(tableId);
    } else {
      _profiles.clear();
    }
  }

  return {
    getProfile,
    clearCache,
  };
}
