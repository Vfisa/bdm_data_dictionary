# Phase 6: Table Browser UI/UX Refinements

## Current State Analysis

### What Works Well
- Clean card-based layout with category color coding
- KPI stats dashboard gives quick project overview
- Category pill filters are intuitive
- Human-friendly names with technical name as subtitle
- Inline expansion keeps context (no page navigation)

### Key Issues Identified

#### 1. TOOLBAR TAKES ~45% OF VIEWPORT
The 3-row toolbar (KPI stats + search/categories/sort + tags/count) consumes
roughly 420px of vertical space. On a typical 900px viewport, that leaves only
~480px for actual table content. The user sees at most 2-3 table cards before
needing to scroll.

```
Current layout (1200×900 viewport):
┌─────────────────────────────────────────────────┐
│ Header                                    56px  │
├─────────────────────────────────────────────────┤
│ KPI Stats row (7 cards)                  ~80px  │
│ Search + Categories + Sort               ~90px  │  ~420px
│ (categories wrap to 2 lines)                    │  toolbar
│ Tags + results count                     ~40px  │  area
├─────────────────────────────────────────────────┤
│ Table cards (ONLY ~480px visible)               │
│ ┌───────────────────────────────────────┐       │
│ │ Card 1                          ~140px│       │
│ ├───────────────────────────────────────┤       │
│ │ Card 2                          ~140px│       │
│ ├───────────────────────────────────────┤       │
│ │ Card 3 (partially visible)            │       │
│ └───────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

#### 2. TABLE CARDS ARE TOO TALL / LOW DENSITY
Each card is ~140px tall showing: name, technical name, description, stats.
With 60 tables, users scroll extensively. The "No description" placeholder
on most cards wastes space without adding value.

#### 3. EXPANDED DETAIL IS TOO LONG
When expanded, a table's detail (description + stats + data preview + columns
+ relationships) can be 2000+ px tall. Users lose context of the table list
and must scroll extensively within a single card.

#### 4. KPI STATS COMPETE FOR ATTENTION
7 KPI cards in a horizontal row — the last 2 are cut off on most screens.
The stats that matter most (QA issues) are the ones hidden off-screen.

#### 5. CATEGORY PILLS WRAP AWKWARDLY
With 6-7 categories, the pills wrap to 2 lines, eating vertical space.
Combined with the search input and sort controls all on the same row,
it feels cramped yet space-inefficient.

#### 6. NO VISUAL HIERARCHY IN TABLE LIST
All cards look the same — same height, same weight. There's no way to
quickly distinguish between a critical 6M-row fact table and a 50-row
reference lookup.

---

## Proposed Redesign — Option A: "Compact List with Slide-Out Panel"

The core idea: **separate browsing from detail viewing**. Keep the table list
compact for scanning, and use a slide-out panel (like the ERD page already
has) for detail inspection.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Data Dictionary    [Table Browser] [ERD Diagram]   [⌘K Search] [☽] │
├──────────────────────────────────────────────────────────────────────┤
│ [🔍 Search tables...]  [FCT·3] [REF·42] [DIM·1] [MAP·6] [AUX·7]   │
│ Sort: Category ↑ | Name | Rows | Cols     Showing 60 tables  [⚠ 27] │
├──────────────────────────────────────────────────────────────────────┤
│                                          │                           │
│  TABLE LIST (compact rows)               │  DETAIL PANEL (slide-out) │
│                                          │                           │
│  ┌─ FCT ─────────────────────────────┐   │  ┌─────────────────────┐  │
│  │ ▸ Dispatch     45 col  428K rows  │   │  │ FCT_DISPATCH        │  │
│  │ ▸ Financial    34 col  5.9M rows  │◀──│  │ "Dispatch"          │  │
│  │ ▸ Order        38 col  511K rows  │   │  │                     │  │
│  │ ▸ Invoice      22 col  1.2M rows  │   │  │ Description:        │  │
│  ├─ FCTH ────────────────────────────┤   │  │ [editable]          │  │
│  │ ▸ Currency..   12 col  89K  rows  │   │  │                     │  │
│  ├─ REF ─────────────────────────────┤   │  │ Stats: 45 cols      │  │
│  │ ▸ Carrier      18 col  2.1K rows  │   │  │ 428.8K rows, 42 MB  │  │
│  │ ▸ Client       25 col  15K  rows  │   │  │ Updated 26h ago     │  │
│  │ ▸ Country       8 col  250  rows  │   │  │                     │  │
│  │ ▸ Currency     10 col  180  rows  │   │  │ Tags: [+ tag]       │  │
│  │ ▸ Department   12 col  45   rows  │   │  │                     │  │
│  │ ▸ Location     15 col  8.2K rows  │   │  │ ── COLUMNS ──────── │  │
│  │ ▸ ...                             │   │  │ DISPATCH_ID    STR   │  │
│  ├─ MAP ─────────────────────────────┤   │  │ DISPATCH_CODE  STR   │  │
│  │ ▸ Dispatch..    8 col  512K rows  │   │  │ STATUS_ID      STR → │  │
│  │ ...                               │   │  │ TYPE_ID        STR → │  │
│  ├─ AUX ─────────────────────────────┤   │  │ ...                 │  │
│  │ ▸ Box Dispatch  6 col  890K rows  │   │  │                     │  │
│  │ ▸ ...                             │   │  │ ── PREVIEW ──────── │  │
│  └───────────────────────────────────┘   │  │ [Load Preview]      │  │
│                                          │  │                     │  │
│                                          │  │ ── RELATIONSHIPS ── │  │
│                                          │  │ → REF_STATUS        │  │
│                                          │  │ → REF_TYPE          │  │
│                                          │  │ ← MAP_DISPATCH_EVT  │  │
│                                          │  └─────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Changes:
1. **Compact toolbar** — 2 rows max: search + category chips on row 1, sort + count on row 2
2. **KPI stats moved** — collapsed into a small summary bar or toggleable popover
3. **Compact table rows** — ~36-40px per row instead of ~140px cards
4. **Category group headers** — visual separators replace per-card badges
5. **Slide-out detail panel** — reuses the existing `TableDetailPanel` pattern from ERD
6. **Table list stays visible** — you can see the full list while inspecting detail

---

## Proposed Redesign — Option B: "Condensed Cards with Collapsible Toolbar"

Keep the card-based layout but make everything more compact and the toolbar
collapsible.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Data Dictionary    [Table Browser] [ERD Diagram]   [⌘K Search] [☽] │
├──────────────────────────────────────────────────────────────────────┤
│ [🔍 Search...]  [FCT·3][REF·42][DIM·1][FCTH·1][MAP·6][AUX·7]      │
│ ↕ Category ↑  Name  Rows  Cols  Size    │  60 tables  │ ⚠ 27 issues │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌ FCT ──────────────────────────────────────────────────────────┐   │
│  │ ▾ Dispatch        No desc    ⊞45  ◫428.8K  ◪42.7MB          │   │
│  │   ┌──────────────────────────────────────────────────────┐   │   │
│  │   │ Description: [click to add]          Tags: [+ tag]   │   │   │
│  │   │                                                      │   │   │
│  │   │ ── Columns (45) ───────── [Profile]                  │   │   │
│  │   │ DISPATCH_ID         STRING  ◎                        │   │   │
│  │   │ DISPATCH_CODE       STRING  ◎                        │   │   │
│  │   │ ...                                                  │   │   │
│  │   │                                                      │   │   │
│  │   │ ── Preview ──── [Load] ── Relationships ─── (3) ──  │   │   │
│  │   └──────────────────────────────────────────────────────┘   │   │
│  │   Financial        No desc    ⊞34  ◫5.9M   ◪481.7MB         │   │
│  │   Order            Tracks...  ⊞38  ◫511.5K ◪36.7MB          │   │
│  │   Invoice          No desc    ⊞22  ◫1.2M   ◪98.2MB          │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌ REF (42) ─────────────────────────────────────────────────────┐   │
│  │   Carrier          Reference  ⊞18  ◫2.1K   ◪1.2MB           │   │
│  │   Client           Master...  ⊞25  ◫15.2K  ◪8.9MB           │   │
│  │   Country          Reference  ⊞8   ◫250    ◪45KB            │   │
│  │   ...                                                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌ MAP (6) ──────────────────────────────────────────────────────┐   │
│  │   ...                                                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Changes:
1. **Compact 2-row toolbar** — same as Option A
2. **Category groups** with collapsible headers (click to expand/collapse entire group)
3. **Single-line table rows** — ~40px, showing name + truncated desc + key stats inline
4. **Inline expansion** still works but is more compact
5. **KPI summary** in toolbar as badges rather than cards

---

## Proposed Redesign — Option C: "Table View / Spreadsheet Style"

For power users who want maximum density — a literal table/spreadsheet view.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Data Dictionary    [Table Browser] [ERD Diagram]   [⌘K Search] [☽] │
├──────────────────────────────────────────────────────────────────────┤
│ [🔍 Search...]  [FCT][REF][DIM][FCTH][MAP][AUX]  60 tables ⚠27     │
├─────┬────────────────────┬──────┬────────┬──────┬───────┬───────────┤
│ Cat │ Table              │ Cols │ Rows   │ Size │ Desc  │ Tags      │
├─────┼────────────────────┼──────┼────────┼──────┼───────┼───────────┤
│ FCT │ Dispatch           │  45  │ 428.8K │ 42MB │  —    │           │
│ FCT │ Financial          │  34  │  5.9M  │481MB │  —    │           │
│ FCT │ Order              │  38  │ 511.5K │ 37MB │  ✓    │ verified  │
│ FCT │ Invoice            │  22  │  1.2M  │ 98MB │  —    │           │
│FCTH │ Currency Conv Rate │  12  │  89.2K │  5MB │  ✓    │           │
│ REF │ Carrier            │  18  │  2.1K  │  1MB │  ✓    │ verified  │
│ REF │ Client             │  25  │  15.2K │  9MB │  —    │           │
│ REF │ Country            │   8  │    250 │ 45KB │  ✓    │           │
│ ... │ ...                │  ... │  ...   │  ... │  ...  │  ...      │
├─────┴────────────────────┴──────┴────────┴──────┴───────┴───────────┤
│ Click any row to open detail panel →                                │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Changes:
1. **Maximum density** — 25-30px per row, all 60 tables visible without scrolling
2. **Sortable columns** — click column header to sort
3. **Row click** opens slide-out detail panel (like Option A)
4. **Single-row toolbar**
5. Best for users who know what they're looking for

---

## Recommendation: Hybrid of A + B

I recommend combining the best aspects:

| Feature | Approach |
|---------|----------|
| **Toolbar** | Compact 2-row max. KPIs as small inline badges, not full cards |
| **Table list** | Compact rows (~40px) grouped by category with collapsible headers |
| **Detail view** | Slide-out right panel (reuse existing `TableDetailPanel`) |
| **Category filters** | Inline chips in toolbar (already exists, just compress) |
| **KPI stats** | Move to a collapsible summary strip or popover |
| **View toggle** | Optional: let user switch between "cards" and "compact" view |

### Vertical Space Budget (target):

```
Header:           56px
Toolbar:         ~80px  (down from ~210px)
Category groups: visible table content starts at ~140px from top
                 (currently ~420px from top)

Result: 3x more table rows visible on initial load
```

---

## Specific Refinements (Regardless of Layout Choice)

### Must-Have
1. **Reduce toolbar height** — max 2 rows, KPIs as inline badges
2. **Compact table rows** — 40-50px per row in collapsed state
3. **Category group headers** — visual separators instead of per-card badges
4. **Slide-out detail panel** — consistent with ERD page, keeps list visible
5. **Sticky toolbar** — already implemented, just needs to be shorter

### Nice-to-Have
6. **View mode toggle** — cards vs. compact list vs. table
7. **Collapsible category groups** — click header to collapse/expand
8. **Keyboard navigation** — arrow keys to move between tables, Enter to open
9. **Breadcrumb in detail panel** — Category > Table Name
10. **Resizable panel** — drag to resize detail panel width
11. **"Jump to category"** — clicking a category chip scrolls to that group
