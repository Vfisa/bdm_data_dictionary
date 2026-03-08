# Changelog

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
