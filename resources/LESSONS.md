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

## Technical Debt / Watch Items
- Column profile drawers expand within scrollable column table — can feel nested
- `toHumanName()` strips known prefixes only — unknown prefixes pass through as-is
- Mock data server auto-detects missing credentials — be careful not to accidentally run in mock mode with stale .env
- Keboola metadata writes use `provider: 'user'` — distinct from system metadata
