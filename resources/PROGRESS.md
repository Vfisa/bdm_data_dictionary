# BDM Data Dictionary — Progress Log

## Phase 1 — MVP (DONE)
- Project scaffolding, Keboola config, Express server
- FK inference engine with override support
- React Flow ERD with Dagre layout, category swim lanes
- Table browser with search/filter/sort
- Global search (Cmd+K), dark/light theme

## Phase 2 — Feature Expansion (DONE)
- Visual polish, connection highlighting, date link visualization
- ERD export (PNG/SVG/Mermaid)
- QA stats dashboard with KPI cards
- $NOVALUE handling, inline description editing
- Mock data server for local dev

## Phase 3 — UX Improvements (DONE)
- ERD pan/zoom with sidebar open (removed backdrop)
- Export dropdown (PNG 3x, SVG, Mermaid)
- Collaborative tags (predefined + custom, Keboola metadata storage)

## Phase 4 — Data Profiling (DONE)
- Hybrid profiling (native API + data-preview sampling)
- $NOVALUE profiling with color-coded badges
- Column-level stats drawers (null rate, distinct, min/max, top values)
- On-demand profiling with cache (30-min TTL)

## Phase 5 — Table Browser UI Updates (DONE)
- Table Browser as default landing page
- Inline expanded detail (description, stats, tags, preview, columns, relationships)
- Streamlined 3-row toolbar
- Human-friendly names (toHumanName)
- On-demand data preview with real row data
- Clickable KPI stats filter

## Phase 6 — Table Browser UI Refinements (IN PROGRESS)
**Status**: Requirements finalized, mockups approved, ready for implementation.

### Design Decisions
- Compact 2-row toolbar (~76px, down from ~210px)
- KPI cards → inline badges + hover popover
- Category chips: short codes (FCT 3, REF 42)
- Collapsed cards: name + desc subtitle + "N columns" (no rows/size/tech name)
- Collapsible category group headers (▼/►)
- Expanded detail reordered: Columns → Relationships → Data Preview
- Column descriptions as 2-line subtitle rows ("No description" faint italic)
- FK columns show clickable → target table links
- Sort options: Category, Name, Columns only

### Sub-tasks
- [ ] 6.1 Compact toolbar (2 rows, KPI popover)
- [ ] 6.2 Condensed table cards (~52px)
- [ ] 6.3 Category group headers (collapsible)
- [ ] 6.4 Expanded detail vertical layout (columns → relationships → preview)
- [ ] 6.5 Column description subtitles
- [ ] 6.6 FK link annotations in column list
- [ ] 6.7 Sort controls update
