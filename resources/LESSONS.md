# BDM Data Dictionary — Lessons & Patterns

## Architecture Patterns

### State Management
- No external state library needed for this scale (60 tables)
- All state in `TableBrowserPage.tsx` via useState/useMemo/useCallback
- Filtering chain: Category → Tag → StatsFilter → Search, then sort
- `useMemo` for filtered/sorted table list (recomputes only when inputs change)

### CSS & Theming
- Tailwind v4 with CSS custom properties in oklch color space
- All colors via `bg-[var(--token)]` — enables dark/light toggle with class swap
- `.dark` class on `<html>` element, persisted to localStorage
- React Flow nodes styled via CSS variable mapping (`--xy-*` → app tokens)

### API Design
- Single `/api/metadata` endpoint for full payload (tables + columns + edges)
- On-demand endpoints for heavy data: `/api/preview/:id`, `/api/profile/:id`
- Server-side caching with TTL + manual refresh
- Token never exposed to browser — Express proxies all Keboola API calls

### FK Inference
- Pure function: `inferRelationships(tables, overrides) → edges`
- Handles: direct match, compound names, prefix stripping, PK validation
- `overrides.json` for edge cases (add/remove/alias rules)
- Self-healing: new tables auto-discovered on refresh

## UI/UX Lessons

### Information Density
- Phase 5 cards at ~140px were too tall — 2.5 visible on screen
- Toolbar at ~210px consumed too much viewport before content started
- Phase 6 target: ~52px cards, ~76px toolbar → 13 tables visible (5x improvement)
- Key insight: separate "browsing" content (name, category, column count) from "inspection" content (rows, size, preview, columns)

### Description Placement
- Inline with other metadata = cluttered, hard to scan
- Subtitle under name = clean hierarchy, natural reading flow
- Same pattern works for both table descriptions and column descriptions

### Progressive Disclosure
- Collapsed card: just enough to identify and choose a table
- Expanded detail: full schema, relationships, data preview
- On-demand loading: data preview + profiling only when requested
- KPI stats: condensed to badges, full stats in popover on demand

### Category Grouping
- Visual separators (headers) > per-card badges for scanning long lists
- Collapsible groups let users focus on what matters
- Short codes (FCT, REF) save horizontal space while remaining recognizable

## Phase 7 Lessons — Transformation Lineage

### Separate Detail Panel Components
- The ERD floating panel (`TableDetailPanel.tsx`) and the Table Browser expanded detail (`TableExpandedDetail.tsx`) are **separate components** — not shared. New sections like Lineage must be added to **both** independently.
- Pattern: always check all consumers when adding a new detail section.

### Keboola Transformation Config Parsing
- Transformation configs use row-based storage mappings (`config.rows[].configuration.storage`) in addition to root-level mappings (`config.configuration.storage`). Both must be parsed to capture all input/output table references.
- Component IDs are long strings (e.g., `keboola.snowflake-transformation`) — derive short display labels from substrings for UI badges.

### Lineage as Non-Fatal Enhancement
- Lineage index build is wrapped in try/catch in `MetadataCache._loadData()` — if it fails (e.g., API permission issue), the app still loads with empty lineage. This prevents lineage issues from breaking the core metadata experience.

### Unused Import Detection
- TypeScript strict mode catches unused imports (`TS6133`). When moving an icon (e.g., `GitBranch`) from one component to another during refactoring, remember to remove the import from the original file. Run `npx tsc -b` to catch this.

### Vite Dev Server + Express Backend
- `npm run dev` starts only the Vite dev server — the Express backend must be started separately (`node server/index.js`) for API calls to work. The Vite config proxies `/api` to `localhost:3000`, so both must be running.
- Symptom: `ECONNREFUSED` on API calls during local dev means Express isn't running.

### timeAgo Utility Extension
- The original `timeAgo()` only handled seconds, minutes, hours. Lineage dates can be days or months old. Extended to support `Xd ago` and `Xmo ago` for longer intervals.

## Technical Debt / Watch Items
- Column profile drawers expand within scrollable column table — can feel nested
- `toHumanName()` strips known prefixes only — unknown prefixes pass through as-is
- Mock data server auto-detects missing credentials — be careful not to accidentally run in mock mode with stale .env
- Keboola metadata writes use `provider: 'user'` — distinct from system metadata
- ERD `TableDetailPanel` and Table Browser `TableExpandedDetail` are separate — features must be added to both
