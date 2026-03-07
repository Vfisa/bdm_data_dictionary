# BDM Data Dictionary — Development Lessons Learned

Accumulated learnings from errors, debugging, and design decisions during development.

---

## 1. Missing @types/node for Vite Config (Step 1)

**Problem:** `vite.config.ts` failed TypeScript compilation with "Cannot find module 'path'" and "Cannot find name '__dirname'".

**Root cause:** Vite config runs in Node.js context but `@types/node` wasn't installed.

**Fix:** Install `@types/node` as devDependency + add `"types": ["node"]` to `tsconfig.node.json`.

**Lesson:** When using Node.js APIs in config files (vite.config.ts, etc.), always include `@types/node` in devDependencies from the start. Vite's own types don't cover Node.js globals.

---

## 2. Port Collision During Testing (Step 3)

**Problem:** Tests failed with "EADDRINUSE: port 3000 already in use" because a previous server process was still running.

**Fix:** Kill leftover processes, use unique/random ports for integration tests.

**Lesson:** Always use dynamic or unique ports for test servers. Never hardcode the same port as the dev server. Consider `port: 0` to let the OS assign a free port.

---

## 3. FK Search Order Ambiguity (Step 5) — Critical Design Error

**Problem:** 3 tests failed because `INVOICE_ID` resolved to `FCT_INVOICE` instead of `REF_INVOICE`. The single `TABLE_PREFIXES` array was used for both category detection AND FK resolution, but these have different priority needs.

**Root cause:** Category detection needs `FCTH_` before `FCT_` (prefix overlap — `FCTH_` must be checked first or it gets miscategorized as `FCT_`). But FK resolution should prefer `REF_` tables over `FCT_` tables (dimension/reference tables are the canonical targets for foreign keys).

**Fix:** Created two separate ordering arrays:
```javascript
const TABLE_PREFIXES = ['FCTH_', 'FCT_', 'DIM_', 'REF_', 'MAP_', 'AUX_']; // category detection
const FK_SEARCH_ORDER = ['REF_', 'DIM_', 'FCTH_', 'FCT_', 'MAP_', 'AUX_']; // FK resolution
```

**Lesson:** When a single ordering serves two different purposes with conflicting requirements, separate them immediately. Don't try to find a "compromise" order — it will fail for edge cases. Name the arrays explicitly to document their purpose.

---

## 4. Zsh Shell Incompatibility (Step 6)

**Problem:** Multi-line bash commands with variable assignments (`SERVER_PID=$!`), `&&` chains, and `echo` with special characters failed when executed in zsh (macOS default shell).

**Root cause:** zsh handles certain bash idioms differently — word splitting, variable expansion, and command chaining have subtle differences.

**Fix:** Run commands individually via separate tool calls instead of chaining them. Keep shell commands simple and atomic.

**Lesson:** Never assume bash when writing shell commands for tools. Keep commands simple — one operation per call. Use separate tool calls for independent operations rather than complex chains.

---

## 5. HTML Attribute Name Conflict in React (Step 7)

**Problem:** `interface TooltipProps extends HTMLAttributes<HTMLDivElement>` caused a TypeScript error because the native HTML `content` attribute has type `string`, conflicting with our custom `content: ReactNode` prop.

**Root cause:** HTML's `<meta>` element defines a `content` attribute, and React's `HTMLAttributes` type includes all standard HTML attributes. When extending it with a custom `content` prop of a different type, TypeScript raises a conflict.

**Fix:** Use `Omit<HTMLAttributes<HTMLDivElement>, 'content'>` to exclude the conflicting property before adding the custom one.

**Lesson:** When extending React's `HTMLAttributes` with custom props, always check for name collisions with standard HTML attributes. Common conflicts: `content`, `title`, `label`, `data`, `value`, `name`, `type`, `size`, `color`, `width`, `height`. Use `Omit<>` to resolve.

---

## 6. Unused Variables in Strict TypeScript (Step 8)

**Problem:** Build failed with 7 `TS6133` errors for unused imports and variables — `useRef`, `CATEGORY_CONFIG`, `stats`, `config`, `RANK_SPACING`, `selectedTable`, `handleCloseDetail`.

**Root cause:** Wrote code with forward references (variables intended for future steps) and leftover imports from copy-paste, while TypeScript strict mode flags any unused declaration.

**Fix:** Removed unused imports/variables. For variables needed by future steps (like `selectedTable`), prefix with underscore (`_selectedTable`) to signal intentional non-use.

**Lesson:**
- Don't write "placeholder" code for future features — add it when the feature is actually built
- When removing an import, also check if any variable in the file depended on that import
- Use `_` prefix convention for intentionally unused destructured variables
- Build after every file creation, not just at the end of the step

---

## 7. Dagre Type Definitions (Step 8)

**Observation:** `@types/dagre` was already included in devDependencies from Step 1 scaffolding. Without it, TypeScript would have flagged `dagre.graphlib.Graph` as untyped.

**Lesson:** When adding graph/layout libraries, always check if community type definitions exist and include them upfront. For dagre specifically, `@types/dagre` provides the Graph, layout, and node/edge types.

---

## 8. React Flow Provider Pattern (Step 8)

**Observation:** `useReactFlow()` hook (for `fitView()`) must be called inside a `<ReactFlowProvider>`. This means the component using the hook cannot be the same component that renders `<ReactFlowProvider>`.

**Solution:** Split into two components:
- `ErdCanvas` (outer) — renders `<ReactFlowProvider>` wrapper
- `ErdCanvasInner` (inner) — uses `useReactFlow()` hook and renders `<ReactFlow>`

**Lesson:** When using React Flow, always plan for the Provider/Consumer split. The component that needs `useReactFlow()` must be a child of `ReactFlowProvider`, not the same component.

---

## 9. React Flow CSS Variable Theming (Step 8)

**Observation:** React Flow v12 uses CSS custom properties prefixed with `--xy-` for theming. This makes it easy to integrate with existing CSS variable-based theme systems.

**Key variables used:**
```css
.react-flow {
  --xy-background-color: var(--background);
  --xy-edge-stroke: var(--muted-foreground);
  --xy-minimap-background-color: var(--card);
  --xy-controls-button-background-color: var(--card);
}
```

**Lesson:** React Flow's `--xy-*` CSS variables map cleanly to shadcn/ui's CSS variable system. Define them once in global CSS and both dark/light themes work automatically.

---

## 10. Edge Label Visibility UX (Step 8)

**Design decision:** With 84 edges, showing all labels at once would create visual clutter. Labels are hidden by default and shown on hover/select via CSS transitions.

```css
.react-flow__edge .react-flow__edge-textwrapper { opacity: 0; transition: opacity 0.15s ease; }
.react-flow__edge:hover .react-flow__edge-textwrapper { opacity: 1; }
```

**Lesson:** For dense ERD diagrams (50+ edges), always default edge labels to hidden. Show on interaction. This dramatically improves readability without losing information.

---

## 11. Lucide-React Icons Don't Accept HTML Attributes Directly (Step 9)

**Problem:** `<Key className="..." title="Primary Key" />` fails TypeScript with "Property 'title' does not exist on type".

**Root cause:** Lucide-react icons are SVG components that only accept `LucideProps` (className, size, color, strokeWidth, etc.), not arbitrary HTML attributes like `title`.

**Fix:** Wrap the icon in a native HTML element: `<span title="Primary Key"><Key className="..." /></span>`.

**Lesson:** Lucide-react SVG icons don't support `title`, `aria-label`, or other HTML attributes directly. Always wrap in a `<span>` or `<div>` if you need tooltip text or accessibility attributes on icons.

---

## 12. Array Indexing Returns `T | undefined` in Strict TypeScript (Step 11)

**Problem:** `payload.split('.')[0]` has type `string | undefined` in strict mode, but was passed to a function expecting `string`.

**Root cause:** With `noUncheckedIndexedAccess` or strict array types, accessing an array element by index returns `T | undefined` because the index might be out of bounds.

**Fix:** Add a nullish coalescing fallback: `payload.split('.')[0] ?? payload`.

**Lesson:** Always provide a fallback when accessing array elements by index in TypeScript strict mode. Use `array[0] ?? fallback` or check with `if (array[0] !== undefined)`.

---

## 13. cmdk Bundle Size Impact (Step 11)

**Observation:** Adding cmdk (command palette) pulled in `@radix-ui/react-dialog` as a transitive dependency, adding ~53 KB to the JS bundle (from 476 KB to 530 KB).

**Lesson:** cmdk is lightweight itself but its dialog mode depends on Radix Dialog. For apps already near size limits, consider using cmdk without the Dialog wrapper and implementing a custom modal. For this project, the trade-off is acceptable since cmdk provides excellent fuzzy search via command-score.

---

## 14. Keboola Metadata API: Form-Urlencoded Is Deprecated (Phase 4)

**Problem:** Description updates via `PUT /api/descriptions` silently failed against the Keboola Storage API. The server returned no clear error, but descriptions weren't persisting.

**Root cause:** Our `updateTableDescription()` and `updateColumnDescription()` methods used `Content-Type: application/x-www-form-urlencoded` with `URLSearchParams`:
```javascript
// BROKEN — deprecated format
body: new URLSearchParams({
  'provider': 'user',
  'metadata[0][key]': 'KBC.description',
  'metadata[0][value]': description,
})
```

Keboola's Storage API has moved to JSON for all endpoints. Form-urlencoded is formally deprecated.

**Fix:** Switch to `Content-Type: application/json` with a proper JSON body:
```javascript
// CORRECT — JSON format
body: JSON.stringify({
  provider: 'user',
  metadata: [{ key: 'KBC.description', value: description }],
})
```

**Lesson:** Always check the Keboola changelog and docs for API format changes. The form-urlencoded PHP-style array notation (`metadata[0][key]`) was the old format. JSON is now the standard for all Storage API endpoints. When integrating with any API, verify Content-Type requirements against current documentation, not old examples.

---

## 15. Column Metadata: Use Table Endpoint with `columnsMetadata` (Phase 4)

**Problem:** Column description updates used a per-column endpoint: `POST /v2/storage/tables/{tableId}/column/{columnName}/metadata`. This endpoint format was unreliable.

**Fix:** Use the **table metadata endpoint** for both table and column metadata, passing column-level data via the `columnsMetadata` field:
```javascript
// Table description
POST /v2/storage/tables/{tableId}/metadata
{ provider: 'user', metadata: [{ key: 'KBC.description', value: '...' }] }

// Column description — same endpoint, different field
POST /v2/storage/tables/{tableId}/metadata
{ provider: 'user', columnsMetadata: { COLUMN_NAME: [{ key: 'KBC.description', value: '...' }] } }
```

**Lesson:** When an API offers both granular endpoints (per-column) and batch endpoints (per-table with column data), prefer the batch endpoint. It's more likely to be maintained and documented, and reduces the number of API calls.

---

## 16. Mock Data Server for Local Development (Dev Infrastructure)

**Problem:** Developing and testing the app locally required valid Keboola credentials. Without `KBC_TOKEN` and `KBC_URL`, the app showed loading errors.

**Solution:** Created `server/mock-data.js` with `generateMockMetadata()` that produces 10 sample tables, 9 FK edges, and 4 date edges. The server auto-detects missing credentials and serves mock data:
```javascript
const USE_MOCK = !KBC_TOKEN || !KBC_URL;
if (USE_MOCK) mockData = generateMockMetadata();
```

Mock mode also supports in-memory description editing (saves to the mock data object, persists until server restart).

**Lesson:** Always provide a local development mode that works without external service credentials. Auto-detect missing credentials and fall back gracefully. This makes onboarding new developers trivial: `git clone && npm install && npm run dev` just works.

---

## 17. Optimistic Cache Updates for API Write-Back (Phase 4)

**Problem:** After updating a description via the Keboola API, the UI needed to reflect the change immediately. A full cache refresh (re-fetching all metadata from Keboola) is slow (3-8 seconds) and unnecessary for a single field change.

**Solution:** Two-layer update strategy:
1. **Push to API:** `cache.updateDescription()` calls Keboola API first
2. **Optimistic in-memory update:** On success, mutate the cached object directly:
   ```javascript
   const table = this._data.tables.find(t => t.id === tableId);
   if (table) table.description = description;
   ```
3. **Lightweight re-fetch:** Frontend calls `refetch()` (just `GET /api/metadata` from server cache) instead of `refresh()` (full Keboola API re-fetch)

**Lesson:** For write-back operations on cached data, always update the cache optimistically after a successful API call. Provide separate `refetch()` (read from cache) and `refresh()` (reload from source) methods. The frontend should call the lightweight one after edits, reserving full refresh for toolbar/manual triggers.

---

## 18. Backdrop Overlay Blocks Canvas Interaction (Phase 6 / PRD Phase 3)

**Problem:** The `TableDetailPanel` was wrapped in a full-screen `absolute inset-0 z-20` div that served as a backdrop/click-away area. This completely blocked all pan, zoom, and click interactions on the underlying ERD canvas.

**Root cause:** The backdrop div covered the entire viewport at z-index 20, intercepting all pointer events before they could reach the React Flow canvas underneath.

**Fix:** Removed the backdrop wrapper entirely. Made the panel itself the root element with `absolute top-0 right-0 h-full w-[560px] z-20`. The ERD canvas remains fully interactive while the panel is open.

**Lesson:** Avoid full-screen invisible overlays for side panels. They silently block underlying interactions. If click-away-to-close is needed, use React Flow's `onPaneClick` callback instead of a DOM overlay. Only use backdrop overlays for truly modal dialogs that should block all background interaction.

---

## 19. Mermaid ERD Generation — Entity Name Sanitization (Phase 6 / PRD Phase 3)

**Observation:** Mermaid's `erDiagram` syntax doesn't support all characters in entity names. Table names with special characters need to be quoted or sanitized.

**Approach:** Since BDM table names use only `A-Z`, `0-9`, and `_`, no sanitization was needed. The generator produces clean output like:
```
erDiagram
    FCT_ORDER }o--|| REF_CLIENT : "CLIENT_ID"
    FCT_ORDER }o--|| REF_PRODUCT : "PRODUCT_ID"
```

**Lesson:** When generating code for external tools (Mermaid, GraphViz, SQL), always consider the target tool's syntax constraints. For BDM naming conventions (`PREFIX_ENTITY`), Mermaid works out of the box, but other projects may need entity name escaping.

---

## 20. Tag Storage in Keboola Metadata (Phase 6 / PRD Phase 3)

**Design decision:** Tags are stored as a JSON-serialized array under a custom metadata key (`bdm.tags`) with `provider: 'user'`:
```javascript
{ provider: 'user', metadata: [{ key: 'bdm.tags', value: '["verified","core"]' }] }
```

**Why this approach:**
- Keboola metadata API supports arbitrary key-value pairs — no schema changes needed
- JSON serialization handles arrays in a single metadata entry (vs. one entry per tag)
- `provider: 'user'` ensures tags don't conflict with Keboola system metadata
- Custom key prefix (`bdm.`) namespaces our metadata away from `KBC.` system keys

**Lesson:** When extending a platform's metadata model, use a namespaced key prefix and JSON serialization for complex values. This avoids polluting the platform's built-in metadata namespace and keeps the storage model simple (one key = one concept).

---

## 21. Export Dropdown — Click-Outside Handling (Phase 6 / PRD Phase 3)

**Observation:** The export dropdown needed click-outside-to-close behavior. Implemented via `useEffect` with `mousedown` event listener and `ref.current.contains(e.target)` check.

**Pattern:**
```typescript
useEffect(() => {
  if (!open) return
  function handleClick(e: MouseEvent) {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
  }
  document.addEventListener('mousedown', handleClick)
  return () => document.removeEventListener('mousedown', handleClick)
}, [open])
```

**Lesson:** For simple dropdowns, a `mousedown` listener with `contains()` check is sufficient. Use `mousedown` (not `click`) to close before the click event propagates. Only add the listener when the dropdown is open to avoid unnecessary event processing.

---

## 22. Hybrid Profiling: Native API + Data Preview (Phase 4 — Data Profiling)

**Design decision:** Column profiling uses two Keboola APIs in tandem:
1. **Native profiling** (`POST /v2/storage/tables/{tableId}/profile` + `GET .../profile/latest`) — exact null count, distinct count, duplicate count over all rows
2. **Data preview** (`GET /v2/storage/tables/{tableId}/data-preview?limit=1000`) — CSV sample for $NOVALUE rates, min/max, top values

**Why hybrid:**
- Native profiling is async (trigger → poll) and doesn't expose value-level stats ($NOVALUE, top values, min/max)
- Data preview is synchronous but limited to 1000 rows (sample, not exact)
- Combining both gives exact structural stats + value-level insights at acceptable latency

**Lesson:** When a platform API provides multiple data access methods with different trade-offs, combine them rather than choosing one. Document which stats come from which source (exact vs. approximate) in the UI so users understand confidence levels.

---

## 23. CSV Parsing from Keboola Data Preview (Phase 4)

**Problem:** The data-preview endpoint returns raw CSV text (not JSON). Needed server-side parsing.

**Solution:** Used `csv-parse/sync` for synchronous parsing. The sync variant is appropriate here because:
- The CSV is bounded (max 1000 rows)
- Parsing happens inside an already-async profiling pipeline
- Simpler error handling than the streaming API

**Lesson:** For bounded, small CSV payloads (< 10K rows), synchronous CSV parsing is simpler and performant enough. Reserve streaming parsers for unbounded or large datasets.

---

## 24. Request Deduplication in Profiling Cache (Phase 4)

**Problem:** Multiple rapid clicks on the "Profile" button could trigger duplicate API calls for the same table.

**Solution:** `ProfilingCache` stores pending promises in a `_pendingRequests` Map. If a request for the same table is already in-flight, subsequent callers await the existing promise instead of making a new API call.

```javascript
if (this._pendingRequests.has(tableId)) {
  return this._pendingRequests.get(tableId);
}
const promise = this._fetchAndCompute(tableId, columns);
this._pendingRequests.set(tableId, promise);
```

**Lesson:** Any server-side cache that fetches from slow external APIs should deduplicate concurrent requests for the same key. Store the promise (not the result) to coalesce waiting callers.

---

## 25. Type-Aware Min/Max in Column Profiling (Phase 4)

**Problem:** Min/max values from a CSV sample are strings. Comparing `"9"` > `"10"` lexicographically gives wrong results for numeric columns.

**Solution:** Type-dispatch based on `keboolaBaseType`:
- `INTEGER`, `NUMERIC`, `FLOAT` → `parseFloat()` comparison, return as numbers
- `DATE`, `TIMESTAMP` → `new Date()` comparison, return as ISO strings
- Everything else → lexicographic string comparison

**Lesson:** When computing aggregate stats from string-typed CSV data, always parse values according to the column's declared type before comparison. A type-aware comparator prevents subtle ordering bugs.

---

## 26. Expandable Table Rows with colSpan Pattern (Phase 4)

**Problem:** Needed expandable drawer rows in the column table — clicking a chevron reveals stats below that column.

**Solution:** Each `<tr>` uses a single `<td colSpan={3}>` containing both the main row (as a `<div>` with flex layout) and the conditional drawer:
```jsx
<td colSpan={3} className="p-0">
  <div className="flex items-start">  {/* main row */}
  {isExpanded && <ColumnProfileDrawer />}  {/* drawer */}
</td>
```

**Lesson:** For expandable table rows, `colSpan` on a single cell is simpler than inserting/removing extra `<tr>` elements. The flex-based inner layout replaces the multi-cell structure while maintaining visual alignment.

---

## 27. Keboola Sync Export 30-Column Limit (Phase 4 Bugfix)

**Problem:** `GET /v2/storage/tables/{tableId}/data-preview` returns `400 Bad Request` for tables with >30 columns: `"Max 30 columns can be exported by synchronous export, 57 columns requested. Please use async export."`

**Root cause:** Keboola's synchronous data-preview endpoint has a hard limit of 30 columns. FCT_ORDER has 57. The error was caught silently, leaving `previewRows = null` and `sampleSize: 0`.

**Fix:** Batch column requests using the `columns` query parameter. Split column names into chunks of 30, make sequential requests, parse each CSV batch, merge row-by-row via `Object.assign`, then re-serialize as unified CSV.

**Lesson:** Always check API limits for parameterized endpoints. When a "preview" or "export" endpoint has column/row limits, implement batching with column selection parameters rather than switching to async exports (which add polling complexity). Sequential batching also naturally respects rate limits.

---

## 28. Empty Object `{}` Is Truthy — Keboola Profile Edge Case (Phase 4 Bugfix)

**Problem:** `getLatestProfile()` returned `{}` (empty object) when no native profile existed for a table. Our code checked `if (!nativeProfile)` — but `!{}` is `false`, so the empty object was treated as a valid profile with 0 columns.

**Root cause:** The Keboola `/profile/latest` endpoint returns `{}` instead of `404` when no profile has been computed yet. JavaScript's `!{}` evaluates to `false`.

**Fix:** After parsing JSON, check for actual content: `if (!data || !data.columns || data.columns.length === 0) return null;`

**Lesson:** Never trust that an API returns `404` for "not found" — some return `200` with empty objects. Always validate the response body for expected structure before using it. In JavaScript, empty objects/arrays are truthy — use property checks instead of truthiness.

---

## General Principles Discovered

1. **Build early, build often** — Run `npm run build` after every file creation, not just at step completion. Catches errors when context is fresh.

2. **Separate concerns early** — When one data structure serves multiple purposes (FK search vs category detection), split it immediately. Don't optimize for DRY at the cost of correctness.

3. **Don't write placeholder code** — Variables, imports, or functions for "future steps" create noise and TypeScript errors. Add them when the feature is built.

4. **Test with real data shapes** — Mock data should match the actual Keboola API response structure. Use MCP tools to verify expected data shapes before writing normalization code.

5. **Shell simplicity** — Keep shell commands atomic. The tool environment may not be bash. Avoid multi-line chains, variable assignments, and process management in single commands.

6. **Always verify API Content-Type** — Don't assume an API accepts a particular format. Check current docs, changelogs, and migration guides. APIs evolve — what worked a year ago may be deprecated now.

7. **Provide credential-free dev mode** — External service dependencies should never block local development. Auto-detect missing credentials and serve mock data for a zero-config onboarding experience.
