import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MetadataCache } from './metadata-cache.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// --- Environment variables ---
const KBC_TOKEN = process.env.KBC_TOKEN;
const KBC_URL = process.env.KBC_URL;
const BUCKET_ID = process.env.BUCKET_ID || 'out.c-bdm';

if (!KBC_TOKEN || !KBC_URL) {
  console.warn(
    'WARNING: KBC_TOKEN or KBC_URL not set. API endpoints will not work.\n' +
    'Set them in .env or as environment variables for full functionality.'
  );
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
