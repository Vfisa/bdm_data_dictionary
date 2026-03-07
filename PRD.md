# PRD: BDM Data Dictionary & ERD Viewer

> **Project**: Horizon Air Freight — Business Data Model Explorer
> **Keboola Project**: EU_Horizon Air Freight (ID: 4432)
> **Bucket**: `out.c-bdm` (52 tables, ~3.2 GB)
> **Date**: 2026-03-05

---

## 1. Overview

A React-based Keboola Data App that provides an interactive ERD (Entity Relationship Diagram) and a full data dictionary for the `out.c-bdm` bucket. The app enables business analysts, data engineers, and stakeholders to visually explore the data model, understand table relationships, and inspect column-level metadata — all within the Keboola platform.

---

## 2. Goals

| Priority | Goal |
|----------|------|
| P0 | Interactive ERD diagram with pan/zoom, showing all available tables and their FK relationships |
| P0 | Table browser: click any table to see columns, data types, descriptions, PKs, row counts |
| P0 | Enterprise-grade UI: clean, professional, dark/light theme, responsive |
| P0 | Deploy as Keboola JS Data App (compatible with `keboola-config/` architecture) |
| P1 | Search/filter tables by name, prefix (FCT_, REF_, MAP_, DIM_), or column name |
| P1 | ERD layout grouped by table category (Fact, Reference, Mapping, Dimension) |
| P2 | Future extensibility for data lineage, sample data preview, quality metrics |

---

## 3. Target Users

- **Data Engineers**: Understand schema, trace FK chains, validate model structure
- **Business Analysts**: Discover available tables, understand what data is available
- **Project Stakeholders**: Visual overview of the data model for documentation/review

---

## 4. Data Model Summary

### Table Categories (52 tables)

| Prefix | Count | Purpose | Examples |
|--------|-------|---------|----------|
| `DIM_` | 1 | Conformed dimensions | DIM_DATE |
| `FCT_` | 4 | Transactional fact tables | FCT_ORDER, FCT_DISPATCH, FCT_FINANCIAL, FCT_INVOICE |
| `FCTH_` | 1 | Historical fact (SCD2-style) | FCTH_CURRENCY_CONVERSION_RATE |
| `MAP_` | 7 | Event/bridge mapping tables | MAP_ORDER_EVENT, MAP_DISPATCH_EVENT, REF_BOX |
| `REF_` | 39 | Reference/master data | REF_CLIENT, REF_CARRIER, REF_LOCATION, REF_OPERATOR |
| `AUX` | 39 | Auxiliary tables helping to definee relationships | AUX_BOXTODISPATCH, AUX_QUOTETOORDER |

### Relationship Detection — Dynamic Inference Engine

Rather than maintaining a static manifest, the app includes a **runtime FK inference engine** that automatically discovers relationships every time the metadata is loaded. This means **adding a new table to `out.c-bdm` requires zero code changes** — the ERD updates on the next data refresh.

#### Inference Algorithm

```
For each table T in bucket:
  For each column C in T where C ends with "_ID":
    1. Extract entity name: strip suffix "_ID" from C
       e.g. "CLIENT_ID" → "CLIENT", "ORIGIN_LOCATION_ID" → "ORIGIN_LOCATION"

    2. Direct match: Look for table named REF_{entity} or DIM_{entity}
       e.g. "CLIENT_ID" → REF_CLIENT ✓

    3. Suffix stripping: If no match, strip known prefixes from entity
       e.g. "ORIGIN_LOCATION_ID" → strip "ORIGIN_" → "LOCATION" → REF_LOCATION ✓
       e.g. "HANDLED_BY_USER_ID" → strip "HANDLED_BY_" → "USER" → REF_USER? → check...
       Prefix strip list: ORIGIN_, DESTINATION_, INITIAL_, PICKUP_, CREATED_BY_, HANDLED_BY_

    4. PK match: Verify the target table actually has column C (or the base _ID column)
       e.g. REF_LOCATION must have "LOCATION_ID" column to confirm the edge

    5. If matched → create edge { source: T, target: matched_table, column: C, cardinality: "M:1" }
```

#### Override Layer (`overrides.json`)

An optional, small JSON file for edge cases the algorithm can't infer:

```json
{
  "add": [
    { "source": "FCT_ORDER", "target": "MAP_ORDER_TO_DISPATCH", "sourceColumn": "ORDER_ID", "targetColumn": "ORDER_ID", "label": "dispatches" }
  ],
  "remove": [
    { "source": "REF_BOX", "target": "REF_BOX_TYPE", "reason": "false positive — no actual FK" }
  ],
  "alias": {
    "PICKUP_COUNTRY_ID": { "target": "REF_COUNTRY", "targetColumn": "COUNTRY_ID" }
  }
}
```

This keeps the override file tiny (only exceptions) while the engine handles the 90%+ common case.

#### AUX Table Handling

`AUX_` tables are junction/bridge tables (e.g., `AUX_BOXTODISPATCH`, `AUX_QUOTETOORDER`). The inference engine treats them specially:

1. **Name parsing**: The table name itself encodes the relationship — `AUX_XTOУ` implies a bridge between entity X and entity Y
2. **Multi-FK**: AUX tables typically have 2+ `_ID` columns. All are inferred as FK edges (both sides of the bridge)
3. **ERD placement**: AUX nodes sit in a swim lane between MAP and REF, visually showing they connect entities
4. **Cardinality**: Both sides are M:1 by default (the AUX row points to one X and one Y), making the overall relationship M:M through the bridge

Example: `AUX_BOXTODISPATCH` with columns `BOX_ID` + `DISPATCH_ID` →
- Edge: `AUX_BOXTODISPATCH` → `REF_BOX` (via `BOX_ID`)
- Edge: `AUX_BOXTODISPATCH` → `REF_DISPATCH` (via `DISPATCH_ID`)

#### Self-Healing Behavior

| Scenario | What happens |
|----------|-------------|
| New table added to bucket | Auto-discovered on next metadata refresh; placed in correct category by prefix |
| New `_ID` column added to existing table | New FK edge inferred automatically |
| Table removed from bucket | Disappears from ERD; any override referencing it is silently ignored |
| Column renamed | Old edge gone, new edge inferred if naming convention holds |
| Table with unrecognized prefix | Categorized as `Other`, placed in bottom swim lane with slate color. FK inference still runs on its `_ID` columns. |

---

## 5. Architecture

### 5.1 Keboola Data App Compliance

```
Repository Root/
├── keboola-config/
│   ├── nginx/sites/default.conf        # Proxy 8888 → 3000
│   ├── supervisord/services/app.conf   # Start Express server
│   └── setup.sh                        # npm install + npm run build
├── server/
│   ├── index.js                        # Express server (SPA + API routes)
│   ├── keboola-client.js               # Keboola Storage API wrapper
│   ├── inference.js                    # FK relationship inference engine
│   ├── metadata-cache.js               # In-memory cache with TTL refresh
│   └── overrides.json                  # Manual FK edge corrections (tiny)
├── src/                                # React application source
│   ├── components/
│   │   ├── erd/                        # ERD diagram components
│   │   ├── table-detail/               # Table detail panel
│   │   ├── layout/                     # Shell, sidebar, header
│   │   └── ui/                         # shadcn/ui primitives
│   ├── hooks/
│   ├── lib/                            # Utils, types, constants
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example                        # KBC_TOKEN, KBC_URL, BUCKET_ID
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 5.2 Runtime Architecture

```
Browser ──► Keboola HTTPS ──► Nginx (:8888) ──► Express (:3000)
                                                    │
                                         ┌──────────┼──────────────┐
                                         │          │              │
                                    Serve SPA   /api/metadata    /api/table/:id
                                    (static)        │              │
                                                    ▼              │
                                          ┌─────────────────┐      │
                                          │  MetadataCache  │      │
                                          │  (in-memory)    │      │
                                          │                 │      │
                                          │ • tables[]      │      │
                                          │ • columns{}     │      │
                                          │ • edges[]       │      │
                                          │ • lastRefresh   │      │
                                          └────────┬────────┘      │
                                                   │               │
                                            Keboola Storage API ◄──┘
                                            (KBC_URL + KBC_TOKEN)
```

### 5.3 Data Loading Strategy

**Fully dynamic, API-first approach:**

1. **Server startup**: Express fetches ALL tables from `out.c-bdm` bucket, including column definitions. Builds the full metadata model and runs the FK inference engine. Result is cached in-memory.
2. **Client load**: Frontend requests `/api/metadata` — gets tables, columns, AND computed edges in a single payload. ERD renders immediately.
3. **On-demand detail**: Individual table detail (descriptions, full column info) fetched via `/api/table/:id` if not already in the metadata cache.
4. **Refresh**: `POST /api/refresh` triggers a full re-fetch from Keboola Storage API. UI shows a refresh button. Server also auto-refreshes every 15 minutes.
5. **Override layer**: Optional `overrides.json` file (committed to repo) for manual edge corrections — read at startup and on refresh.

**No static manifest needed.** New tables appear automatically.

### 5.4 Data Flow Lifecycle

```
┌─ CONTAINER BOOT ───────────────────────────────────────────────────┐
│  setup.sh → npm install + npm run build                            │
│  supervisord → starts Express on :3000                             │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ SERVER STARTUP (before any user connects) ────────────────────────┐
│                                                                     │
│  1. Read env: KBC_TOKEN, KBC_URL, BUCKET_ID                        │
│  2. Fetch all tables from bucket         (Keboola Storage API)     │
│  3. Fetch columns for each table         (parallelized, ~50 reqs)  │
│  4. Run FK inference engine              (scan _ID cols → edges)   │
│  5. Store in MetadataCache               (in-memory, ready to serve)│
│  6. Start 15-min auto-refresh timer                                 │
│                                                                     │
│  Total: ~3-8 seconds. Server is NOT ready until cache is warm.      │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ USER OPENS APP (instant) ─────────────────────────────────────────┐
│                                                                     │
│  Browser loads SPA → GET /api/metadata → returns pre-computed cache │
│  React Flow renders ERD immediately. No waiting for analysis.       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ BACKGROUND REFRESH (non-blocking) ───────────────────────────────┐
│                                                                     │
│  Every 15 min (or manual POST /api/refresh):                        │
│  Re-fetch → re-infer → atomic cache swap                            │
│  Old cache serves requests throughout. Zero downtime.               │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 5.5 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + TypeScript | Type safety, ecosystem |
| Build | Vite | Fast builds, works in setup.sh |
| ERD Rendering | @xyflow/react (React Flow) | Battle-tested, performant with 50+ nodes, pan/zoom/minimap |
| UI Framework | Tailwind CSS + shadcn/ui | Enterprise-grade components, theming, accessibility |
| Backend | Express.js | Minimal, serves SPA + proxies Keboola API |
| Icons | Lucide React | Clean, consistent icon set |

---

## 6. Feature Specification

### 6.1 ERD Diagram View (Main Page)

**Layout:**
- Tables rendered as interactive nodes using React Flow
- Nodes grouped into swim lanes by category: `DIM`, `FCT/FCTH`, `MAP`, `AUX`, `REF`
- FK edges drawn as animated connecting lines between related tables
- Color coding per category:
  - `FCT_` / `FCTH_`: Green
  - `REF_`: Light Blue
  - `MAP_`: Light Orange
  - `DIM_`: Blue
  - `AUX_`: Gray — bridge/junction tables sit between MAP and REF visually
  - `Other`: Slate/dark gray — unrecognized prefixes, placed in their own swim lane at the bottom
- **Layout algorithm**: Deterministic auto-layout using Dagre/ELK. Same data = same positions every time. Nodes are not draggable. Refresh-safe.

**Node Display:**
Each table node shows:
- Table name (bold header with category badge)
- Row count
- Column count
- PK indicator

**Interactions:**
- Pan and zoom (mouse/trackpad)
- Click node → opens Table Detail panel (slide-in from right)
- Hover edge → highlight FK relationship path
- Minimap in bottom-right corner
- Fit-to-view button
- Toggle: show/hide table categories
- **Refresh button** in toolbar:
  - Shows time since last refresh (e.g., "🔄 Refreshed 2m ago")
  - Click → `POST /api/refresh` → spinner while backend re-fetches from Keboola API
  - On completion: ERD re-renders with updated tables/edges (new tables appear, removed tables disappear)
  - If new tables were discovered, a toast notification: "3 new tables found"
  - Button is disabled during refresh to prevent double-triggers

### 6.2 Table Detail Panel

When a table node is clicked, a detail panel slides in as a **floating overlay** from the right (the ERD canvas stays full-width underneath, like a Google Maps info panel). Panel width: ~420px fixed. Close via ✕ button, Escape key, or clicking the ERD background.

Content:

| Section | Content |
|---------|---------|
| Header | Table name, description, category badge, row count, data size |
| Columns | Scrollable table: Column Name, Data Type (native), Base Type, Nullable, PK, Description |
| Relationships | List of FK references from/to this table with clickable navigation |

**Column type rendering:**
- `STRING` / `TEXT` → text badge
- `NUMERIC` / `NUMBER` → numeric badge
- `BOOLEAN` → toggle icon
- `TIMESTAMP` / `TIMESTAMP_NTZ` → clock icon
- `DATE` → calendar icon

**Column descriptions:**
- Display whatever description exists in Keboola metadata
- Empty descriptions show a grayed-out placeholder: *"Add description in Keboola Storage"* — guiding users to improve metadata at the source rather than maintaining a separate file

### 6.3 Table Browser (Secondary Page)

Full-page searchable/filterable table listing:
- Search by table name or column name
- Filter by category prefix
- Sortable by: name, row count, data size, column count
- Click row → navigates to Table Detail

### 6.4 Global Features

- **Search** (Cmd+K): Global search across table names and column names
- **Theme**: Light/dark mode toggle (persisted in localStorage). Default: **system preference** (`prefers-color-scheme`), falls back to light if no OS preference detected
- **Responsive**: Works on desktop (primary), tablet (secondary)
- **Loading states**: Skeleton loaders while API data loads
- **Error handling**: Graceful fallback if Keboola API is unavailable

---

## 7. Inference Engine Detail

### 7.1 Server Module: `server/inference.js`

The inference engine is a pure function:

```
inferRelationships(tables: TableMeta[], overrides: Overrides) → Edge[]
```

**Inputs:**
- `tables[]` — each with `{ id, name, columns: [{ name, type, isPK }] }`
- `overrides` — loaded from `overrides.json` (add/remove/alias rules)

**Output:**
- `edges[]` — each with `{ source, target, sourceColumn, targetColumn, cardinality, inferred: boolean }`

### 7.2 Inference Rules (ordered by priority)

| # | Rule | Example | Match |
|---|------|---------|-------|
| 1 | **Direct entity match**: `X_ID` → `REF_X` or `DIM_X` | `CLIENT_ID` | → `REF_CLIENT` |
| 2 | **Compound entity**: `X_Y_ID` → `REF_X_Y` | `DISPATCH_STATUS_ID` | → `REF_DISPATCH_STATUS` |
| 3 | **Prefix strip**: Strip known prefixes, then re-match | `ORIGIN_LOCATION_ID` | strip `ORIGIN_` → `REF_LOCATION` |
| 4 | **Alias override**: Explicit mapping in overrides.json | `PICKUP_COUNTRY_ID` | → `REF_COUNTRY` (via alias) |
| 5 | **PK validation**: Confirm target table has matching column | `REF_CLIENT.CLIENT_ID` exists? | ✓ edge confirmed |

**Prefix strip list** (configurable in overrides):
```
ORIGIN_, DESTINATION_, INITIAL_, PICKUP_, DELIVERY_,
CREATED_BY_, HANDLED_BY_, UPDATED_BY_, ASSIGNED_TO_,
ORDER_VALUE_, INVOICE_, SOURCE_, TARGET_
```

### 7.3 Cardinality Assignment

| Source prefix | Target prefix | Cardinality |
|---------------|---------------|-------------|
| `FCT_` / `FCTH_` | `REF_` / `DIM_` | M:1 |
| `MAP_` | `FCT_` | M:1 |
| `MAP_` | `REF_` | M:1 |
| `AUX_` | `REF_` / `FCT_` | M:1 (bridge FK) |
| `AUX_` | `AUX_` | M:1 (chained bridge) |
| `REF_` | `REF_` | M:1 (hierarchy) |
| Anything else | | M:1 (default) |

### 7.4 Edge Rendering

- **Separate edges per FK column**: Each FK column gets its own edge, even when multiple columns point to the same target table. Edges are labeled with the source column name.
  - Example: `FCT_ORDER.ORIGIN_LOCATION_ID → REF_LOCATION` and `FCT_ORDER.DESTINATION_LOCATION_ID → REF_LOCATION` render as **two distinct labeled edges**
- Self-referencing edges (e.g., `REF_LOCATION.PARENT_LOCATION_ID` → `REF_LOCATION`) → rendered as loop
- Edge labels are shown on hover or when either connected node is selected, to reduce visual noise at default zoom

### 7.5 Metadata Cache

```typescript
interface MetadataCache {
  tables: TableMeta[];          // all tables with columns
  edges: Edge[];                // inferred + override edges
  categories: CategoryMap;      // table → FCT|REF|MAP|DIM|FCTH|AUX|OTHER
  lastRefresh: ISO8601;
  ttl: 900_000;                 // 15 min auto-refresh
}
```

Cache is built once at startup, then refreshed:
- On `POST /api/refresh` (manual trigger from UI)
- Every 15 minutes (background interval)
- Refresh is non-blocking — serves stale data during refresh

---

## 8. Keboola Deployment Config

### 8.1 Nginx (`keboola-config/nginx/sites/default.conf`)

```nginx
server {
    listen 8888;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.2 Supervisord (`keboola-config/supervisord/services/app.conf`)

```ini
[program:app]
command=node /app/server/index.js
directory=/app
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

### 8.3 Setup (`keboola-config/setup.sh`)

```bash
#!/bin/bash
set -Eeuo pipefail
cd /app && npm install && npm run build
```

### 8.4 Connection & Secrets (Environment Variables)

Keboola automatically injects secrets defined in the Data App configuration as **environment variables** before the app starts. The `#` prefix (which marks values as encrypted at rest) is stripped, dashes become underscores, and the name is uppercased.

**Data App Configuration → Secrets section:**

| Secret Key (in Keboola UI) | Injected As | Description |
|-----------------------------|-------------|-------------|
| `#kbc_token` | `KBC_TOKEN` | Keboola Storage API token (read-only scope sufficient) |
| `#kbc_url` | `KBC_URL` | `https://connection.eu-central-1.keboola.com` |

**Server access pattern (Express / Node.js):**

```javascript
// server/index.js — these are available from process.env at startup
const KBC_TOKEN = process.env.KBC_TOKEN;
const KBC_URL   = process.env.KBC_URL;
const BUCKET_ID = process.env.BUCKET_ID || 'out.c-bdm';  // optional override

if (!KBC_TOKEN || !KBC_URL) {
  console.error('Missing KBC_TOKEN or KBC_URL environment variables');
  process.exit(1);
}
```

**Security notes:**
- Token is server-side only — never sent to the browser
- All `/api/*` routes proxy through Express, which attaches the `X-StorageApi-Token` header
- `BUCKET_ID` defaults to `out.c-bdm` but is overridable via env var (makes the app reusable for other buckets)
- In local development, use a `.env` file (gitignored) with the same variables

**Local development workflow:**
```bash
# 1. Copy and fill in credentials
cp .env.example .env

# 2. Build the React frontend
npm run build

# 3. Start Express (serves SPA + API on :3000)
node server/index.js

# 4. Open http://localhost:3000
```
This mirrors production exactly — Express serves the built SPA and proxies Keboola API. No separate Vite dev server needed.

---

## 9. API Endpoints (Express Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/` | Serve React SPA (both methods required by Keboola) |
| GET | `/api/metadata` | Full payload: tables + columns + inferred edges + categories. Single call to hydrate the entire ERD. |
| GET | `/api/table/:tableId` | Detailed table info (column descriptions, row counts, data size) |
| POST | `/api/refresh` | Trigger metadata re-fetch from Keboola Storage API + re-run inference engine |
| GET | `/api/health` | Server health + cache age + table count |

All `/api/*` routes use server-side `KBC_TOKEN` + `KBC_URL` to talk to Keboola Storage API. Token is never exposed to the browser.

---

## 10. Implementation Phases

### Phase 1 — Complete MVP (all P0 + P1)

**Infrastructure:**
- [x] Project scaffolding (Vite + React + TypeScript + Tailwind + shadcn/ui)
- [x] Keboola config files (nginx, supervisord, setup.sh)
- [x] Express server with SPA serving + Keboola Storage API proxy
- [x] FK inference engine (`server/inference.js`) with override support
- [x] `/api/metadata` endpoint — full metadata + edges payload
- [x] In-memory metadata cache with TTL + manual refresh

**ERD View:**
- [x] React Flow ERD with all nodes + separately labeled inferred edges
- [x] Deterministic auto-layout (Dagre/ELK) with category swim lanes
- [x] Category-based node coloring (FCT/REF/MAP/DIM/AUX/Other)
- [x] Table detail overlay panel (floating, ~420px)
- [x] Refresh button with toast notifications

**Table Browser:**
- [x] Full-page searchable/filterable table listing
- [x] Filter by category prefix, sort by name/row count/size/columns
- [x] Click row → Table Detail view

**Global:**
- [x] Global search (Cmd+K) across table and column names
- [x] Dark/light theme (system preference default) with toggle
- [x] Responsive layout (desktop primary, tablet secondary)
- [x] Loading skeletons + error states

### Phase 2 — Feature Expansion (v2, DONE)

All features below were implemented and committed:

- [x] **Visual polish** — Larger fonts, 560px sidebar, category sort priority, ERD layout reorder (REF top → AUX bottom) `d8fc976`
- [x] **Connection highlighting** — Click node to dim unconnected, glow connected (drop-shadow) `c55bc1e`
- [x] **Date link visualization** — Dashed purple DIM_DATE connections, toggle off by default `c55bc1e`
- [x] **Export ERD as PNG** — via html-to-image library `c55bc1e`
- [x] **QA stats dashboard** — KPI cards (tables, columns, rows, QA score, missing descriptions, empty tables) `a3363a9`
- [x] **$NOVALUE handling** — Info tooltips on _ID columns documenting the BDM sentinel `a3363a9`
- [x] **Inline description editing** — Click-to-edit with confirmation dialog, Keboola Storage API write-back (JSON format) `614cbce`
- [x] **Search filter toggles** — Both / Tables Only / Columns Only in command palette `f52ea39`
- [x] **Mock data server** — Auto-detected, serves 10 sample tables for local dev `3c83181`

### Phase 3 — UX Improvements (DONE)

- [x] **ERD pan/zoom with sidebar open** — Removed full-screen backdrop overlay from `TableDetailPanel`. Panel is now a floating sidebar (`absolute top-0 right-0 w-[560px] z-20`) without backdrop. Panning, zooming, and node highlighting all work while the detail panel is open.
- [x] **ERD export improvements** — Replaced single PNG button with export dropdown menu:
  - **PNG (3x)** — `pixelRatio: 3` for print-quality output
  - **SVG** — Vector export via `html-to-image`'s `toSvg()` for infinite scalability
  - **Mermaid (.mmd)** — Generates Mermaid `erDiagram` text from full metadata (all tables + all edges). Downloadable as `.mmd` file.
- [x] **Collaborative tags** — Predefined tags (`verified`, `needs-review`, `deprecated`, `core`, `wip`, `sensitive`) + free-form custom tags. Stored as JSON in Keboola metadata (`bdm.tags` key, `provider: 'user'`). Tag chips in detail panel + table browser. Filter by tag in Table Browser.

### Phase 4 — Data Profiling (DONE)

- [x] **Hybrid profiling engine** — Keboola native profiling API for exact stats (all rows: null count, distinct count, duplicate count) + data-preview API for sampled stats (1000 rows: $NOVALUE rates, min/max, top values, sample values). ProfilingCache with 30-min TTL, request deduplication, rate limiting. `csv-parse` for CSV parsing.
- [x] **$NOVALUE data profiling** — Color-coded `$NV: X%` pill badges on _ID columns. Green <5%, yellow 5-20%, red >=20%. Tooltip shows "N of M sampled rows contain $NOVALUE".
- [x] **Column-level profiling stats** — Expandable column profile drawers with null rate bar, distinct count bar, min/max (type-aware: numeric, date, string), $NOVALUE section for _ID columns, top 5 values with counts. Footer indicates exact (native profile) vs approximate (sample) stats.
- [x] **On-demand profiling** — Manual "Profile" button in detail panel Columns header. Flask icon + loading spinner. Shows "Profiled Xs ago" after completion. Error state with retry link.
- [x] **Mock profiling** — `generateMockProfile()` produces realistic stats per column for local dev (PKs: unique, _ID columns: randomized $NOVALUE, numerics: min/max, dates: date ranges, booleans: true/false distribution).

### Phase 5 — Table Browser UI updates (DONE)

- [x] **Default tab switch** — Table Browser is now the landing page; ERD is the second tab.
- [x] **Inline expanded detail** — Clicking a table card in Table Browser expands detail below the card (description editor, stats bar, tags, data preview, columns with profiling, relationships). ERD keeps its floating sidebar unchanged.
- [x] **Streamlined toolbar** — Compacted 5-row toolbar into 3 rows: stats dashboard, search + category filters + sort controls, tag pills + results count. Smaller filter pill sizing.
- [x] **Human-friendly names** — `toHumanName()` strips BDM prefixes (FCTH_, FCT_, MAP_, REF_, DIM_, AUX_) and converts to Title Case with spaces. Two-line display: human name primary, technical name secondary in mono font. Search matches both.
- [x] **Data preview** — `GET /api/preview/:tableId?limit=N` endpoint serving row-level data from Keboola Storage API (CSV parsed) or mock generator. DataPreviewTable component with load button, spinner, scrollable table with sticky header, `$NOVALUE` highlighting in red, NULL cells italic. Footer shows row count.
- [x] **Clickable KPI stats** — Missing Table Desc, Missing Col Desc, and Empty Tables cards are clickable filter buttons. Active filter highlighted with ring, status text shows filter description with clear link. Toggle behavior: click active card to clear. Cards with zero value are non-clickable.


### Phase 6 — Query Service Profiling (planned)

- [ ] **SQL-based exact profiling** — Use Keboola Query Service (`POST /api/v1/branches/{branchId}/workspaces/{workspaceId}/queries`) for full SQL-based profiling over all rows. Requires `KBC_BRANCHID` + `KBC_WORKSPACE_ID` env vars. Async job-based: submit → poll → get results.

### Phase 7 — Data Lineage (planned)

- [ ] **Data lineage graph** — Full upstream/downstream visualization via Keboola component config + flow APIs. New LineagePage with LR Dagre layout showing extractors, transformations, writers as distinct node types.

### Backlog

- [ ] Column cross-reference ("Also appears in: TABLE_A, TABLE_B")
- [ ] Data quality heatmap overlay on ERD (requires profiling data from Phase 4)
- [ ] Keyboard navigation in ERD (arrow keys to traverse tables)
- [ ] API documentation generation (Markdown/OpenAPI from schema)

> Detailed implementation plans for all phases are in the expanded PRD at `.claude/plans/recursive-tickling-starfish.md`.

---

## 11. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Initial load | < 3s for ERD with all nodes |
| Node rendering | Smooth pan/zoom at 52 nodes + 100+ edges |
| API response | < 500ms for table detail |
| Browser support | Chrome, Firefox, Safari (latest 2 versions) |
| Accessibility | WCAG 2.1 AA for table browser |
| Bundle size | < 500KB gzipped (excl. React Flow) |

---

## 12. Resolved Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Column descriptions | Show Keboola metadata; empty columns get grayed-out placeholder guiding users to add descriptions in Keboola Storage |
| 2 | Multi-FK edges (same target) | Separate labeled edges per FK column — no merging |
| 3 | Default theme | System preference (`prefers-color-scheme`), fallback to light |
| 4 | Phase 1 scope | All P0 + P1 in one phase (ERD, detail panel, table browser, search, theme) |
| 5 | Unknown table prefixes | `Other` category — slate color, own swim lane at bottom, FK inference still applies |
| 6 | Detail panel behavior | Floating overlay (560px) on top of ERD, not push layout |
| 7 | Local dev workflow | `npm run dev` with auto-detected mock data, or `.env` credentials for live Keboola |
| 8 | Node positions | Deterministic auto-layout (Dagre), not draggable |
| 9 | Description editing | Click-to-edit with confirmation dialog; writes to Keboola Storage API metadata endpoint (JSON format, `provider: 'user'`) |
| 10 | Keboola API format | JSON body (`Content-Type: application/json`); form-urlencoded is deprecated |
| 11 | Column metadata endpoint | Use table endpoint with `columnsMetadata` field, not separate per-column endpoint |
| 12 | Mock data for dev | Auto-detect missing credentials and serve 10 sample tables with edges and date links |

## 13. Open Questions

1. **Auth**: Default Keboola basic auth is currently used. OIDC integration deferred.
2. ~~**Data profiling API limits**: Keboola data preview returns max 1,000 rows. Sufficient for sampling or need full-scan approach?~~ **Resolved:** Hybrid approach — native profiling API for exact stats (all rows) + data preview for $NOVALUE/samples (1000 rows). Query service for Phase 6.
3. **Lineage API scope**: Start with transformation-only lineage or include extractors/writers from the start?

## 14. Resolved Phase 3 Decisions

| # | Question | Decision |
|---|----------|----------|
| 13 | ERD pan/zoom when sidebar open | Panning is fully blocked by backdrop div. Fix: remove `inset-0` backdrop, make panel float without overlay |
| 14 | ERD export formats | All three: PNG at 3x resolution, SVG vector, Mermaid ERD text |
| 15 | Mermaid export scope | Always full ERD (all tables + edges), regardless of filters or selection |
| 16 | Tag system design | Both predefined tags (verified, needs-review, deprecated, core, wip, sensitive) + free-form custom tags, stored as JSON array in Keboola metadata |

## 15. Resolved Phase 4 Decisions

| # | Question | Decision |
|---|----------|----------|
| 17 | Profiling data source | Hybrid: Keboola native profiling API (exact null/distinct/duplicate) + data-preview API (1000-row sample for $NOVALUE, min/max, top values) |
| 18 | Profiling trigger | Manual "Profile" button — not auto-fetch. On-demand per table. |
| 19 | Profile UI pattern | Expandable rows in ColumnTable with chevron toggle. ColumnProfileDrawer renders below each row. |
| 20 | CSV parsing | `csv-parse/sync` npm package for data-preview CSV parsing |
| 21 | Profile cache | Server-side ProfilingCache, 30-min TTL per table, request deduplication, 200ms rate limiting between API calls |
| 22 | Query service | Deferred to Phase 6. Requires KBC_BRANCHID + KBC_WORKSPACE_ID env vars (not confirmed auto-injected into Data Apps). |
