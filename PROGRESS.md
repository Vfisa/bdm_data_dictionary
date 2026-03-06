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

---

## Step 8: ERD Diagram
**Status:** DONE

**Files created:**
- `src/components/erd/useErdLayout.ts` — converts MetadataResponse → React Flow nodes/edges via Dagre layout (top-to-bottom, category-based rank hints)
- `src/components/erd/TableNode.tsx` — custom React Flow node: 2px colored header bar, category badge, table name, column/row count stats
- `src/components/erd/ErdToolbar.tsx` — category filter toggles (colored dots), table/edge count, relative time since refresh, refresh button, fit-to-view button
- `src/components/erd/ErdCanvas.tsx` — React Flow canvas with custom nodeTypes, MiniMap, dotted Background, ReactFlowProvider wrapper

**Files modified:**
- `src/pages/ErdPage.tsx` — rewritten: wires ErdCanvas with metadata, manages selectedTable state for future detail panel
- `src/index.css` — added React Flow theme overrides (CSS custom properties for dark/light theme, edge label show-on-hover, edge hover/selected effects)

**Layout configuration:**
- Dagre: `rankdir: TB`, `nodesep: 60`, `ranksep: 100`, margins 40px
- Node dimensions: 220px wide × 80px tall
- Category rank order applied via Dagre node rank hints
- `nodesDraggable: false` (fixed layout)

**Edge rendering:**
- Separate edge per FK column (not merged)
- Labels hidden by default, shown on hover/select (CSS transitions)
- Arrow markers at target end
- Semi-transparent by default, full opacity on hover/select

**Interactive features:**
- Category filter toggles (can't hide all — minimum 1 must remain visible)
- Pan on scroll, zoom on scroll
- MiniMap (pannable, zoomable, color-coded by category)
- Fit-to-view button
- Node click → sets selected table (for Step 9 detail panel)
- Refresh button triggers server-side metadata refresh

**Test:** `npm run build` succeeds. Zero TypeScript errors. All components wire together correctly.

**Result:** PASS — Build: `index.html` (0.47 KB), `index.css` (39.90 KB / 7.78 KB gzip), `index.js` (457.29 KB / 150.07 KB gzip). React Flow adds ~280 KB to JS bundle. Zero errors.

---

## Step 9: Table Detail Overlay
**Status:** DONE

**Files created:**
- `src/components/table-detail/TableDetailPanel.tsx` — fixed-right 420px slide-in panel with header (category badge, name, description), stats bar (columns, rows, size, last import), scrollable content
- `src/components/table-detail/ColumnTable.tsx` — scrollable column grid: name (with PK icon), type (TypeBadge), nullable indicator, description
- `src/components/table-detail/RelationshipList.tsx` — outgoing ("References") and incoming ("Referenced By") edges, clickable navigation to target/source tables
- `src/components/table-detail/TypeBadge.tsx` — type-specific badges with icons (number=blue/Hash, string=green/Type, date=purple/Calendar, boolean=amber/Toggle)

**Files modified:**
- `src/pages/ErdPage.tsx` — wired TableDetailPanel: selectedTable state, close handler, navigate-to-table handler

**Features:**
- Slide-in/slide-out animation via CSS `translate-x` transition (200ms)
- Close on Escape key, backdrop click, or X button
- Relationship navigation: clicking a relationship swaps the panel to that table
- Column table: sticky header, PK icon (amber key), type badges with hover title showing native type
- Stats bar: column count, row count, data size (auto-formatted), last import (relative time)
- Empty states: "No description available" (italic), "No relationships found"

**Errors fixed:**
- `title` prop not available on lucide-react SVG components — wrapped icons in `<span title="...">` instead
- Unused type imports (`TableSummary`, `Edge`, `Binary`) removed

**Test:** `npm run build` succeeds. Zero TypeScript errors.

**Result:** PASS — Build: `index.html` (0.47 KB), `index.css` (44.51 KB / 8.60 KB gzip), `index.js` (470.20 KB / 152.96 KB gzip). Detail panel adds ~13 KB JS. Zero errors.

---

## Step 10: Table Browser Page
**Status:** DONE

**Files created:**
- `src/components/table-browser/CategoryFilter.tsx` — rounded-pill toggle chips with colored dots and table counts per category
- `src/components/table-browser/SortControls.tsx` — inline sort buttons: Name, Rows, Columns, Size with direction indicator (↑↓)
- `src/components/table-browser/TableList.tsx` — card-style table rows: category color bar, badge, name, description, stats, matched column indicator

**Files modified:**
- `src/pages/TableBrowserPage.tsx` — rewritten: search input, category filters, sort controls, filtered/sorted table list, detail panel integration

**Features:**
- **Search:** Filters by table name AND column names within tables. Shows "Matched: COLUMN_X, COLUMN_Y" indicator
- **Category filter:** Toggle chips with table counts. Minimum 1 category must remain visible
- **Sort:** Toggle between Name (asc default) / Rows / Columns / Size (desc default for numeric). Click same field to flip direction
- **Results count:** "X of Y tables matching 'query'"
- **Detail panel:** Same TableDetailPanel from Step 9, reused for clicking table cards
- **Empty state:** "No tables match your filters"

**Test:** `npm run build` succeeds. Zero TypeScript errors.

**Result:** PASS — Build: `index.html` (0.47 KB), `index.css` (45.20 KB / 8.67 KB gzip), `index.js` (476.48 KB / 154.53 KB gzip). Zero errors.

---

## Step 11: Global Search (Cmd+K)
**Status:** DONE

**Files created:**
- `src/components/search/useSearch.ts` — builds flat index of tables + columns from metadata for cmdk to search
- `src/components/search/CommandPalette.tsx` — modal dialog using cmdk with grouped results (Tables / Columns), fuzzy search, keyboard navigation

**Files modified:**
- `src/App.tsx` — added Cmd+K / Ctrl+K global shortcut, search open state, CommandPalette rendering, search-to-table navigation
- `src/pages/ErdPage.tsx` — listens for `selectTable` custom event from search to open detail panel
- `vite.config.ts` — increased `chunkSizeWarningLimit` to 600 KB (React Flow + cmdk + Radix push bundle past 500 KB)

**Features:**
- **Cmd+K / Ctrl+K** opens the command palette from anywhere in the app
- **Grouped results:** Tables (with database icon, category badge, description) and Columns (with table name, type)
- **Fuzzy matching:** Powered by cmdk's built-in `command-score` library
- **Navigation:** Select a table → switches to ERD page and opens detail panel; select a column → navigates to its parent table
- **Keyboard:** ↑↓ to navigate, ↵ to select, Escape to close
- **Footer:** Keyboard shortcut hints

**Errors fixed:**
- Unused `useEffect` import in CommandPalette
- `payload.split('.')[0]` returns `string | undefined` — added `?? payload` fallback

**Test:** `npm run build` succeeds. Zero TypeScript errors.

**Result:** PASS — Build: `index.html` (0.47 KB), `index.css` (48.13 KB / 9.08 KB gzip), `index.js` (529.62 KB / 171.33 KB gzip). cmdk + Radix adds ~53 KB JS. Zero errors.

---

## Step 12: Polish & QA
**Status:** DONE

**Files created:**
- `src/components/layout/ErrorBoundary.tsx` — React class-based error boundary with "Try Again" / "Reload Page" buttons

**Files modified:**
- `src/App.tsx` — wrapped app in `<ErrorBoundary>`, added `role="status"` + `aria-label` on loading state, `role="alert"` on error state, `aria-hidden` on decorative icons
- `src/components/layout/Header.tsx` — added `aria-label` on search button
- `src/components/layout/Layout.tsx` — added `role="main"` + dynamic `aria-label` on main content area
- `src/components/table-detail/TableDetailPanel.tsx` — added `role="dialog"` + `aria-label` + `aria-modal` on panel

**QA Checklist:**
| Check | Result |
|-------|--------|
| `npm run build` — zero errors | PASS |
| `node server/index.js` — starts without crash | PASS |
| GET `/` → 200 (SPA) | PASS |
| POST `/` → 200 (Keboola liveness check) | PASS |
| GET `/api/health` → 200 JSON | PASS |
| GET `/api/metadata` → 503 (no credentials) | PASS (expected) |
| `keboola-config/setup.sh` is executable | PASS |
| dist/ contains index.html + assets | PASS |
| Source files: 30 TypeScript/React | PASS |
| Server files: 5 (index.js, keboola-client.js, inference.js, metadata-cache.js, overrides.json) | PASS |
| Error boundary wraps entire app | PASS |
| ARIA labels on key interactive elements | PASS |
| Theme toggle persists via localStorage | PASS |

**Final bundle:**
| File | Size | Gzip |
|------|------|------|
| index.html | 0.47 KB | 0.31 KB |
| index.css | 48.36 KB | 9.13 KB |
| index.js | 531.61 KB | 171.94 KB |

**Total gzip: ~181 KB** — within acceptable range for a data app with React Flow + cmdk.

---

---

## Phase 1: Visual Polish & Layout
**Status:** DONE
**Commit:** `d8fc976`

**Changes:**
- F1: Increased font sizes across all components (`text-xs` → `text-sm` in tables, `text-base` → `text-lg` in headers)
- F5: Default sort by category priority (FCT → FCTH → DIM → REF → MAP → AUX → OTHER) via `CATEGORY_SORT_PRIORITY` map
- F6: Sidebar width 420px → 560px with increased padding
- F9: ERD layout reorder — `CATEGORY_ORDER` changed to `['REF', 'DIM', 'FCT', 'FCTH', 'MAP', 'AUX', 'OTHER']` (reference data on top, auxiliary on bottom)

**Files modified:** `src/index.css`, `TableNode.tsx`, `ColumnTable.tsx`, `TableDetailPanel.tsx`, `RelationshipList.tsx`, `TableList.tsx`, `Header.tsx`, `constants.ts`, `SortControls.tsx`, `TableBrowserPage.tsx`

**Result:** PASS — Build succeeds. Visual improvements verified in browser.

---

## Phase 2: ERD Interaction Enhancements
**Status:** DONE
**Commit:** `c55bc1e`

**Changes:**
- F2: Connection highlighting — click a node to dim unconnected nodes/edges (opacity 0.15) and glow connected ones (drop-shadow)
- F7: Date link visualization — dashed purple lines from DATE/TIMESTAMP columns to DIM_DATE, toggle off by default
- F12: Export ERD as PNG via `html-to-image` library

**Files modified:** `ErdCanvas.tsx`, `useErdLayout.ts`, `ErdToolbar.tsx`, `index.css`, `inference.js`, `metadata-cache.js`, `types.ts`

**New dependency:** `html-to-image ^1.11.13`

**Result:** PASS — Build succeeds. Dim+glow, date links, and PNG export all verified.

---

## Phase 3: Data Quality & Stats Dashboard
**Status:** DONE
**Commit:** `a3363a9`

**Changes:**
- F4+F13: QA stats dashboard — horizontal KPI cards (total tables, columns, rows, QA score, missing descriptions, empty tables)
- F10: $NOVALUE convention — info tooltips on `_ID` columns, `NOVALUE_SENTINEL` constant

**Files created:** `src/lib/qa-stats.ts`, `src/components/table-browser/StatsDashboard.tsx`

**Files modified:** `TableBrowserPage.tsx`, `ColumnTable.tsx`

**Result:** PASS — QA score color-coded correctly. $NOVALUE tooltips render on _ID columns.

---

## Phase 4: Inline Description Editing
**Status:** DONE
**Commit:** `614cbce`

**Changes:**
- F3: Full click-to-edit flow with confirmation dialog for table and column descriptions
- Backend: `updateTableDescription()` and `updateColumnDescription()` via Keboola metadata API (JSON format)
- Server: `PUT /api/descriptions` route with table/column detection based on itemId part count
- Cache: Optimistic in-memory update after successful API call
- Frontend: `InlineEditor`, `ConfirmDialog`, `useDescriptionEditor` hook
- Wired `onDescriptionUpdated` → `refetch()` through App → pages

**Files created:** `src/components/ui/InlineEditor.tsx`, `src/components/ui/ConfirmDialog.tsx`, `src/hooks/useDescriptionEditor.ts`

**Files modified:** `server/keboola-client.js`, `server/index.js`, `server/metadata-cache.js`, `types.ts`, `useMetadata.ts`, `TableDetailPanel.tsx`, `ColumnTable.tsx`, `ErdPage.tsx`, `TableBrowserPage.tsx`, `App.tsx`

**Bug fix (post-commit):** Switched Keboola API calls from deprecated `application/x-www-form-urlencoded` to `application/json`. Column metadata now uses table endpoint with `columnsMetadata` field instead of separate per-column endpoint.

**Result:** PASS — Full edit flow verified: click → edit → save → confirm → API call → cache update → UI refresh.

---

## Phase 5: Search Enhancements
**Status:** DONE
**Commit:** `f52ea39`

**Changes:**
- F8: Search filter toggles in command palette — "Both" / "Tables Only" / "Columns Only" buttons below search input

**Files modified:** `src/components/search/CommandPalette.tsx`

**Result:** PASS — Filter toggles render correctly, conditionally show/hide table and column result groups.

---

## Dev Infrastructure: Mock Data Server
**Status:** DONE
**Commit:** `3c83181`

**Changes:**
- Auto-detect missing KBC_TOKEN/KBC_URL and serve mock data for local development
- 10 sample tables (4 REF, 2 DIM, 2 FCT, 1 MAP, 1 AUX), 9 FK edges, 4 date edges
- Mock mode supports in-memory description editing

**Files created:** `server/mock-data.js`

**Files modified:** `server/index.js`

**Result:** PASS — `npm run dev` works out-of-the-box without Keboola credentials.

---

## Phase 6: UX Improvements (PRD Phase 3)
**Status:** DONE

**Changes:**

### Feature 1: ERD pan/zoom with sidebar open
- Removed full-screen backdrop overlay (`absolute inset-0 z-20`) from `TableDetailPanel`
- Panel is now a floating sidebar: `absolute top-0 right-0 h-full w-[560px] z-20`
- ERD canvas remains fully interactive (pan, zoom, node click) while detail panel is open
- Removed `handleBackdropClick` callback — panel closes via X button or Escape key only

### Feature 2: ERD export improvements
- Replaced single PNG export button with `ExportDropdown` component offering three formats:
  - **PNG (3x)** — `pixelRatio: 3` for print-quality resolution
  - **SVG (vector)** — via `html-to-image`'s `toSvg()` for infinite scalability
  - **Mermaid (.mmd)** — Generates Mermaid `erDiagram` text from full metadata
- Created `src/lib/mermaid.ts` — `generateMermaidERD()` converts all tables + edges to Mermaid syntax

### Feature 3: Collaborative tags
- **Backend:** Tags stored as JSON array in Keboola metadata under `bdm.tags` key (`provider: 'user'`)
  - `server/keboola-client.js` — added `updateTableTags()`, extracts tags from metadata in `normalizeTable()`
  - `server/metadata-cache.js` — added `updateTags()` with optimistic in-memory update
  - `server/index.js` — added `PUT /api/tags` endpoint (supports mock mode)
  - `server/mock-data.js` — added sample tags to all 10 mock tables
- **Frontend:** Tag editor + tag chips + tag filtering
  - `src/components/tags/TagEditor.tsx` — `TagEditor` (add/remove with predefined suggestions + custom input) and `TagChips` (read-only display)
  - `src/hooks/useTags.ts` — hook for tag API calls
  - `src/lib/types.ts` — added `PREDEFINED_TAGS`, `PredefinedTag` type, `tags: string[]` to `TableSummary`
  - `src/lib/constants.ts` — added `TAG_CONFIG` with colors for 6 predefined tags
  - `src/components/table-detail/TableDetailPanel.tsx` — added TagEditor section
  - `src/components/table-browser/TableList.tsx` — added TagChips after description
  - `src/pages/TableBrowserPage.tsx` — added tag filter state, `allTags` memo, tag filter UI with colored buttons

**Files created:**
- `src/lib/mermaid.ts`
- `src/hooks/useTags.ts`
- `src/components/tags/TagEditor.tsx`

**Files modified:**
- `server/index.js`, `server/keboola-client.js`, `server/metadata-cache.js`, `server/mock-data.js`
- `src/components/erd/ErdCanvas.tsx`, `src/components/erd/ErdToolbar.tsx`
- `src/components/table-browser/TableList.tsx`, `src/components/table-detail/TableDetailPanel.tsx`
- `src/lib/constants.ts`, `src/lib/types.ts`, `src/pages/TableBrowserPage.tsx`

**Result:** PASS — Build succeeds (568.64 KB JS / 182.91 KB gzip, 54.02 KB CSS / 9.92 KB gzip). All three features verified in browser.

---

## Summary

All 12 foundation steps + 6 expansion phases complete. The BDM Data Dictionary & ERD Viewer includes:

- **58 tables** from `out.c-bdm` + `out.c-bdm_aux` with live Keboola metadata
- **84 inferred FK relationships** via dynamic inference engine
- **Interactive ERD diagram** with Dagre layout, category filters, minimap, connection highlighting, date links, multi-format export (PNG 3x / SVG / Mermaid)
- **Floating detail panel** with column types, PK indicators, navigable relationships, inline description editing — ERD stays interactive while panel is open
- **Table browser** with search, category filters, sort, QA stats dashboard, tag filtering
- **Collaborative tags** — predefined + custom tags stored in Keboola metadata, with tag editor and filter-by-tag
- **Global search** (Cmd+K) with fuzzy matching and filter toggles (Both/Tables/Columns)
- **Inline description editing** with Keboola Storage API write-back and confirmation dialog
- **QA metrics** — description coverage score, missing counts, $NOVALUE documentation
- **Dark/light theme** with system preference default
- **Mock data mode** for credential-free local development
- **Enterprise-grade UI** with shadcn/ui design tokens
- **Keboola deployment-ready** with nginx proxy, supervisord, and setup.sh
