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

---

## Step 4: Keboola Storage API Client
**Status:** DONE

**Files created:**
- `server/keboola-client.js` — `createClient(kbcUrl, kbcToken)` returning `{ listBucketTables, getTable, listAllTables }`

**Key features:**
- Uses native `fetch()` with `X-StorageApi-Token` header
- `listBucketTables(bucketId)` — single API call per bucket with `?include=columns,metadata,columnMetadata`
- `listAllTables(bucketIds?)` — fetches from `out.c-bdm` + `out.c-bdm_aux` in parallel via `Promise.allSettled`
- Normalizes response to: `{ id, name, description, primaryKey, rowsCount, dataSizeBytes, columns: [{ name, databaseNativeType, keboolaBaseType, nullable, description, length }], bucket, lastImportDate, lastChangeDate }`
- Strips `#` prefix from token (Keboola env injection quirk)
- Strips trailing slash from base URL
- Graceful error handling: failed buckets logged as warnings, don't crash the app

**Test:** 28 tests via mock HTTP server — normalization, auth header, multi-bucket parallel fetch, error handling (404), default bucket IDs. Verified against real Keboola project data (51 tables in out.c-bdm + 7 in out.c-bdm_aux = 58 total).

**Result:** PASS — All 28 unit/integration tests pass. Column metadata correctly extracted from Keboola metadata arrays.

---

## Step 5: FK Inference Engine
**Status:** DONE

**Files created:**
- `server/inference.js` — `inferRelationships(tables, overridesPath)` → `{ edges[], categories{}, stats{} }`
- `server/overrides.json` — alias mappings (12), skip list (2), add/remove (empty)

**Algorithm (priority order):**
1. Check `overrides.skip` (suppress EXTERNAL_SYSTEM_ID, EXTERNAL_ORDER_ID)
2. Check `overrides.alias` (CREATED_BY_USER_ID→REF_OPERATOR, DESTINATION_ID→REF_LOCATION, etc.)
3. Own-PK skip (FCT_ORDER.ORDER_ID doesn't self-ref)
4. Direct entity match: CLIENT_ID → REF_CLIENT (searches REF_→DIM_→FCTH_→FCT_→MAP_→AUX_)
5. Progressive prefix strip: INITIAL_STOCK_LOCATION_ID → strip INITIAL_ → STOCK_LOCATION → strip STOCK_ → LOCATION → REF_LOCATION
6. Category assignment: FCTH_ checked before FCT_ (prefix overlap)

**Key design decisions:**
- FK search order prefers REF_ over FCT_ (INVOICE_ID → REF_INVOICE, not FCT_INVOICE)
- Category detection order: FCTH_ before FCT_ (separate from FK search)
- Each FK column produces a separate labeled edge (no merging)
- Self-referencing alias allowed (PARENT_CLIENT_ID → REF_CLIENT within REF_CLIENT)
- Edge metadata includes `inferenceMethod`: direct | compound | alias | manual

**Overrides (12 aliases):**
- USER→OPERATOR: CREATED_BY_USER_ID, HANDLED_BY_USER_ID, USER_ID, CREATED_BY_ID
- Location aliases: DESTINATION_ID, ORIGIN_ID → REF_LOCATION
- PICKUP_COUNTRY_ID → REF_COUNTRY, ORDER_VALUE_CURRENCY_ID → REF_CURRENCY
- DEPARTMENT_ID, DEPT_ID → REF_OPS_DEPARTMENT
- QUOTE_DISPATCH_ID → AUX_QUOTE_DISPATCH, PARENT_CLIENT_ID → REF_CLIENT

**Test:** 89 tests covering all inference methods, category assignment, self-ref skipping, AUX bridges, REF chains, FCTH, cross-table references, edge metadata, uniqueness. Mock data based on real Keboola project structure.

**Result:** PASS — 89/89. Produces 84 edges (63 direct, 4 compound, 17 alias). Only 1 unmatched _ID column out of 146 scanned.

---

## Step 6: Metadata Cache + API Endpoints
**Status:** DONE

**Files created:**
- `server/metadata-cache.js` — `MetadataCache` class with `init()`, `refresh()`, `getMetadata()`, `getTable(id)`, `getStatus()`, `destroy()`

**Files modified:**
- `server/index.js` — added `/api/metadata`, `/api/table/:tableId`, `POST /api/refresh` routes; cache init before `app.listen()`; async `start()` function

**Startup sequence:**
1. Create MetadataCache with env vars
2. `cache.init()` — fetch all tables, run inference, store result (blocks until ready)
3. Start 15-min auto-refresh interval (timer doesn't prevent process exit)
4. `app.listen()` — server ready

**API endpoints:**
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/health` | Status, uptime, cache status (always works) |
| GET | `/api/metadata` | Full payload: tables + edges + categories + stats |
| GET | `/api/table/:tableId` | Single table with columns + outgoing/incoming edges |
| POST | `/api/refresh` | Trigger cache refresh, returns counts + duration |
| GET/POST | `/` | SPA fallback (always works) |

**Graceful degradation:**
- No credentials → server starts, SPA + health work, API endpoints return 503 with message
- Cache init fails → server starts anyway, 503 until cache loads
- Refresh already in progress → returns `{ status: "skipped" }`

**Test:** 24 integration tests via mock Keboola API — cache init, getMetadata shape/categories, getTable with relationships, refresh, edge correctness. Plus manual curl tests for all endpoints without credentials (503 responses verified).

**Result:** PASS — All 24 integration tests pass. Server handles all endpoint scenarios correctly.

---

## Step 7: React App Shell (Layout, Routing, Theme)
**Status:** DONE

**Files created:**
- `src/lib/types.ts` — TypeScript interfaces: Column, TableSummary, TableDetail, Edge, Category, MetadataResponse, Page
- `src/lib/constants.ts` — CATEGORY_CONFIG (colors, labels, Tailwind classes for each category), CATEGORY_ORDER
- `src/hooks/useTheme.ts` — system preference default, localStorage persistence, `dark` class on `<html>`
- `src/hooks/useMetadata.ts` — fetch `/api/metadata`, return `{ data, isLoading, error, refresh, isRefreshing }`
- `src/components/ui/button.tsx` — variant (default/secondary/ghost/outline), size (default/sm/lg/icon)
- `src/components/ui/badge.tsx` — variant (default/secondary/outline)
- `src/components/ui/input.tsx` — styled input with focus ring
- `src/components/ui/tooltip.tsx` — hover tooltip with side positioning
- `src/components/layout/Header.tsx` — logo, ERD/Tables nav tabs, search trigger (Cmd+K hint), theme toggle
- `src/components/layout/Layout.tsx` — Header + main content wrapper, full height
- `src/pages/ErdPage.tsx` — placeholder with table/edge counts + refresh
- `src/pages/TableBrowserPage.tsx` — placeholder with table count

**Files modified:**
- `src/App.tsx` — rewritten: state-based routing (`erd` | `tables`), useTheme, useMetadata, loading/error states

**Error encountered:**
- `TooltipProps` extended `HTMLAttributes<HTMLDivElement>` which has its own `content: string` attribute, conflicting with our `content: ReactNode`
- **Fix:** Use `Omit<HTMLAttributes<HTMLDivElement>, 'content'>` to exclude the conflicting property

**Test:** `npm run build` succeeds. SPA serves correctly. Health endpoint works. Tabs, theme toggle, loading/error states all implemented.

**Result:** PASS — Build: `index.html` (0.47 KB), `index.css` (18.77 KB), `index.js` (174.93 KB / 56 KB gzip). Zero errors.
