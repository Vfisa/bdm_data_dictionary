import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MetadataCache } from './metadata-cache.js';
import { createProfilingCache } from './profiling-cache.js';
import { generateMockMetadata, generateMockProfile, generateMockPreview } from './mock-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// --- Environment variables ---
const KBC_TOKEN = process.env.KBC_TOKEN;
const KBC_URL = process.env.KBC_URL;
const BUCKET_ID = process.env.BUCKET_ID || 'out.c-bdm';
const BRANCH_ID = process.env.BRANCH_ID || 'default';

const USE_MOCK = !KBC_TOKEN || !KBC_URL;
let mockData = null;

if (USE_MOCK) {
  console.warn(
    'WARNING: KBC_TOKEN or KBC_URL not set. Using mock data for development.\n' +
    'Set them in .env or as environment variables for full functionality.'
  );
  mockData = generateMockMetadata();
}

// --- Metadata cache ---
let cache = null;

if (KBC_TOKEN && KBC_URL) {
  cache = new MetadataCache({
    kbcUrl: KBC_URL,
    kbcToken: KBC_TOKEN,
    bucketId: BUCKET_ID,
    branchId: BRANCH_ID,
    overridesPath: path.join(__dirname, 'overrides.json'),
  });
}

// --- Profiling cache ---
let profilingCache = null;

if (cache) {
  profilingCache = createProfilingCache({ client: cache.getClient() });
}

// --- Middleware ---
app.use(express.json());

// --- API routes ---

// Health check — always works, even without credentials
app.get('/api/health', (_req, res) => {
  const cacheStatus = cache ? cache.getStatus() : { initialized: false };
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: {
      hasToken: !!KBC_TOKEN,
      hasUrl: !!KBC_URL,
      bucketId: BUCKET_ID,
    },
    cache: cacheStatus,
  });
});

// Full metadata payload — tables, edges, categories
app.get('/api/metadata', (_req, res) => {
  // Serve mock data in development mode
  if (USE_MOCK && mockData) {
    return res.json(mockData);
  }

  if (!cache) {
    return res.status(503).json({
      error: 'Metadata not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  const metadata = cache.getMetadata();
  if (!metadata) {
    return res.status(503).json({
      error: 'Metadata cache is still loading. Please retry shortly.',
    });
  }

  res.json(metadata);
});

// Project overview — branch metadata (project description, etc.)
// Served from cache (loaded at startup, refreshed with metadata)
app.get('/api/project-overview', (_req, res) => {
  if (USE_MOCK) {
    return res.json({
      metadata: [
        {
          id: '1',
          key: 'KBC.projectDescription',
          value: '# Horizon Air Freight — BDM\n\nThis project contains the **Business Data Model** for Horizon Air Freight.\n\n## Data Architecture\n\n- **Extractor:** `keboola.ex-db-oracle` — Configuration: `[PROD] Oracledb Navigator`\n- **Bucket:** `in.c-oracle_navigator` (~4.9 GB, 38 tables)\n- Snowflake-backed transformations with `out.c-bdm` output bucket\n\n## Bucket Overview\n\n| Bucket | Stage | Tables | Size | Purpose |\n|--------|-------|--------|------|----------|\n| `in.c-oracle_navigator` | Input | 38 | 4.9 GB | Navigator ERP |\n| `in.c-netsuite` | Input | 4 | 95 MB | NetSuite accounting |\n| `out.c-bdm` | Output | 51 | 2.87 GB | Business data model |\n\n## Key Domains\n\n1. **Client Management** — `REF_CLIENT`, `DIM_CLIENT_SEGMENT`\n2. **Product Catalog** — `REF_PRODUCT`, `REF_CATEGORY`\n3. **Order Processing** — `FCT_ORDER`, `FCT_PAYMENT`, `MAP_ORDER_PRODUCT`\n4. **Geography** — `REF_COUNTRY`, `DIM_STORE`\n\n> Last updated by the data engineering team.',
          provider: 'system',
          timestamp: new Date().toISOString(),
        },
      ],
      lastRefresh: new Date().toISOString(),
    });
  }

  if (!cache) {
    return res.status(503).json({
      error: 'Project overview not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  const branchData = cache.getBranchMetadata();
  if (!branchData) {
    return res.status(503).json({
      error: 'Project overview is still loading. Please retry shortly.',
    });
  }

  res.json(branchData);
});

// Single table detail with relationships
app.get('/api/table/:tableId', (req, res) => {
  if (!cache) {
    return res.status(503).json({
      error: 'Metadata not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  const tableId = req.params.tableId;
  const table = cache.getTable(tableId);

  if (!table) {
    return res.status(404).json({
      error: `Table not found: ${tableId}`,
    });
  }

  res.json(table);
});

// Update descriptions — propagates to Keboola Storage API (or mock in dev)
app.put('/api/descriptions', async (req, res) => {
  // In mock mode, accept updates and apply to in-memory mock data
  if (USE_MOCK && mockData) {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Missing or empty updates array' });
    }
    const results = updates.map((update) => {
      const { itemId, description } = update;
      const parts = itemId.split('.');
      if (parts.length === 3) {
        const table = mockData.tables.find((t) => t.id === itemId);
        if (table) table.description = description;
        return { itemId, success: true };
      } else if (parts.length === 4) {
        const tableId = parts.slice(0, 3).join('.');
        const colName = parts[3];
        const table = mockData.tables.find((t) => t.id === tableId);
        if (table) {
          const col = table.columns.find((c) => c.name === colName);
          if (col) col.description = description;
        }
        return { itemId, success: true };
      }
      return { itemId, success: false, error: 'Invalid itemId format' };
    });
    return res.json({ results });
  }

  if (!cache) {
    return res.status(503).json({
      error: 'Metadata not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: 'Missing or empty updates array' });
  }

  const results = [];
  for (const update of updates) {
    const { itemId, description } = update;
    if (!itemId || typeof description !== 'string') {
      results.push({ itemId, success: false, error: 'Invalid itemId or description' });
      continue;
    }

    try {
      // Determine if this is a table or column update based on itemId format
      // Table: "out.c-bdm.TABLE_NAME" (3 dot-separated parts)
      // Column: "out.c-bdm.TABLE_NAME.COLUMN_NAME" (4 dot-separated parts)
      const parts = itemId.split('.');
      if (parts.length === 3) {
        // Table description update
        await cache.updateDescription(itemId, null, description);
        results.push({ itemId, success: true });
      } else if (parts.length === 4) {
        // Column description update
        const tableId = parts.slice(0, 3).join('.');
        const columnName = parts[3];
        await cache.updateDescription(tableId, columnName, description);
        results.push({ itemId, success: true });
      } else {
        results.push({ itemId, success: false, error: 'Invalid itemId format' });
      }
    } catch (err) {
      console.error(`PUT /api/descriptions failed for ${itemId}:`, err.message);
      results.push({ itemId, success: false, error: err.message });
    }
  }

  const allSuccess = results.every((r) => r.success);
  res.status(allSuccess ? 200 : 207).json({ results });
});

// Update tags for a table — propagates to Keboola Storage API (or mock in dev)
app.put('/api/tags', async (req, res) => {
  const { tableId, tags } = req.body;
  if (!tableId || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Missing tableId or tags array' });
  }

  // Mock mode
  if (USE_MOCK && mockData) {
    const table = mockData.tables.find((t) => t.id === tableId);
    if (table) table.tags = tags;
    return res.json({ success: true, tableId, tags });
  }

  if (!cache) {
    return res.status(503).json({
      error: 'Metadata not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  try {
    await cache.updateTags(tableId, tags);
    res.json({ success: true, tableId, tags });
  } catch (err) {
    console.error(`PUT /api/tags failed for ${tableId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Data profiling for a table — on-demand, cached 30 min
app.get('/api/profile/:tableId', async (req, res) => {
  const tableId = req.params.tableId;

  // Mock mode
  if (USE_MOCK && mockData) {
    const table = mockData.tables.find((t) => t.id === tableId);
    if (!table) {
      return res.status(404).json({ error: `Table not found: ${tableId}` });
    }
    return res.json(generateMockProfile(table));
  }

  if (!cache || !profilingCache) {
    return res.status(503).json({
      error: 'Profiling not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  // Find table in metadata cache to get column definitions
  const metadata = cache.getMetadata();
  if (!metadata) {
    return res.status(503).json({ error: 'Metadata cache is still loading.' });
  }

  const table = metadata.tables.find((t) => t.id === tableId);
  if (!table) {
    return res.status(404).json({ error: `Table not found: ${tableId}` });
  }

  try {
    const profile = await profilingCache.getProfile(tableId, table.columns);
    // Attach totalRows from metadata if native profile didn't have it
    if (!profile.totalRows && table.rowsCount) {
      profile.totalRows = table.rowsCount;
    }
    res.json(profile);
  } catch (err) {
    console.error(`GET /api/profile/${tableId} failed:`, err.message);
    res.status(500).json({ error: `Profiling failed: ${err.message}` });
  }
});

// Data preview — row-level sample data for a table
app.get('/api/preview/:tableId', async (req, res) => {
  const tableId = req.params.tableId;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  // Mock mode
  if (USE_MOCK && mockData) {
    const table = mockData.tables.find((t) => t.id === tableId);
    if (!table) {
      return res.status(404).json({ error: `Table not found: ${tableId}` });
    }
    return res.json(generateMockPreview(table, limit));
  }

  if (!cache) {
    return res.status(503).json({
      error: 'Preview not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  const metadata = cache.getMetadata();
  if (!metadata) {
    return res.status(503).json({ error: 'Metadata cache is still loading.' });
  }

  const table = metadata.tables.find((t) => t.id === tableId);
  if (!table) {
    return res.status(404).json({ error: `Table not found: ${tableId}` });
  }

  try {
    const colNames = table.columns.map((c) => c.name);
    const csvText = await cache.getClient().getDataPreview(tableId, limit, colNames);
    const { parse } = await import('csv-parse/sync');
    const rows = parse(csvText, { columns: true, skip_empty_lines: true, relax_column_count: true });
    res.json({
      columns: colNames,
      rows: rows.slice(0, limit),
      totalAvailable: rows.length,
    });
  } catch (err) {
    console.error(`GET /api/preview/${tableId} failed:`, err.message);
    res.status(500).json({ error: `Preview failed: ${err.message}` });
  }
});

// Manual refresh trigger
app.post('/api/refresh', async (_req, res) => {
  if (!cache) {
    return res.status(503).json({
      error: 'Metadata not available — KBC_TOKEN or KBC_URL not configured',
    });
  }

  try {
    const result = await cache.refresh();
    if (!result) {
      return res.json({
        status: 'skipped',
        message: 'Refresh already in progress',
      });
    }
    res.json({
      status: 'ok',
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      error: `Refresh failed: ${err.message}`,
    });
  }
});

// --- Serve built React SPA ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: both GET and POST (Keboola sends POST to / for liveness check)
app.all('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- Start server (init cache first if credentials available) ---
async function start() {
  // Initialize cache before accepting requests
  if (cache) {
    try {
      await cache.init();
    } catch (err) {
      console.error('Failed to initialize metadata cache:', err.message);
      console.error('Server will start anyway — /api/metadata will return 503 until cache loads.');
      // Don't crash — allow health check and SPA to work
    }
  }

  app.listen(PORT, () => {
    console.log(`BDM Data Dictionary server running on http://localhost:${PORT}`);
    console.log(`  KBC_URL:   ${KBC_URL || '(not set)'}`);
    console.log(`  KBC_TOKEN: ${KBC_TOKEN ? '***' + KBC_TOKEN.slice(-4) : '(not set)'}`);
    console.log(`  BUCKET_ID: ${BUCKET_ID}`);
    console.log(`  BRANCH_ID: ${BRANCH_ID}`);
    if (cache) {
      const status = cache.getStatus();
      console.log(`  Cache:     ${status.tableCount} tables, ${status.edgeCount} edges`);
    }
  });
}

start().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
