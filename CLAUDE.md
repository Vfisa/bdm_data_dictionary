# CLAUDE.md — Project Instructions for AI Assistants

## Quick Reference

```bash
npm run dev          # Vite dev server (HMR) + Express backend via proxy
npm run build        # Production build (Vite)
npx tsc -b           # Type-check — ALWAYS run before claiming code works
node server/index.js # Start Express (serves built SPA + API on :3000)
```

- **Dev URL**: http://localhost:5173 (Vite proxy → Express :3000)
- **Prod URL**: :8888 (nginx → Express :3000)
- **Preview tools**: launch.json configured — use `preview_start` with name `"dev"`

## Project

BDM Data Dictionary & ERD Viewer — a React-based Keboola Data App for the Horizon Air Freight business data model. Bucket: `out.c-bdm` (60 tables, ~3.2 GB).

- **PRD**: `PRD.md` — living document, keep updated with all decisions
- **Progress**: `PROGRESS.md` — step-by-step dev log
- **Lessons**: `LESSONS.md` — root-cause error analysis (28 entries)
- **Changelog**: `CHANGELOG.md` — what shipped per phase

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React 18 + TypeScript | Strict mode, no state management library |
| Build | Vite 6 | `@tailwindcss/vite` plugin (no tailwind.config) |
| Styling | Tailwind CSS v4 | oklch custom properties, `bg-[var(--token)]` pattern |
| ERD | @xyflow/react + Dagre | Deterministic layout, nodes not draggable |
| UI | Hand-rolled shadcn/ui-style | Badge, Button, Input, Tooltip in `src/components/ui/` |
| Backend | Express.js | SPA serving + Keboola Storage API proxy |
| Search | cmdk | Cmd+K command palette with fuzzy search |
| Icons | lucide-react | Wrap in `<span>` for title/aria attributes |
| Markdown | react-markdown + remark-gfm + rehype-sanitize | Shared `MarkdownContent` component for all markdown rendering |
| Deploy | Keboola JS Data App | nginx + supervisord + setup.sh |

## Architecture

```
Browser → nginx (:8888) → Express (:3000)
                              ├── Serve SPA (dist/)
                              ├── GET  /api/metadata         ← tables + edges + categories
                              ├── GET  /api/project-overview ← branch metadata (project description)
                              ├── GET  /api/table/:id        ← single table detail
                              ├── PUT  /api/descriptions     ← edit descriptions → Keboola API
                              ├── PUT  /api/tags             ← edit tags → Keboola metadata
                              ├── GET  /api/profile/:id      ← on-demand column profiling
                              ├── GET  /api/preview/:id      ← data preview (CSV parsed)
                              ├── GET  /api/resource/:name   ← markdown files from resources/
                              ├── POST /api/refresh          ← trigger cache refresh
                              └── GET  /api/health
```

- **MetadataCache**: In-memory, built at startup, 15-min auto-refresh, includes lineage index
- **ProfilingCache**: Per-table 30-min TTL, request deduplication
- **FK Inference Engine**: Runtime discovery from `_ID` columns + `overrides.json`
- **Lineage Index**: Built from ALL component configs (extractors, transformations, writers, apps) + recent job statuses
- **Mock mode**: Auto-detected when KBC_TOKEN/KBC_URL missing

## Key File Map

### Pages
- `src/pages/ProjectOverviewPage.tsx` — default landing page, renders branch metadata markdown
- `src/pages/TableBrowserPage.tsx` — table list with filter/sort/group state
- `src/pages/ErdPage.tsx` — ERD diagram with floating detail panel
- `src/pages/ProjectDocumentationPage.tsx` — auto-generated project documentation (sources, model, storage, orchestration, transformations, writers/apps)

### Components
- `src/components/table-browser/` — StatsDashboard, CategoryFilter, SortControls, TableList, TableExpandedDetail, DataPreviewTable
- `src/components/table-detail/` — ColumnTable, ColumnProfileDrawer, RelationshipList, LineageSection, TypeBadge, NoValueBadge
- `src/components/erd/` — ErdCanvas, ErdToolbar, TableNode, useErdLayout
- `src/components/docs/` — DocSourcesSection, DocDataModelSection, DocStorageSection, DocOrchestrationSection, DocTransformSection, DocTransformCard, DocWritersAppsSection, DocTableOfContents, DocToolbar, useDocSections, doc-export
- `src/components/search/` — CommandPalette, useSearch
- `src/components/tags/` — TagEditor
- `src/components/ui/` — Badge, Button, Input, Tooltip, InlineEditor, ConfirmDialog
- `src/components/layout/` — Header, Layout, ErrorBoundary

### Lib
- `src/lib/constants.ts` — CATEGORY_CONFIG, CATEGORY_ORDER, TAG_CONFIG, COMPONENT_TYPE_COLORS, TRANSFORM_FOLDER_ORDER
- `src/lib/human-name.ts` — `toHumanName()` strips BDM prefixes
- `src/lib/qa-stats.ts` — `computeQAStats()`
- `src/lib/types.ts` — all TypeScript interfaces
- `src/lib/markdown-components.tsx` — shared `MarkdownContent` + `markdownComponents` for ReactMarkdown
- `src/lib/mermaid.ts` — Mermaid ERD generation
- `src/index.css` — CSS variables (oklch) + React Flow overrides

### Server
- `server/index.js` — Express routes, mock mode detection
- `server/keboola-client.js` — Keboola Storage API wrapper (includes `listAllComponentConfigs`, `buildBucketTableMap`, `listRecentJobs`)
- `server/inference.js` — FK relationship inference engine
- `server/metadata-cache.js` — In-memory cache with TTL, lineage integration
- `server/lineage-cache.js` — Lineage index builder (producedBy/usedBy maps from all component types: extractors, transformations, writers, apps)
- `server/profiling-cache.js` — Profiling cache with deduplication
- `server/mock-data.js` — Mock data for local dev (includes lineage mock)
- `server/overrides.json` — Manual FK corrections (12 aliases, 2 skips)

## Code Conventions

### Do This
- Use `toHumanName()` for all display labels (strips BDM prefixes, Title Case)
- Use CSS custom properties via `bg-[var(--token)]` for theme colors
- Build FK target maps as `Map<string, string>` passed as props
- Run `npx tsc -b` before committing (stricter than Vite dev)
- Use `Omit<HTMLAttributes<...>, 'conflicting-prop'>` for React component interfaces
- Wrap lucide-react icons in `<span>` for title/aria attributes
- Use `csv-parse/sync` for bounded CSV payloads (< 10K rows)
- Deduplicate concurrent API requests by storing promises

### Don't Do This
- Don't add state management libraries (useState/useMemo/useCallback only)
- Don't use inner scroll containers in detail panels (page-level scroll)
- Don't write placeholder code for future features
- Don't use form-urlencoded with Keboola API (use JSON)
- Don't trust empty objects as "not found" (`{}` is truthy in JS)
- Don't merge FK edges pointing to the same table (separate labeled edges)
- Don't use `find` or `grep` CLI tools (use Glob/Grep dedicated tools)

## User Preferences

- Iterative design discussion with ASCII mockups before coding
- PRD kept up to date with all decisions
- Docs committed before implementation starts
- Code tested and committed after each section
- When developing new features: finish the feature definition/plan, implement, test (`npx tsc -b` + verify in browser), and commit before moving to the next step. Never leave uncommitted work when switching tasks.
- Business-user friendly labels ("45 columns" not "45")
- Description as subtitle, not inline

## Phase Status

- Phases 1-6 + 6a hotfixes + 6b ERD nav/layout: **DONE**
- Phase 7: Transformation Lineage: **DONE**
- Phase 8: Project Overview & Documentation Tabs: **DONE**
- Phase 9: Full Component Lineage (extractors, writers, apps): **DONE**
- Phase 10a: Automatic Project Documentation: **DONE**
- Phase 10b: SQL-based Query Service profiling (planned)

## Keboola API Notes

- Use `Content-Type: application/json` (form-urlencoded is deprecated)
- Column metadata: use table endpoint with `columnsMetadata` field
- Data preview: 30-column sync limit — batch with `columns` param
- Profile endpoint returns `{}` (not 404) when no profile exists
- Token `#` prefix stripped automatically by server
- Tags stored as JSON array in metadata key `bdm.tags` (provider: `user`)
