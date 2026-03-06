# BDM Data Dictionary & ERD Viewer

Interactive Entity Relationship Diagram, data dictionary, and quality dashboard for the Business Data Model (BDM), built as a [Keboola Data App](https://help.keboola.com/components/data-apps/).

## Features

### ERD Visualization
- **Interactive ERD Diagram** — Pan, zoom, and explore tables with auto-layout via Dagre. Category-colored nodes with filter toggles and minimap.
- **Floating Detail Panel** — Click a table node to open the detail sidebar without blocking the ERD canvas. Pan, zoom, and click other nodes while the panel is open.
- **Connection Highlighting** — Click a table node to dim unconnected nodes and glow connected ones with drop-shadow effect.
- **Date Link Visualization** — Toggle (off by default) shows assumed DIM_DATE connections from DATE/TIMESTAMP columns as dashed purple lines.
- **Multi-Format Export** — Download ERD as PNG (3x resolution), SVG (vector), or Mermaid `.mmd` file via dropdown menu.

### Table Browser & Data Quality
- **Table Browser** — Full-page searchable listing with category filters, tag filters, and sort (by category, name, rows, columns, size).
- **Collaborative Tags** — Predefined tags (verified, needs-review, deprecated, core, wip, sensitive) + custom free-form tags. Stored as JSON in Keboola metadata (`bdm.tags` key). Tag chips on table cards, tag editor in detail panel, filter-by-tag in browser toolbar.
- **QA Stats Dashboard** — KPI cards showing total tables, columns, rows, QA score (% with descriptions), missing descriptions count, and empty tables. QA score is color-coded: green >80%, yellow 50-80%, red <50%.
- **$NOVALUE Convention** — Info tooltips on `_ID` columns documenting the BDM sentinel value for missing FK references.

### Search & Navigation
- **Global Search (Cmd+K)** — Fuzzy search across all tables and columns with filter toggles (Both / Tables Only / Columns Only).
- **Table Detail Panel** — Click any table to see columns, data types, primary keys, nullable flags, descriptions, row counts, data size, and last import time. Navigate between related tables.

### Inline Editing
- **Edit Descriptions** — Click-to-edit table and column descriptions with confirmation dialog. Changes propagate to Keboola Storage API via metadata endpoint and update the in-memory cache optimistically.

### General
- **Dark / Light Theme** — System preference default with manual toggle. Persists via localStorage.
- **Dynamic FK Inference** — No static manifest needed. Relationships discovered at runtime by scanning `_ID` columns and matching to target tables. New tables auto-discovered on refresh.
- **Auto-Refresh** — Metadata refreshed every 15 minutes. Manual refresh via toolbar button.
- **Mock Data Mode** — Auto-detected when Keboola credentials are missing. Serves 10 sample tables for local development.

## Architecture

```
Browser (port 8888)
  +-- nginx reverse proxy
        +-- Express.js (port 3000)
              +-- React SPA (dist/)            <- Vite build output
              +-- GET  /api/metadata           <- All tables + edges + dateEdges + categories
              +-- GET  /api/table/:tableId     <- Single table with relationships
              +-- PUT  /api/descriptions       <- Update table/column descriptions -> Keboola API
              +-- PUT  /api/tags               <- Update table tags -> Keboola metadata (bdm.tags)
              +-- POST /api/refresh            <- Trigger cache refresh
              +-- GET  /api/health             <- Health check
```

**Backend:** Node.js/Express server that fetches metadata from the Keboola Storage API, runs FK inference, caches results in memory, and serves the React SPA. Supports mock data fallback when credentials are absent.

**Frontend:** React 18 + TypeScript + Tailwind CSS 4 + @xyflow/react (React Flow) for the ERD + cmdk for the command palette + html-to-image for PNG export.

## Keboola Data App Configuration

### Required Environment Variables

These are **automatically injected by Keboola** when deploying as a Data App.

| Variable | Required | Description |
|----------|----------|-------------|
| `KBC_TOKEN` | **Yes** | Keboola Storage API token. Must have read access to the target bucket(s). Needs **write** permissions for inline description editing. |
| `KBC_URL` | **Yes** | Keboola connection URL (e.g., `https://connection.eu-central-1.keboola.com`). |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BUCKET_ID` | `out.c-bdm` | Primary bucket containing the BDM tables. The app also fetches from `{BUCKET_ID}_aux` automatically. |
| `PORT` | `3000` | Express server port. |

### Token Permissions

The `KBC_TOKEN` needs:
- **Read access** to `out.c-bdm` and `out.c-bdm_aux` (or your custom bucket IDs)
- **Write access** to table/column metadata (for inline description editing)

If the token is read-only, the app works fully except description editing will fail with an error message.

### Keboola Deployment Files

| File | Purpose |
|------|---------|
| `keboola-config/setup.sh` | Build script — runs `npm install && npm run build` |
| `keboola-config/nginx/sites/default.conf` | Nginx reverse proxy — listens on 8888, proxies to 3000 |
| `keboola-config/supervisord/services/app.conf` | Process manager — starts and auto-restarts Express |

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Quick Start (No Credentials Needed)

```bash
git clone <repo-url>
cd bdm-data-dictionary
npm install
npm run dev
# -> http://localhost:5173 (mock data mode — 10 sample tables)
```

When `KBC_TOKEN` and `KBC_URL` are not set, the app auto-detects this and serves mock data. All features work including description editing (changes persist in-memory until server restart).

### With Keboola Credentials

```bash
cp .env.example .env
# Edit .env with your credentials:
#   KBC_TOKEN=your-storage-api-token
#   KBC_URL=https://connection.eu-central-1.keboola.com
#   BUCKET_ID=out.c-bdm

npm run dev
# -> http://localhost:5173 (live Keboola data)
```

### Production Build

```bash
npm run build    # TypeScript check + Vite production build
npm start        # Express serves built SPA + API on :3000
```

## Data Model

The app visualizes tables from the BDM, organized by category:

| Category | Prefix | Color | Description |
|----------|--------|-------|-------------|
| Reference | `REF_` | Cyan | Reference/master data (e.g., REF_CLIENT, REF_CARRIER) |
| Dimension | `DIM_` | Blue | Conformed dimensions (e.g., DIM_DATE) |
| Fact | `FCT_` | Green | Transactional fact tables (e.g., FCT_ORDER, FCT_DISPATCH) |
| Fact (Historical) | `FCTH_` | Dark Green | SCD2-style historical facts |
| Mapping | `MAP_` | Orange | Event/bridge mapping tables |
| Auxiliary | `AUX_` | Gray | Junction/bridge tables |
| Other | -- | Slate | Tables with unrecognized prefixes |

## FK Inference Engine

Relationships are discovered automatically at runtime:

1. For each column ending in `_ID`, extract the entity name
2. Check the **skip list** (e.g., `EXTERNAL_SYSTEM_ID`)
3. Check **alias overrides** (e.g., `USER_ID` maps to `REF_OPERATOR`)
4. Skip self-referencing own-PK columns
5. **Direct entity match**: `CLIENT_ID` -> `REF_CLIENT` or `DIM_CLIENT`
6. **Progressive prefix strip**: `ORIGIN_LOCATION_ID` -> strip `ORIGIN_` -> `REF_LOCATION`
7. Validate: target table must exist and contain the expected PK column

### Customizing Overrides

Edit `server/overrides.json`:

```json
{
  "alias": { "COLUMN_NAME": { "target": "TARGET_TABLE", "targetColumn": "TARGET_PK" } },
  "skip": ["COLUMN_TO_IGNORE"],
  "add": [],
  "remove": []
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check with cache status |
| `GET` | `/api/metadata` | Full payload: tables, edges, dateEdges, categories, stats |
| `GET` | `/api/table/:tableId` | Single table with columns + relationships |
| `PUT` | `/api/descriptions` | Update table/column descriptions -> Keboola Storage API |
| `PUT` | `/api/tags` | Update table tags -> Keboola metadata (`bdm.tags` key) |
| `POST` | `/api/refresh` | Trigger server-side metadata refresh |
| `GET/POST` | `/` | React SPA (POST supported for Keboola liveness checks) |

### Description Update Format

```bash
curl -X PUT /api/descriptions \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": [
      { "itemId": "out.c-bdm.FCT_ORDER", "description": "New table description" },
      { "itemId": "out.c-bdm.FCT_ORDER.CLIENT_ID", "description": "New column description" }
    ]
  }'
```

The `itemId` format determines the target:
- 3 dot-separated parts (e.g., `out.c-bdm.TABLE`) -> table description
- 4 dot-separated parts (e.g., `out.c-bdm.TABLE.COLUMN`) -> column description

### Tag Update Format

```bash
curl -X PUT /api/tags \
  -H 'Content-Type: application/json' \
  -d '{ "tableId": "out.c-bdm.FCT_ORDER", "tags": ["verified", "core", "custom-tag"] }'
```

Tags are stored in Keboola metadata under the `bdm.tags` key as a JSON array.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS 4 |
| ERD Rendering | @xyflow/react (React Flow) v12.4 + Dagre (auto-layout) |
| Command Palette | cmdk |
| Image Export | html-to-image |
| Icons | lucide-react |
| UI Primitives | shadcn/ui-style components (custom, CSS-variable based) |
| Backend | Node.js, Express.js |
| API | Keboola Storage API v2 (JSON format) |
| Build | Vite 6 |
| Deployment | Keboola JS Data App (nginx + supervisord) |

## Project Structure

```
bdm-data-dictionary/
+-- server/
|   +-- index.js                     # Express server + API routes + mock data fallback
|   +-- keboola-client.js            # Keboola Storage API wrapper (read + write)
|   +-- metadata-cache.js            # In-memory cache with auto-refresh
|   +-- inference.js                 # FK inference engine
|   +-- mock-data.js                 # Mock data generator for local development
|   +-- overrides.json               # FK alias/skip/add/remove rules
+-- src/
|   +-- App.tsx                      # Root component, routing, search, description callbacks
|   +-- main.tsx                     # Entry point
|   +-- index.css                    # Tailwind + theme tokens + React Flow overrides
|   +-- components/
|   |   +-- erd/                     # ERD diagram components
|   |   |   +-- ErdCanvas.tsx        # React Flow canvas, selection, zoom/fit/export
|   |   |   +-- ErdToolbar.tsx       # Category filters, date links, refresh, export dropdown
|   |   |   +-- TableNode.tsx        # Custom node rendering
|   |   |   +-- useErdLayout.ts      # Dagre layout + highlight logic
|   |   +-- table-detail/            # Table detail panel
|   |   |   +-- TableDetailPanel.tsx # Floating sidebar with inline editing + tags
|   |   |   +-- ColumnTable.tsx      # Column grid with types + inline editing
|   |   |   +-- RelationshipList.tsx # FK relationships grouped by direction
|   |   |   +-- TypeBadge.tsx        # Type-specific color badges
|   |   +-- table-browser/           # Table browser page
|   |   |   +-- CategoryFilter.tsx   # Toggle chips with counts
|   |   |   +-- SortControls.tsx     # Sort field + direction
|   |   |   +-- TableList.tsx        # Table rows with category badges + tag chips
|   |   |   +-- StatsDashboard.tsx   # QA stats KPI cards
|   |   +-- tags/                    # Tag system
|   |   |   +-- TagEditor.tsx        # Add/remove tags + predefined suggestions + TagChips
|   |   +-- search/                  # Global search
|   |   |   +-- CommandPalette.tsx   # Cmd+K modal with filter toggles
|   |   |   +-- useSearch.ts         # Search index
|   |   +-- layout/                  # App shell
|   |   |   +-- Header.tsx           # Nav tabs, search, theme
|   |   |   +-- Layout.tsx           # Page wrapper
|   |   |   +-- ErrorBoundary.tsx    # React error boundary
|   |   +-- ui/                      # Shared UI primitives
|   |       +-- button.tsx, badge.tsx, input.tsx, tooltip.tsx
|   |       +-- InlineEditor.tsx     # Click-to-edit text component
|   |       +-- ConfirmDialog.tsx    # Confirmation modal
|   +-- hooks/
|   |   +-- useMetadata.ts           # Fetch + refresh + refetch metadata
|   |   +-- useTheme.ts              # Dark/light theme
|   |   +-- useDescriptionEditor.ts  # Edit state + API submission
|   |   +-- useTags.ts               # Tag update API hook
|   +-- lib/
|   |   +-- types.ts                 # TypeScript interfaces + tag types
|   |   +-- constants.ts             # Category colors, sort priority, tag config
|   |   +-- utils.ts                 # cn(), formatNumber(), timeAgo()
|   |   +-- qa-stats.ts              # QA metrics computation
|   |   +-- mermaid.ts               # Mermaid erDiagram text generation
|   +-- pages/
|       +-- ErdPage.tsx              # ERD + detail panel
|       +-- TableBrowserPage.tsx     # Search + filter + sort + stats
+-- keboola-config/                  # Keboola deployment
|   +-- setup.sh, nginx/, supervisord/
+-- dist/                            # Build output (git-ignored)
+-- .env.example
+-- package.json
+-- vite.config.ts
+-- tsconfig.json
+-- PRD.md                           # Original product requirements
+-- PROGRESS.md                      # Development progress log
+-- LESSONS.md                       # Development lessons learned
```
