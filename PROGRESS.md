# BDM Data Dictionary — Development Progress

## Step 1: Project Scaffolding
**Status:** DONE
**Started:** 2026-03-06

**Files created:**
- `package.json` — dependencies (React 18, Vite 6, Tailwind 4, Express, React Flow, dagre, cmdk, lucide-react)
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` — TypeScript config with `@/*` path alias
- `vite.config.ts` — React + Tailwind plugins, path alias, proxy `/api` to :3000
- `index.html` — Vite entry
- `src/main.tsx` — React entry
- `src/App.tsx` — minimal heading
- `src/index.css` — Tailwind v4 import + shadcn/ui color tokens (light + dark)
- `src/lib/utils.ts` — cn(), formatNumber(), formatBytes(), timeAgo()
- `src/vite-env.d.ts` — Vite type reference
- `.env.example` — KBC_TOKEN, KBC_URL, BUCKET_ID
- `.gitignore` — node_modules, dist, .env, .claude
- `PROGRESS.md` — this file

**Test:** `npm install && npm run build` must succeed. `dist/` must contain `index.html` + assets.

**Result:** PASS — Build produces `dist/index.html` (0.47 KB), `index.css` (6.24 KB), `index.js` (143.77 KB / 46 KB gzip). Zero errors.

---

## Step 2: Keboola Config Files
**Status:** DONE

**Files created:**
- `keboola-config/nginx/sites/default.conf` — listen 8888, proxy_pass to 127.0.0.1:3000
- `keboola-config/supervisord/services/app.conf` — node /app/server/index.js, autostart/autorestart
- `keboola-config/setup.sh` — npm install + npm run build (executable)

**Test:** All 3 files exist, setup.sh is executable, shebang is `#!/bin/bash`.

**Result:** PASS — Structure matches Keboola JS Data App spec exactly.

---

## Step 3: Express Server + SPA Serving
**Status:** DONE

**Files created:**
- `server/index.js` — Express on :3000, reads env vars, serves dist/ as static, SPA fallback (GET+POST), /api/health endpoint

**Test:** GET `/` → 200 (SPA), POST `/` → 200 (not 405), GET `/api/health` → JSON.

**Result:** PASS — All three endpoints respond correctly. Warns on missing KBC_TOKEN/KBC_URL without crashing.
