# BDM Data Dictionary & ERD Viewer

Interactive Entity Relationship Diagram and data dictionary for the Horizon Air Freight Business Data Model, built as a [Keboola Data App](https://help.keboola.com/components/data-apps/).

## Features

- **Interactive ERD Diagram** — Pan, zoom, and explore all 58 tables with auto-layout via Dagre. Edges represent inferred FK relationships (84 total). Category-colored nodes with filter toggles and minimap.
- **Table Detail Panel** — Click any table to see columns, data types, primary keys, nullable flags, descriptions, row counts, data size, and last import time. Navigate between related tables.
- **Table Browser** — Full-page searchable listing with category filters and sort (by name, rows, columns, size). Search matches both table names and column names.
- **Global Search (Cmd+K)** — Fuzzy search across all tables and columns. Select a result to jump to its detail view.
- **Dark / Light Theme** — System preference default with manual toggle. Persists via localStorage.
- **Dynamic FK Inference** — No static manifest needed. Relationships are discovered at runtime by scanning `_ID` columns and matching them to target tables. New tables are picked up automatically on refresh.
- **Auto-Refresh** — Metadata is refreshed every 15 minutes from the Keboola Storage API. Manual refresh available via toolbar button.

## Architecture

```
Browser (port 8888)
  └── nginx reverse proxy
        └── Express.js (port 3000)
              ├── React SPA (dist/)         ← Vite build output
              ├── GET  /api/metadata        ← All tables + edges + categories
              ├── GET  /api/table/:tableId  ← Single table with relationships
              ├── POST /api/refresh         ← Trigger cache refresh
              └── GET  /api/health          ← Health check
```

**Backend:** Node.js/Express server that fetches metadata from the Keboola Storage API, runs FK inference, caches results in memory, and serves the React SPA.

**Frontend:** React 18 + TypeScript + Tailwind CSS 4 + @xyflow/react (React Flow) for the ERD + cmdk for the command palette.

## Keboola Data App Configuration

### Required Environment Variables

These are **automatically injected by Keboola** when deploying as a Data App. You do not need to set them manually in Keboola.

| Variable | Required | Description |
|----------|----------|-------------|
| `KBC_TOKEN` | **Yes** | Keboola Storage API token. Injected by Keboola at runtime. Must have read access to the target bucket(s). |
| `KBC_URL` | **Yes** | Keboola connection URL (e.g., `https://connection.eu-central-1.keboola.com`). Injected by Keboola at runtime. |

### Optional Environment Variables

These can be set as Data App parameters in Keboola if you need to customize the default behavior.

| Variable | Default | Description |
|----------|---------|-------------|
| `BUCKET_ID` | `out.c-bdm` | Primary bucket containing the BDM tables. The app also fetches from `{BUCKET_ID}_aux` automatically for auxiliary/bridge tables. |
| `PORT` | `3000` | Express server port. Normally no need to change — nginx proxies 8888 to 3000. |

### Keboola Deployment Files

The `keboola-config/` directory contains the three files required by Keboola JS Data Apps:

| File | Purpose |
|------|---------|
| `keboola-config/setup.sh` | Build script — runs `npm install && npm run build` during container setup |
| `keboola-config/nginx/sites/default.conf` | Nginx reverse proxy — listens on port 8888, proxies to localhost:3000 |
| `keboola-config/supervisord/services/app.conf` | Process manager — starts and auto-restarts `node /app/server/index.js` |

### Token Permissions

The `KBC_TOKEN` must have **read access** to:

- `out.c-bdm` — Primary BDM bucket (or whatever `BUCKET_ID` is set to)
- `out.c-bdm_aux` — Auxiliary bridge tables bucket

The token only needs **read** permissions. The app does not write any data to Keboola Storage.

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone and install
git clone <repo-url>
cd bdm-data-dictionary
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Keboola credentials:
#   KBC_TOKEN=your-storage-api-token
#   KBC_URL=https://connection.eu-central-1.keboola.com
#   BUCKET_ID=out.c-bdm
```

### Run

```bash
# Build the React frontend
npm run build

# Start the server
npm start
# → http://localhost:3000
```

For frontend development with hot reload:

```bash
# Terminal 1: Start the Express API server
npm start

# Terminal 2: Start Vite dev server (proxies /api to Express)
npm run dev
# → http://localhost:5173
```

### Without Credentials

The app starts gracefully without `KBC_TOKEN`/`KBC_URL`:

- Health endpoint works: `GET /api/health`
- SPA loads (shows loading/error state)
- API endpoints return 503 with a descriptive message

## Data Model

The app visualizes tables from the BDM (Business Data Model), organized by category:

| Category | Prefix | Color | Description |
|----------|--------|-------|-------------|
| Dimension | `DIM_` | Blue | Conformed dimensions (e.g., DIM_DATE) |
| Fact | `FCT_` | Green | Transactional fact tables (e.g., FCT_ORDER, FCT_DISPATCH) |
| Fact (Historical) | `FCTH_` | Dark Green | SCD2-style historical facts (e.g., FCTH_CURRENCY_CONVERSION_RATE) |
| Mapping | `MAP_` | Orange | Event/bridge mapping tables (e.g., MAP_ORDER_EVENT) |
| Reference | `REF_` | Cyan | Reference/master data (e.g., REF_CLIENT, REF_CARRIER) |
| Auxiliary | `AUX_` | Gray | Junction/bridge tables (e.g., AUX_BOX_TO_DISPATCH) |
| Other | — | Slate | Tables with unrecognized prefixes |

## FK Inference Engine

Relationships are discovered automatically at runtime. The algorithm:

1. For each column ending in `_ID`, extract the entity name
2. Check the **skip list** (e.g., `EXTERNAL_SYSTEM_ID` — not a real FK)
3. Check **alias overrides** (e.g., `USER_ID` maps to `REF_OPERATOR`, not `REF_USER`)
4. Skip self-referencing own-PK columns
5. **Direct entity match**: `CLIENT_ID` → `REF_CLIENT` or `DIM_CLIENT`
6. **Progressive prefix strip**: `ORIGIN_LOCATION_ID` → strip `ORIGIN_` → `LOCATION_ID` → `REF_LOCATION`
7. Validate: target table must exist and contain the expected PK column

### Customizing Overrides

Edit `server/overrides.json` to adjust FK resolution:

```json
{
  "alias": {
    "COLUMN_NAME": { "target": "TARGET_TABLE", "targetColumn": "TARGET_PK" }
  },
  "skip": ["COLUMN_TO_IGNORE"],
  "add": [],
  "remove": []
}
```

- **alias** — Remap a column to a specific target table (highest priority)
- **skip** — Ignore columns that look like FKs but aren't
- **add** — Manually add edges the algorithm can't discover
- **remove** — Suppress false positive edges

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check — always works, returns cache status |
| `GET` | `/api/metadata` | Full payload: tables, edges, categories, stats |
| `GET` | `/api/table/:tableId` | Single table with columns + outgoing/incoming edges |
| `POST` | `/api/refresh` | Trigger server-side metadata refresh |
| `GET/POST` | `/` | React SPA (POST supported for Keboola liveness checks) |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS 4 |
| ERD Rendering | @xyflow/react (React Flow) + Dagre (auto-layout) |
| Command Palette | cmdk |
| Icons | lucide-react |
| UI Primitives | shadcn/ui-style components (custom, CSS-variable based) |
| Backend | Node.js, Express.js |
| API | Keboola Storage API v2 |
| Build | Vite 6 |
| Deployment | Keboola JS Data App (nginx + supervisord) |

## Project Structure

```
bdm-data-dictionary/
├── server/                          # Node.js backend
│   ├── index.js                     # Express server + API routes
│   ├── keboola-client.js            # Keboola Storage API wrapper
│   ├── metadata-cache.js            # In-memory cache with auto-refresh
│   ├── inference.js                 # FK inference engine
│   └── overrides.json               # FK alias/skip/add/remove rules
├── src/                             # React frontend
│   ├── App.tsx                      # Root component, routing, search
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Tailwind + theme tokens + React Flow overrides
│   ├── components/
│   │   ├── erd/                     # ERD diagram components
│   │   │   ├── ErdCanvas.tsx        # React Flow canvas + provider
│   │   │   ├── ErdToolbar.tsx       # Category filters, refresh, fit-view
│   │   │   ├── TableNode.tsx        # Custom node rendering
│   │   │   └── useErdLayout.ts      # Dagre layout hook
│   │   ├── table-detail/            # Table detail panel
│   │   │   ├── TableDetailPanel.tsx # Slide-in overlay
│   │   │   ├── ColumnTable.tsx      # Column grid with types
│   │   │   ├── RelationshipList.tsx # Outgoing/incoming edges
│   │   │   └── TypeBadge.tsx        # Type-specific badges
│   │   ├── table-browser/           # Table browser page
│   │   │   ├── CategoryFilter.tsx   # Toggle chips
│   │   │   ├── SortControls.tsx     # Sort by field
│   │   │   └── TableList.tsx        # Card-style rows
│   │   ├── search/                  # Global search
│   │   │   ├── CommandPalette.tsx   # cmdk dialog
│   │   │   └── useSearch.ts         # Search index
│   │   ├── layout/                  # App shell
│   │   │   ├── Header.tsx           # Nav tabs, search, theme
│   │   │   ├── Layout.tsx           # Page wrapper
│   │   │   └── ErrorBoundary.tsx    # React error boundary
│   │   └── ui/                      # Shared UI primitives
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       └── tooltip.tsx
│   ├── hooks/
│   │   ├── useMetadata.ts           # Fetch + refresh metadata
│   │   └── useTheme.ts              # Dark/light theme
│   ├── lib/
│   │   ├── types.ts                 # TypeScript interfaces
│   │   ├── constants.ts             # Category colors + config
│   │   └── utils.ts                 # cn(), formatNumber(), timeAgo()
│   └── pages/
│       ├── ErdPage.tsx              # ERD + detail panel
│       └── TableBrowserPage.tsx     # Search + filter + sort
├── keboola-config/                  # Keboola deployment
│   ├── setup.sh                     # Build script
│   ├── nginx/sites/default.conf     # Reverse proxy
│   └── supervisord/services/app.conf
├── dist/                            # Build output (git-ignored)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── PROGRESS.md                      # Development progress log
└── LESSONS.md                       # Development lessons learned
```
