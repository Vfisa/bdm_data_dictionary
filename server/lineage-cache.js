/**
 * Lineage Index Builder
 *
 * Builds a lineage index from all component configurations:
 * extractors, transformations, writers, and applications.
 * Maps table IDs to the components that produce or consume them.
 *
 * Two directions:
 * - producedBy[tableId] = components whose OUTPUT mapping writes to this table
 * - usedBy[tableId]     = components whose INPUT mapping reads from this table
 */

/**
 * Map a Keboola component type + ID to a short human-readable type label.
 *
 * For transformations, derives the specific engine (SQL, PY, dbt, R, etc.).
 * For other component types, returns a category code (EXT, WR, APP).
 *
 * @param {string} componentId
 * @param {string} componentType - Keboola component type: 'extractor', 'transformation', 'writer', 'application'
 * @returns {string}
 */
function deriveComponentType(componentId, componentType) {
  if (!componentId) return '?';

  // Non-transformation types get a category code
  if (componentType === 'extractor') return 'EXT';
  if (componentType === 'writer') return 'WR';
  if (componentType === 'application') return 'APP';

  // Transformation types — derive the specific engine
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
 * Derive the component category from component type string.
 *
 * @param {string} componentType - Keboola component type
 * @returns {'extractor' | 'transformation' | 'writer' | 'application'}
 */
function deriveComponentCategory(componentType) {
  if (componentType === 'extractor') return 'extractor';
  if (componentType === 'writer') return 'writer';
  if (componentType === 'application') return 'application';
  return 'transformation';
}

/**
 * Construct a Keboola UI URL for a component configuration.
 * Transformations use a different URL pattern than other components.
 *
 * @param {string} kbcUrl - Base URL (e.g. https://connection.eu-central-1.keboola.com)
 * @param {string} componentId
 * @param {string} configId
 * @param {string} [projectId] - Project ID from token verify
 * @param {string} [componentType] - Keboola component type
 * @returns {string}
 */
function buildKeboolaUrl(kbcUrl, componentId, configId, projectId, componentType) {
  if (!kbcUrl) return '';
  const base = kbcUrl.replace(/\/+$/, '');
  const pid = projectId || '_';

  if (componentType === 'transformation') {
    return `${base}/admin/projects/${pid}/transformations-v2/${encodeURIComponent(componentId)}/${encodeURIComponent(configId)}`;
  }

  // Extractors, writers, apps use the components URL
  return `${base}/admin/projects/${pid}/components/${encodeURIComponent(componentId)}/${encodeURIComponent(configId)}`;
}

/**
 * Build a lineage index from all component configs and recent job info.
 *
 * @param {Array} componentConfigs - From keboola-client.listAllComponentConfigs()
 * @param {Map} jobMap - From keboola-client.listRecentJobs(), keyed by "componentId:configId"
 * @param {string} kbcUrl - Keboola base URL for constructing links
 * @param {string} [projectId] - Project ID for Keboola UI URLs
 * @returns {{ producedBy: Record<string, Array>, usedBy: Record<string, Array> }}
 */
export function buildLineageIndex(componentConfigs, jobMap, kbcUrl, projectId) {
  const producedBy = {};
  const usedBy = {};

  for (const config of componentConfigs) {
    const jobKey = `${config.componentId}:${config.configId}`;
    const jobInfo = jobMap.get(jobKey) || { lastRunDate: null, lastRunStatus: null };
    const componentType = config.componentType || 'transformation';

    const entry = {
      configId: config.configId,
      configName: config.configName,
      componentId: config.componentId,
      componentType: deriveComponentType(config.componentId, componentType),
      componentCategory: deriveComponentCategory(componentType),
      lastChangeDate: config.lastChangeDate || null,
      lastRunDate: jobInfo.lastRunDate,
      lastRunStatus: jobInfo.lastRunStatus,
      keboolaUrl: buildKeboolaUrl(kbcUrl, config.componentId, config.configId, projectId, componentType),
    };

    // Output tables → this component PRODUCES these tables
    for (const tableId of config.outputTables) {
      if (!producedBy[tableId]) producedBy[tableId] = [];
      producedBy[tableId].push(entry);
    }

    // Input tables → this component USES these tables
    for (const tableId of config.inputTables) {
      if (!usedBy[tableId]) usedBy[tableId] = [];
      usedBy[tableId].push(entry);
    }
  }

  return { producedBy, usedBy };
}
