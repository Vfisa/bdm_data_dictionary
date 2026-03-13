/**
 * Lineage Index Builder
 *
 * Builds a lineage index from transformation configurations.
 * Maps table IDs to the transformations that produce or consume them.
 *
 * Two directions:
 * - producedBy[tableId] = transformations whose OUTPUT mapping writes to this table
 * - usedBy[tableId]     = transformations whose INPUT mapping reads from this table
 */

/**
 * Map a Keboola component ID to a short human-readable type label.
 *
 * @param {string} componentId
 * @returns {string}
 */
function deriveComponentType(componentId) {
  if (!componentId) return '?';
  const id = componentId.toLowerCase();
  if (id.includes('snowflake')) return 'SQL';
  if (id.includes('synapse')) return 'SQL';
  if (id.includes('bigquery')) return 'SQL';
  if (id.includes('redshift')) return 'SQL';
  if (id.includes('python')) return 'PY';
  if (id.includes('julia')) return 'JL';
  if (id.includes('r-transformation') || id.includes('.r-')) return 'R';
  if (id.includes('dbt')) return 'dbt';
  if (id.includes('openrefine')) return 'OR';
  return 'SQL'; // default for unknown transformation types
}

/**
 * Construct a Keboola UI URL for a transformation configuration.
 *
 * @param {string} kbcUrl - Base URL (e.g. https://connection.eu-central-1.keboola.com)
 * @param {string} componentId
 * @param {string} configId
 * @param {string} [projectId] - Project ID from token verify. Falls back to '_' if unavailable
 * @returns {string}
 */
function buildKeboolaUrl(kbcUrl, componentId, configId, projectId) {
  if (!kbcUrl) return '';
  const base = kbcUrl.replace(/\/+$/, '');
  const pid = projectId || '_';
  return `${base}/admin/projects/${pid}/transformations-v2/${encodeURIComponent(componentId)}/${encodeURIComponent(configId)}`;
}

/**
 * Build a lineage index from transformation configs and recent job info.
 *
 * @param {Array} transformationConfigs - From keboola-client.listTransformationConfigs()
 * @param {Map} jobMap - From keboola-client.listRecentJobs(), keyed by "componentId:configId"
 * @param {string} kbcUrl - Keboola base URL for constructing links
 * @param {string} [projectId] - Project ID for Keboola UI URLs
 * @returns {{ producedBy: Record<string, Array>, usedBy: Record<string, Array> }}
 */
export function buildLineageIndex(transformationConfigs, jobMap, kbcUrl, projectId) {
  const producedBy = {};
  const usedBy = {};

  for (const config of transformationConfigs) {
    const jobKey = `${config.componentId}:${config.configId}`;
    const jobInfo = jobMap.get(jobKey) || { lastRunDate: null, lastRunStatus: null };

    const entry = {
      configId: config.configId,
      configName: config.configName,
      componentId: config.componentId,
      componentType: deriveComponentType(config.componentId),
      lastChangeDate: config.lastChangeDate || null,
      lastRunDate: jobInfo.lastRunDate,
      lastRunStatus: jobInfo.lastRunStatus,
      keboolaUrl: buildKeboolaUrl(kbcUrl, config.componentId, config.configId, projectId),
    };

    // Output tables → this transformation PRODUCES these tables
    for (const tableId of config.outputTables) {
      if (!producedBy[tableId]) producedBy[tableId] = [];
      producedBy[tableId].push(entry);
    }

    // Input tables → this transformation USES these tables
    for (const tableId of config.inputTables) {
      if (!usedBy[tableId]) usedBy[tableId] = [];
      usedBy[tableId].push(entry);
    }
  }

  return { producedBy, usedBy };
}
