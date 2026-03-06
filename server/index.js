import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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

// --- Middleware ---
app.use(express.json());

// --- API routes ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: {
      hasToken: !!KBC_TOKEN,
      hasUrl: !!KBC_URL,
      bucketId: BUCKET_ID,
    },
  });
});

// --- Serve built React SPA ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: both GET and POST (Keboola sends POST to / for liveness check)
app.all('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`BDM Data Dictionary server running on http://localhost:${PORT}`);
  console.log(`  KBC_URL:   ${KBC_URL || '(not set)'}`);
  console.log(`  KBC_TOKEN: ${KBC_TOKEN ? '***' + KBC_TOKEN.slice(-4) : '(not set)'}`);
  console.log(`  BUCKET_ID: ${BUCKET_ID}`);
});
