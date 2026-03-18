# Changelog

## Phase 10a-debug — Bucket Description Fix & Debug Endpoints (2026-03-17)
- **Fixed bucket descriptions on deployed app**: Deployed app was running pre-fallback code; latest code with 3-layer description extraction (field → metadata array → individual bucket detail fetch) resolves the issue
- **`GET /api/debug/env`**: Masked environment variable dump — sensitive values (tokens, secrets, keys) show only prefix, all others shown in full
- **`GET /api/debug/buckets`**: 3-way diagnostic comparing raw list endpoint, individual detail endpoint, and cached data with auto-generated diagnosis conclusion
- **Express 4 async fix**: All async debug handlers wrapped in top-level try/catch to prevent silent fallthrough to SPA catch-all
- **Root cause documented**: Keboola `GET /buckets` list endpoint omits `metadata[]` array; descriptions live in `KBC.description` metadata key, only available from `GET /buckets/{id}` detail endpoint

## Phase 10a — Automatic Project Documentation (2026-03-16)
- **Full Documentation tab**: Auto-generated project documentation from Keboola metadata — 6 sections: Data Sources, Data Model, Storage & Buckets, Orchestration, Transformations, Writers/Apps/Data Apps
- **Shared `MarkdownContent` component**: Extracted from ProjectOverviewPage into `src/lib/markdown-components.tsx` — used across all docs sections and overview for consistent markdown rendering (headings, tables, code, blockquotes, lists)
- **Data Sources section**: Extractor configs grouped by component, expanded by default, markdown descriptions, output table lists
- **Data Model section**: Renders `resources/data-model.md` via `/api/resource/:name` endpoint with `{{ENV_VAR}}` template replacement; placeholder message when empty
- **Storage & Buckets section**: ALL project buckets (not just BDM) — collapsible per bucket, grouped by Input/Output stage, table lists with column counts, bucket descriptions visible in collapsed header with `displayName` support
- **Orchestration section**: Flow cards with phase/task breakdown; task badges use shared `COMPONENT_TYPE_COLORS` (SQL=blue, PY=yellow, etc.)
- **Transformation section**: Grouped by folder prefix from naming convention (BDM sorted by layers, AUX, BI, TEST, UC, Other); 3-column I/O mapping grid (input tables → transformation box → output tables) with clickable table chips linking to storage bucket anchors
- **Writers/Apps section**: All card types expanded by default; Data Gateway with connection info table and per-row table list; Data Apps with repo/auth/deployment details; connection details as key/value table (host, schema, warehouse, auth, driver)
- **Consistent badge colors**: `COMPONENT_TYPE_COLORS` shared across LineageSection and all docs sections
- **Blue table names**: Input/output table names across all component configs displayed in blue monospace font
- **Sidebar TOC**: IntersectionObserver scroll-spy with transformation folder sub-items
- **Toolbar**: Expand All, Print, Markdown export, Refresh
- **New server endpoint**: `GET /api/resource/:name` serving markdown files from `resources/` directory with `{{ENV_VAR}}` template replacement
- **Static file serving**: `/data/in/files/*` serves Keboola-injected files (images); auto-detects absolute `/data/in/files` (production) vs relative `./data/in/files` (local dev)
- **Image support in markdown**: `rehype-sanitize` schema extended to allow relative `src` paths; styled `img` component in MarkdownContent
- **Debug endpoint**: `GET /api/debug/files` lists injected files across candidate paths + env var values (BDM_FILE_ID, DWH_FILE_ID)
- **All-buckets API**: `listBuckets()` + `listBucketTableIds()` exposed in metadata cache for full project coverage

## Phase 9 — Full Component Lineage (2026-03-13)
- **All component types in lineage**: Extractors (EXT, green), writers (WR, red), applications (APP, yellow) now tracked alongside transformations (SQL, PY, dbt, R)
- **3-strategy output inference**: (1) Explicit `storage.input/output.tables` mappings, (2) row `parameters.outputTable` (Oracle, NetSuite extractors), (3) bucket naming convention `in.c-{componentId}-{configId}`
- **New server functions**: `listAllComponentConfigs(bucketTableMap)`, `buildBucketTableMap()` in keboola-client.js
- **ComponentCategory type**: `extractor | transformation | writer | application` added to LineageEntry
- **Keboola URL routing**: Transformations → `/transformations-v2/`, all others → `/components/`
- **Tab rename**: "Table Browser" → "BDM Tables", "ERD Diagram" → "BDM Diagram"
- **Mock data updated**: Added EXT (Salesforce, Oracle) and APP (Data Quality Monitor) entries

## Phase 8b — Markdown Style Upgrade (2026-03-13)
- **Hybrid D+B style**: Style D body (rounded table containers, red code spans, indigo blockquote accents, invisible HR spacers) with Style B headings (large clean 32/24/19px) for dark-mode compatibility
- **Fixed: GFM tables now render**: Added `remark-gfm` plugin to ReactMarkdown (was installed but unused)
- **Added table sub-components**: `thead`, `tbody`, `tr` overrides for complete table styling control
- **Dark mode refinement**: Red code spans (oklch hue 15) with border for dual-theme visibility; table headers switched to `var(--muted)` for dark mode compatibility
- **Style research**: Evaluated 4 styles (GitHub, Notion, Technical, Dashboard Cards) — documented in `resources/phase-8/STYLE_RESEARCH.md`

## Phase 8 — Project Overview & Documentation Tabs (2026-03-13)
- **Project Overview tab** (new default landing page): Fetches branch metadata from Keboola API (`/v2/storage/branch/{BRANCH_ID}/metadata`), renders `KBC.projectDescription` as sanitized markdown
- **Project Documentation tab**: Placeholder page with "Coming soon" empty state
- **4-tab navigation**: Overview → BDM Tables → BDM Diagram → Documentation
- **New API endpoint**: `GET /api/project-overview` with mock mode support
- **New server method**: `getBranchMetadata(branchId)` in keboola-client.js
- **New env var**: `BRANCH_ID` (defaults to `default`, injected by Keboola platform)
- **New dependencies**: `react-markdown` + `rehype-sanitize` for secure markdown rendering
- **New hook**: `useProjectOverview()` following existing data-fetching patterns

## Phase 7.7 — Keboola URL Path Fix (2026-03-13)
- **Fixed transformation URL path**: Changed `/transformations/bucket/` to `/transformations-v2/` in `buildKeboolaUrl()` — URLs now correctly open transformation configs in the Keboola UI

## Phase 7.5/7.6 — Lineage Hotfixes & UI Polish (2026-03-13)
- **Fixed Keboola URL**: Added `verifyToken()` to fetch project ID at startup; URLs now include actual project ID instead of `_` placeholder
- **Color-coded type badges**: SQL (blue), PY (amber), dbt (red), others (gray) — replaces monochrome muted badges
- **Keboola octopus logo**: Transparent-background SVG icon replaces generic ExternalLink icon on hover
- **Section separators**: Thin border lines between Columns, Relationships, Lineage, and Data Preview in both panels
- **Consistent section spacing**: Unified `py-4` / `p-5` padding across Table Browser and ERD detail panels
- **Lineage header styling**: ERD panel uses `text-sm` (matching Columns/Relationships), Table Browser uses `text-xs` (matching its own headers)
- **PRD updated**: Phase 7 marked as done, added 7.5 (fixes) and 7.6 (polish) sections

## Phase 7 — Transformation Lineage (2026-03-13)
- Lineage section in table detail panels (Table Browser + ERD) showing transformations that produce or consume each table
- Server-side lineage index built from Keboola transformation configs: parses input/output storage mappings (root + row-based)
- Component type badges: `SQL` (Snowflake/BigQuery/Synapse/Redshift), `PY` (Python), `R`, `dbt`, `JL` (Julia), `OR` (OpenRefine)
- Run status icons: ✅ success (green), ❌ error (red), ⚠️ warning (yellow), — never run (muted)
- Clickable transformation names open Keboola UI in new tab
- Last change date + last run date timestamps with relative time display
- Empty state: "No transformations reference this table" for tables with no lineage
- Section order: Columns → Relationships → **Lineage** → Data Preview
- Refresh button added to Table Browser toolbar (was ERD-only) with "Xm ago" timestamp
- Lineage refreshed alongside metadata on manual refresh and 15-min auto-refresh cycle
- New server module: `lineage-cache.js` — `buildLineageIndex()`, `deriveComponentType()`, `buildKeboolaUrl()`
- New API methods: `listTransformationConfigs()`, `listRecentJobs()` in keboola-client.js
- Mock lineage data for local development (8 transformation entries across 6 tables)
- Extended `timeAgo()` to support days and months

## Phase 6b — ERD Navigation & Layout (2026-03-07)
- Zoom controls (+/−/fit) button group in bottom-right corner
- Fit View moved from toolbar to zoom control group
- Reference-based layout hierarchy: parent/referenced tables above, child/referencing tables below
- Removed category rank hints — Dagre determines hierarchy purely from FK graph structure
- Edge direction reversed so lines flow downward (parent.bottom → child.top)
- Condensed spacing: NODE_SEP 60→35px, RANK_SEP 100→60px
- Collapsible detail panel: `>` to collapse (keeps highlights), `<` to expand; thin bar shows category dot + vertical table name

## Phase 6a — UI Polish Hotfixes (2026-03-07)
- Boolean values display as uppercase TRUE/FALSE in data preview
- Fixed Type column alignment with `w-20` on header and body
- Sticky card header stays visible when scrolling expanded detail
- Removed inner column scroll — all columns render inline
- Compact single-line relationship rows

## Phase 6 — Table Browser UI Refinements (2026-03-07)
- Compact 2-row toolbar (~76px) replacing 5-row layout (~210px)
- Inline QA badge + issues badge with popover for full stats
- Condensed table cards (~52px) — name, description subtitle, column count
- Collapsible category group headers (▼ FACT TABLES, ▼ REFERENCE, etc.)
- Column descriptions as always-visible subtitles
- FK link annotations on _ID columns (clickable → target table)
- Sort reduced to Category, Name, Columns

## Phase 5 — Table Browser UI Updates (2026-03-07)
- Table Browser is now the landing page (ERD second tab)
- Inline expanded detail below table cards
- Human-friendly names via `toHumanName()` (strips prefixes, Title Case)
- Data preview with `$NOVALUE` highlighting and sticky header
- Clickable KPI stats (missing desc, empty tables) as filter buttons
- Streamlined 3-row toolbar

## Phase 4 — Data Profiling (2026-03-06)
- Hybrid profiling: native API (exact stats) + data preview (1000-row sample)
- `$NOVALUE` detection with color-coded `$NV: X%` badges
- Expandable column profile drawers (null rate, distinct count, min/max, top values)
- On-demand profiling with 30-min cache and request deduplication
- Mock profiling for local development
- Batched data preview for tables with >30 columns

## Phase 3 — UX Improvements (2026-03-06)
- Collaborative tags (predefined + custom) stored in Keboola metadata
- ERD export: PNG (3x), SVG (vector), Mermaid (.mmd)
- ERD pan/zoom works with sidebar open (removed backdrop overlay)

## Phase 2 — Feature Expansion (2026-03-06)
- Connection highlighting (dim unconnected, glow connected)
- Date link visualization (dashed purple to DIM_DATE, toggle off by default)
- QA stats dashboard (tables, columns, rows, QA score, issues)
- `$NOVALUE` convention tooltips on _ID columns
- Inline description editing with Keboola API write-back
- Search filter toggles (Both / Tables / Columns)
- Mock data server for credential-free local dev

## Phase 1 — Foundation (2026-03-06)
- React 18 + TypeScript + Vite 6 + Tailwind CSS v4
- Express.js backend with Keboola Storage API proxy
- FK inference engine (89 tests, 84 edges from 146 columns)
- Interactive ERD with Dagre layout, category coloring, minimap
- Table browser with search, category filters, sort
- Floating detail panel with columns, types, relationships
- Global search (Cmd+K) with fuzzy matching
- Dark/light theme with system preference default
- Keboola Data App deployment (nginx, supervisord, setup.sh)
