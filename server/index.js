import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MetadataCache } from './metadata-cache.js';
import { generateMockMetadata } from './mock-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// --- Environment variables ---
const KBC_TOKEN = process.env.KBC_TOKEN;
const KBC_URL = process.env.KBC_URL;
const BUCKET_ID = process.env.BUCKET_ID || 'out.c-bdm';

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
    overridesPath: path.join(__dirname, 'overrides.json'),
  });
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
      results.push({ itemId, success: false, error: err.message });
    }
  }

  const allSuccess = results.every((r) => r.success);
  res.status(allSuccess ? 200 : 207).json({ results });
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
