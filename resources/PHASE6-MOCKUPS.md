# Phase 6 — Detailed UI Mockups

> All mockups use real table names from the project (60 tables).
> Viewport reference: 1440×900px (standard laptop).
> Current toolbar+header = ~270px, leaving ~630px for content.

---

## CURRENT STATE (for comparison)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────┐ ┌─────────────┐ ║
║  │ TABLES  │ │ COLUMNS  │ │ TOTAL ROWS │ │ QA SCORE │ │MISSING TBL  │ │MISSING COL  │ ║
║  │  60     │ │  1.0K    │ │  62.1M     │ │  39%     │ │DESC   27    │ │DESC   644   │ ║
║  └─────────┘ └──────────┘ └────────────┘ └──────────┘ └─────────────┘ └─────────────┘ ║
║                                                                                   80px ║
║  🔍 Search tables...   ● Reference 42  ● Dimension 1  ● Fact 3  ● Fact (Hist) 1      ║
║                        ● Mapping 6  ● Auxiliary 7                                      ║
║                                           ↕ [Category ↑] Name  Rows  Columns  Size    ║
║                                                                                  160px ║
║  🏷 verified                                                     60 of 60 tables       ║
║─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ~210px ║
║                                                                                        ║
║  ┌──────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ FCT  Dispatch                                                                 │   ║
║  │        FCT_DISPATCH                                                              │   ║
║  │        No description                                                            │   ║
║  │        ⊞ 45   ◫ 428.8K   ◪ 42.7 MB                                              │   ║
║  └──────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                              card ~130px║
║  ┌──────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ FCT  Financial                                                                │   ║
║  │        FCT_FINANCIAL                                                             │   ║
║  │        No description                                                            │   ║
║  │        ⊞ 34   ◫ 5.9M   ◪ 481.7 MB                                               │   ║
║  └──────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                        ║
║  ┌──────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ FCT  Order                                                                    │   ║
║  │        FCT_ORDER                                                                 │   ║
║  │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ← BELOW FOLD (not visible) ░░░░░░  │   ║
║                                                                                        ║
║  ══════════════════════════ VIEWPORT ENDS AT 900px ════════════════════════════════════ ║
║                                                                                        ║
║  PROBLEM: Only ~2.5 cards visible. User must scroll to see 57 more tables.             ║
║  Toolbar consumes 210px + header 56px = 266px before any content appears.              ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝
```

---
---

## OPTION A: Compact List + Slide-Out Detail Panel

> Philosophy: **Browse fast, inspect deep.** The list is for scanning —
> keep it ultra-compact. When you want detail, it opens in a panel that
> doesn't destroy your place in the list.

### A.1 — Default State (no table selected)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7    60 tbls  ⚠ 27   ║
║ Sort: [Category ↑]  Name  Rows  Columns  Size               QA 39%   🏷 verified      ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  ▼ FACT TABLES (3)                                              Cols    Rows     Size  ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║
║    Dispatch ·····································  No desc       45   428.8K   42.7 MB  ║
║    Financial ····································  No desc       34     5.9M  481.7 MB  ║
║    Order ········································  Tracks…  ✓   38   511.5K   36.7 MB  ║
║                                                                                        ║
║  ▼ FACT HISTORICAL (1)                                                                 ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║
║    Currency Conversion Rate ·····················  No desc       12    89.2K    5.1 MB  ║
║                                                                                        ║
║  ▼ DIMENSION (1)                                                                       ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║
║    Date ·········································  Calendar…  ✓   8    73.1K    2.8 MB  ║
║                                                                                        ║
║  ▼ REFERENCE (42)                                                                      ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║
║    Agent ········································  No desc       15     1.2K  198.5 KB  ║
║    Box ··········································  No desc       12    45.8K    3.2 MB  ║
║    Carrier ······································  Air frei… ✓  18     2.1K    1.2 MB  ║
║    City ·········································  No desc        8     3.5K  245.0 KB  ║
║    Client ·······································  No desc       25    15.2K    8.9 MB  ║
║    Client Group ·································  No desc       10     1.8K  320.0 KB  ║
║    Company ······································  No desc       12     2.5K  450.0 KB  ║
║    Continent ····································  No desc        5       7    1.2 KB  ║
║    Country ······································  No desc        8      250   45.0 KB  ║
║    Currency ·····································  No desc       10      180   28.0 KB  ║
║    Currency Conversion Rate Type ················  No desc        6       12    2.1 KB  ║
║    Dispatch Item ································  No desc       18   890.2K   52.1 MB  ║
║    Dispatch Status ······························  Lookup…   ✓   6       15    2.8 KB  ║
║    Dispatch Type ································  No desc        6       22    3.5 KB  ║
║    Domain ·······································  No desc        8       45    8.2 KB  ║
║    HR Department ································  No desc       10      120   18.5 KB  ║
║    Invoice ······································  No desc       22     1.2M   98.2 MB  ║
║    Invoice Item ·································  No desc       18     2.8M  185.0 MB  ║
║    Invoice Status ·······························  No desc        6       18    3.1 KB  ║
║    Location ·····································  No desc       15     8.2K    4.5 MB  ║
║    Location Type ································  No desc        5       12    1.8 KB  ║
║    Master Dispatch ······························  No desc       20    12.5K    8.8 MB  ║
║    Master Dispatch Status ·······················  No desc        6       10    1.5 KB  ║
║    Master Dispatch Type ·························  No desc        5        8    1.2 KB  ║
║    Office ·······································  No desc       12      350   52.0 KB  ║
║    ↓ (scrolling — 17 more REF tables below)                                            ║
║                                                                                        ║
║  ▼ MAPPING (6)                                                                         ║
║  ▼ AUXILIARY (7)                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

STATS: Toolbar = ~76px (2 rows × 38px). Header = 56px.
       Content starts at 132px. Visible area = 768px.
       At 36px/row → ~21 tables visible without scrolling (vs 2.5 currently).
       Category headers add ~30px each.
```

### A.2 — Table Selected (detail panel open)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7    60 tbls  ⚠ 27   ║
║ Sort: [Category ↑]  Name  Rows  Columns  Size               QA 39%   🏷 verified      ║
╠══════════════════════════════════════════════╦═══════════════════════════════════════════╣
║                                              ║                                         ║
║  ▼ FACT TABLES (3)                Cols  Rows ║  FCT · Dispatch                     ✕   ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ║  FCT_DISPATCH                            ║
║  ▸ Dispatch ···· No desc   45  428.8K ◀══════╬═══════════════════════════════════       ║
║    Financial ··· No desc   34    5.9M        ║  No description — click to add           ║
║    Order ······· Tracks…   38  511.5K        ║  ─────────────────────────────────        ║
║                                              ║  ⊞ 45 columns  ◫ 428.8K rows            ║
║  ▼ FACT HISTORICAL (1)                       ║  ◪ 42.7 MB     ◷ 26h ago                ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ║                                         ║
║    Currency Conversion R…  12   89.2K        ║  Tags: No tags  [+ tag]                  ║
║                                              ║                                         ║
║  ▼ DIMENSION (1)                             ║  ─── DATA PREVIEW ──────────────────     ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ║  ┌──────────────────────────────────┐    ║
║    Date ··············  ✓   8   73.1K        ║  │ ⊞  Load Data Preview             │    ║
║                                              ║  └──────────────────────────────────┘    ║
║  ▼ REFERENCE (42)                            ║                                         ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ║  ─── COLUMNS (45) ──────── [Profile]     ║
║    Agent ·············       15    1.2K       ║  ┌──────────────────────────────────┐    ║
║    Box ···············       12   45.8K       ║  │ Column              Type    Null │    ║
║    Carrier ···········  ✓   18    2.1K       ║  │────────────────────────────────── │    ║
║    City ··············        8    3.5K       ║  │ 🔑 DISPATCH_ID      T STR    ◎  │    ║
║    Client ············       25   15.2K       ║  │    DISPATCH_CODE    T STR    ◎  │    ║
║    Client Group ······       10    1.8K       ║  │    DISPATCH_STAT…   T STR    ◎  │    ║
║    Company ···········       12    2.5K       ║  │    DISPATCH_TYPE…   T STR    ◎  │    ║
║    Continent ·········        5       7       ║  │    ORIGIN_LOCAT…    T STR    ◎  │    ║
║    Country ···········        8     250       ║  │    DEST_LOCATIO…    T STR    ◎  │    ║
║    Currency ··········       10     180       ║  │    CARRIER_ID       T STR    ◎  │    ║
║    Currency Conv R T ·        6      12       ║  │    CREATED_BY_U…    T STR    ◎  │    ║
║    Dispatch Item ·····       18  890.2K       ║  │    HANDLED_BY_U…    T STR    ◎  │    ║
║    Dispatch Status ···  ✓    6      15       ║  │    DOMAIN_ID        T STR    ◎  │    ║
║    Dispatch Type ·····        6      22       ║  │    ...25 more                   │    ║
║    Domain ············        8      45       ║  └──────────────────────────────────┘    ║
║    HR Department ·····       10     120       ║                                         ║
║    Invoice ···········       22    1.2M       ║  ─── RELATIONSHIPS ─────────────────     ║
║    Invoice Item ······       18    2.8M       ║  References (outgoing):                  ║
║    Invoice Status ····        6      18       ║   → REF_DISPATCH_STATUS                  ║
║    Location ··········       15    8.2K       ║   → REF_DISPATCH_TYPE                    ║
║    Location Type ·····        5      12       ║   → REF_LOCATION (origin)                ║
║    Master Dispatch ···       20   12.5K       ║   → REF_LOCATION (dest)                  ║
║    ...                                       ║   → REF_CARRIER                           ║
║                                              ║   → REF_USER (created_by)                 ║
║  ▼ MAPPING (6)                               ║   → REF_USER (handled_by)                 ║
║  ▼ AUXILIARY (7)                             ║   → REF_DOMAIN                             ║
║                                              ║   → REF_OPS_DEPARTMENT                    ║
║                                              ║   → REF_MASTER_DISPATCH                   ║
║                                              ║  Referenced by (incoming):                 ║
║                                              ║   ← MAP_DISPATCH_EVENT                    ║
║                                              ║   ← AUX_BOX_TO_DISPATCH                   ║
║                                              ║   ← AUX_ORDER_TO_DISPATCH                 ║
╚══════════════════════════════════════════════╩═══════════════════════════════════════════╝

KEY BEHAVIORS:
• List shrinks to ~50% width, still shows all categories + ~25 tables
• Panel is ~50% width, scrollable independently
• Selected row highlighted with accent color + ▸ indicator
• Arrow keys ↑↓ navigate list, Enter opens, Esc closes panel
• Panel reuses existing TableDetailPanel component pattern from ERD
• Clicking a relationship link (e.g., → REF_CARRIER) selects that table
```

### A.3 — With Active Filters

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 "carrier"           FCT 3  [REF 42] DIM 1  FCTH 1  MAP 6  AUX 7    2 tbls  ✕clear ║
║ Sort: [Name ↑]  Category  Rows  Columns  Size                QA 39%   🏷 verified     ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  ▼ REFERENCE (2 matching)                                       Cols    Rows     Size  ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║
║    Carrier ······································  Air frei… ✓  18     2.1K    1.2 MB  ║
║                                                     matched: CARRIER_ID               ║
║    Service Provider ·····························  No desc       14      890  320.0 KB  ║
║                                                     matched: CARRIER_ID               ║
║                                                                                        ║
║                                                                                        ║
║                       (empty space — only 2 results)                                   ║
║                                                                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

FILTER BEHAVIORS:
• Search highlights matching text in table name and shows matched column names
• Category chips act as toggle filters — active one gets ring/highlight
• Active search shows "✕ clear" link
• Stats filter (⚠ 27) toggles to show only tables with missing descriptions
• All filters composable: search + category + stats + tag
```

### A.4 — Compact Toolbar Detail: KPI Stats

```
Where did the KPI cards go? They're condensed into the toolbar:

CURRENT (7 cards × ~120px = 840px wide, wraps off-screen):
┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────┐ ┌───────────┐ ┌───────┐
│ TABLES  │ │ COLUMNS  │ │ TOTAL ROWS │ │ QA SCORE │ │MISSING TBL  │ │MISSING COL│ │EMPTY  │
│  60     │ │  1.0K    │ │  62.1M     │ │  39%     │ │DESC   27    │ │DESC   644 │ │TBLS 0 │
└─────────┘ └──────────┘ └────────────┘ └──────────┘ └─────────────┘ └───────────┘ └───────┘

PROPOSED — inline summary badges in toolbar row 2:
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Sort: [Category ↑]  Name  Rows  Cols  Size       QA 39%  ⚠ 27 issues  🏷 verified  │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                                    ↑        ↑
                                                    │        └── Clickable: filters
                                                    │            to tables with issues.
                                                    │            Tooltip shows breakdown:
                                                    │            "27 missing table desc
                                                    │             644 missing col desc
                                                    │             0 empty tables"
                                                    │
                                                    └── Color-coded: red <50%,
                                                        yellow 50-80%, green >80%

OPTIONAL: Hovering "QA 39%" shows a detailed popover:
┌─────────────────────────────────────┐
│  Project Stats                      │
│  ─────────────────────────────────  │
│  60 tables · 1.0K columns · 62.1M  │
│                                     │
│  QA Score: 39%  ██████░░░░░░░░░░   │
│                                     │
│  ⚠ 27 tables missing description   │
│  ⚠ 644 columns missing description │
│  ✓ 0 empty tables                  │
└─────────────────────────────────────┘
```

---
---

## OPTION B: Condensed Cards with Collapsible Category Groups

> Philosophy: **Keep the card warmth, fix the density.** Cards feel more
> approachable than raw lists. But make them single-line when collapsed,
> and group by category for scannability.

### B.1 — Default State (all groups expanded)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7    60 tbls  ⚠ 27   ║
║ Sort: [Category ↑]  Name  Rows  Columns  Size               QA 39%   🏷 verified      ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  ▼ FACT TABLES ─────────────────────────────────── 3 tables · 6.8M rows · 561 MB ──── ║
║                                                                                        ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Dispatch           No description              ⊞ 45   ◫ 428.8K   ◪ 42.7 MB    │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Financial          No description              ⊞ 34   ◫ 5.9M     ◪ 481.7 MB   │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Order              Tracks all orde… verified    ⊞ 38   ◫ 511.5K   ◪ 36.7 MB    │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                        ║
║  ▼ FACT HISTORICAL ──────────────────────────────── 1 table · 89.2K rows · 5.1 MB ─── ║
║                                                                                        ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Currency Conversion Rate    No description     ⊞ 12   ◫ 89.2K    ◪ 5.1 MB     │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                        ║
║  ▼ DIMENSION ──────────────────────────────────────  1 table · 73.1K rows · 2.8 MB ── ║
║                                                                                        ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Date               Calendar dimension…  ✓      ⊞ 8    ◫ 73.1K    ◪ 2.8 MB     │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                        ║
║  ▼ REFERENCE ─────────────────────────────────────  42 tables · 2.1M rows · 389 MB ── ║
║                                                                                        ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Agent              No description              ⊞ 15   ◫ 1.2K     ◪ 198.5 KB   │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Box                No description              ⊞ 12   ◫ 45.8K    ◪ 3.2 MB     │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Carrier            Air freight carri… verified  ⊞ 18   ◫ 2.1K     ◪ 1.2 MB     │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ City               No description              ⊞ 8    ◫ 3.5K     ◪ 245.0 KB   │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Client             No description              ⊞ 25   ◫ 15.2K    ◪ 8.9 MB     │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║  │ ...37 more REF tables                                                              │ ║
║                                                                                        ║
║  ► MAPPING ──────────────────────────────────────── 6 tables (collapsed) ───────────── ║
║  ► AUXILIARY ────────────────────────────────────── 7 tables (collapsed) ───────────── ║
║                                                                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

STATS: Each card is ~48px (single line + padding).
       Category header = ~36px.
       At this density: ~14 cards visible on initial load (vs 2.5 currently).
```

### B.2 — Card Expanded (inline detail)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7    60 tbls  ⚠ 27   ║
║ Sort: [Category ↑]  Name  Rows  Columns  Size               QA 39%   🏷 verified      ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  ▼ FACT TABLES ─────────────────────────────────── 3 tables · 6.8M rows · 561 MB ──── ║
║                                                                                        ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Dispatch           No description              ⊞ 45   ◫ 428.8K   ◪ 42.7 MB    │ ║
║  │                                                                                    │ ║
║  │  ┌─ Detail ──────────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                               │ │ ║
║  │  │  No description — click to add                         Tags: [+ tag]          │ │ ║
║  │  │  ⊞ 45 columns · ◫ 428.8K rows · ◪ 42.7 MB · ◷ 26h ago                       │ │ ║
║  │  │                                                                               │ │ ║
║  │  │  ─── DATA PREVIEW ───────────────────────────────────────────────────────     │ │ ║
║  │  │  ┌─────────────────────────────────────────────────────────────────────┐      │ │ ║
║  │  │  │ ⊞  Load Data Preview                                               │      │ │ ║
║  │  │  └─────────────────────────────────────────────────────────────────────┘      │ │ ║
║  │  │                                                                               │ │ ║
║  │  │  ─── COLUMNS (45) ──────────────────────────────────────────── [Profile]      │ │ ║
║  │  │  ┌──────────────────────────────────────────────────────────────────────┐     │ │ ║
║  │  │  │ Column                               Type          Null             │     │ │ ║
║  │  │  │──────────────────────────────────────────────────────────────────────│     │ │ ║
║  │  │  │ 🔑 DISPATCH_ID  ℹ                    T STRING       ◎              │     │ │ ║
║  │  │  │    DISPATCH_CODE                      T STRING       ◎              │     │ │ ║
║  │  │  │    DISPATCH_STATUS_ID  ℹ              T STRING       ◎              │     │ │ ║
║  │  │  │    DISPATCH_TYPE_ID  ℹ                T STRING       ◎              │     │ │ ║
║  │  │  │    ORIGIN_LOCATION_ID  ℹ              T STRING       ◎              │     │ │ ║
║  │  │  │    ...40 more columns                                               │     │ │ ║
║  │  │  └──────────────────────────────────────────────────────────────────────┘     │ │ ║
║  │  │                                                                               │ │ ║
║  │  │  ─── RELATIONSHIPS (13) ────────────────────────────────────────────────      │ │ ║
║  │  │  → REF_DISPATCH_STATUS  → REF_DISPATCH_TYPE  → REF_LOCATION ×2              │ │ ║
║  │  │  → REF_CARRIER  → REF_USER ×2  → REF_DOMAIN  → REF_OPS_DEPARTMENT           │ │ ║
║  │  │  → REF_MASTER_DISPATCH                                                       │ │ ║
║  │  │  ← MAP_DISPATCH_EVENT  ← AUX_BOX_TO_DISPATCH  ← AUX_ORDER_TO_DISPATCH       │ │ ║
║  │  └───────────────────────────────────────────────────────────────────────────────┘ │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                        ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │ █ Financial          No description              ⊞ 34   ◫ 5.9M     ◪ 481.7 MB   │ ║
║  └────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

NOTE: Inline expansion pushes other cards down (same as current behavior).
      But since collapsed cards are ~48px instead of ~130px, you still see
      the next table below the expanded detail.
```

### B.3 — Category Group Collapsed

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  ...toolbar...                                                                         ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  ► FACT TABLES ─────────────────────────────────── 3 tables · 6.8M rows · 561 MB ──── ║
║  ► FACT HISTORICAL ──────────────────────────────── 1 table · 89.2K rows · 5.1 MB ─── ║
║  ► DIMENSION ────────────────────────────────────── 1 table · 73.1K rows · 2.8 MB ─── ║
║  ► REFERENCE ───────────────────────────────────── 42 tables · 2.1M rows · 389 MB ─── ║
║  ► MAPPING ──────────────────────────────────────── 6 tables · 1.9M rows · 112 MB ─── ║
║  ► AUXILIARY ────────────────────────────────────── 7 tables · 2.0M rows · 98 MB ───── ║
║                                                                                        ║
║                     (all 60 tables represented in just 6 lines!)                       ║
║                                                                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

Use case: Get a bird's-eye overview of the entire data model at a glance.
Click ▼ to expand any group you're interested in.
```

---
---

## OPTION C: Spreadsheet / Table View

> Philosophy: **Maximum data density for power users.** Every pixel counts.
> See all 60 tables on one screen. Click to inspect.

### C.1 — Default State

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7    60 tbls  ⚠ 27   ║
╠════╤═══════════════════════════════╤═══════════════════════╤══════╤════════╤═════╤══════╣
║ ## │ Table                         │ Description           │ Cols │   Rows │Size │ Tags ║
╠════╪═══════════════════════════════╪═══════════════════════╪══════╪════════╪═════╪══════╣
║    │                               │                       │      │        │     │      ║
║ FCT│ FACT TABLES                   │                       │      │        │     │      ║
║────┼───────────────────────────────┼───────────────────────┼──────┼────────┼─────┼──────║
║  1 │ Dispatch                      │ —                     │   45 │ 428.8K │ 43M │      ║
║  2 │ Financial                     │ —                     │   34 │   5.9M │482M │      ║
║  3 │ Order                         │ Tracks all orde…      │   38 │ 511.5K │ 37M │ ✓vrf ║
║    │                               │                       │      │        │     │      ║
║FCTH│ FACT HISTORICAL               │                       │      │        │     │      ║
║────┼───────────────────────────────┼───────────────────────┼──────┼────────┼─────┼──────║
║  4 │ Currency Conversion Rate      │ —                     │   12 │  89.2K │  5M │      ║
║    │                               │                       │      │        │     │      ║
║DIM │ DIMENSION                     │                       │      │        │     │      ║
║────┼───────────────────────────────┼───────────────────────┼──────┼────────┼─────┼──────║
║  5 │ Date                          │ Calendar dimension…   │    8 │  73.1K │  3M │      ║
║    │                               │                       │      │        │     │      ║
║REF │ REFERENCE (42)                │                       │      │        │     │      ║
║────┼───────────────────────────────┼───────────────────────┼──────┼────────┼─────┼──────║
║  6 │ Agent                         │ —                     │   15 │   1.2K │199K │      ║
║  7 │ Box                           │ —                     │   12 │  45.8K │  3M │      ║
║  8 │ Carrier                       │ Air freight carri…    │   18 │   2.1K │  1M │ ✓vrf ║
║  9 │ City                          │ —                     │    8 │   3.5K │245K │      ║
║ 10 │ Client                        │ —                     │   25 │  15.2K │  9M │      ║
║ 11 │ Client Group                  │ —                     │   10 │   1.8K │320K │      ║
║ 12 │ Company                       │ —                     │   12 │   2.5K │450K │      ║
║ 13 │ Continent                     │ —                     │    5 │      7 │  1K │      ║
║ 14 │ Country                       │ —                     │    8 │    250 │ 45K │      ║
║ 15 │ Currency                      │ —                     │   10 │    180 │ 28K │      ║
║ 16 │ Currency Conv Rate Type       │ —                     │    6 │     12 │  2K │      ║
║ 17 │ Dispatch Item                 │ —                     │   18 │ 890.2K │ 52M │      ║
║ 18 │ Dispatch Status               │ Lookup table fo…      │    6 │     15 │  3K │ ✓vrf ║
║ 19 │ Dispatch Type                 │ —                     │    6 │     22 │  4K │      ║
║ 20 │ Domain                        │ —                     │    8 │     45 │  8K │      ║
║ 21 │ HR Department                 │ —                     │   10 │    120 │ 19K │      ║
║ 22 │ Invoice                       │ —                     │   22 │   1.2M │ 98M │      ║
║ 23 │ Invoice Item                  │ —                     │   18 │   2.8M │185M │      ║
║ 24 │ Invoice Status                │ —                     │    6 │     18 │  3K │      ║
║ 25 │ Location                      │ —                     │   15 │   8.2K │  5M │      ║
║ 26 │ Location Type                 │ —                     │    5 │     12 │  2K │      ║
║ 27 │ Master Dispatch               │ —                     │   20 │  12.5K │  9M │      ║
║ 28 │ Master Dispatch Status        │ —                     │    6 │     10 │  2K │      ║
║ 29 │ Master Dispatch Type          │ —                     │    5 │      8 │  1K │      ║
║ 30 │ Office                        │ —                     │   12 │    350 │ 52K │      ║
║ 31 │ Operator                      │ —                     │   18 │   4.5K │  2M │      ║
║ 32 │ Operator Status               │ —                     │    6 │      8 │  1K │      ║
║ 33 │ Operator Type                 │ —                     │    5 │      5 │  1K │      ║
║ 34 │ Ops Department                │ —                     │   10 │     85 │ 14K │      ║
║ 35 │ Order Item                    │ —                     │   22 │ 890.5K │ 62M │      ║
║ 36 │ Order Status                  │ —                     │    6 │     22 │  4K │      ║
║ 37 │ Order Type                    │ —                     │    5 │     15 │  2K │      ║
║ 38 │ Quote                         │ —                     │   28 │ 157.2K │ 32M │      ║
║ 39 │ Quote Cost                    │ —                     │   15 │ 245.8K │ 18M │      ║
║ 40 │ Quote Status                  │ —                     │    6 │     12 │  2K │      ║
║ 41 │ Quote Status Code Mapping     │ —                     │    5 │     35 │  5K │      ║
║ 42 │ Quote Variation               │ —                     │   12 │  45.2K │  8M │      ║
║ 43 │ Quote Version                 │ —                     │   18 │  82.1K │ 15M │      ║
║ 44 │ Service Provider              │ —                     │   14 │    890 │320K │      ║
║ 45 │ State                         │ —                     │    8 │    450 │ 65K │      ║
║ 46 │ Supplier                      │ —                     │   12 │   1.5K │280K │      ║
║ 47 │ Vessel                        │ —                     │   10 │    320 │ 48K │      ║
║    │                               │                       │      │        │     │      ║
║MAP │ MAPPING (6)                   │                       │      │        │     │      ║
║────┼───────────────────────────────┼───────────────────────┼──────┼────────┼─────┼──────║
║ 48 │ Dispatch Event                │ —                     │    8 │ 512.0K │ 28M │      ║
║ 49 │ Dispatch Item Event           │ —                     │    8 │ 890.5K │ 48M │      ║
║ 50 │ Invoice Event                 │ —                     │    8 │ 125.0K │  8M │      ║
║ 51 │ Order Event                   │ —                     │    8 │ 245.0K │ 15M │      ║
║ 52 │ Order Item Event              │ —                     │    8 │ 112.0K │  7M │      ║
║ 53 │ Quote Event                   │ —                     │    8 │  52.0K │  4M │      ║
║    │                               │                       │      │        │     │      ║
║AUX │ AUXILIARY (7)                 │                       │      │        │     │      ║
║────┼───────────────────────────────┼───────────────────────┼──────┼────────┼─────┼──────║
║ 54 │ Box To Dispatch               │ —                     │    6 │ 890.0K │ 42M │      ║
║ 55 │ Invoice To Accsys Item        │ —                     │    8 │ 250.0K │ 15M │      ║
║ 56 │ Master Dispatch To Vessel     │ —                     │    6 │  12.5K │  2M │      ║
║ 57 │ Order To Dispatch             │ —                     │    6 │ 511.5K │ 28M │      ║
║ 58 │ Quote Dispatch                │ —                     │    8 │ 157.2K │ 12M │      ║
║ 59 │ Quote Order                   │ —                     │   44 │ 511.5K │ 37M │      ║
║ 60 │ User To Dept                  │ —                     │   10 │   3.2K │200K │      ║
╚════╧═══════════════════════════════╧═══════════════════════╧══════╧════════╧═════╧══════╝

STATS: Header row = ~32px. Each data row = ~28px. Category headers = ~24px.
       60 rows + 6 category headers + header = ~1920px total.
       Visible in 900px viewport: ~28 rows without scrolling.
       ALL 60 tables visible with minimal scrolling.

BEHAVIORS:
• Column headers are sortable (click to sort, click again to reverse)
• Row hover highlights entire row
• Click any row → opens slide-out detail panel (same as Option A)
• "—" in description column = missing description (styled muted/red)
• Numbers right-aligned for easy scanning
• Rows without description highlighted subtly (light orange bg)
```

### C.2 — With Detail Panel Open

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7    60 tbls  ⚠ 27   ║
╠════╤═══════════════════════╤══════╤════════╤═════╦═══════════════════════════════════════╣
║ ## │ Table                 │ Cols │   Rows │Size ║                                      ║
╠════╪═══════════════════════╪══════╪════════╪═════║  FCT · Dispatch                  ✕   ║
║ FCT│ FACT TABLES           │      │        │     ║  FCT_DISPATCH                        ║
║────┼───────────────────────┼──────┼────────┼─────║                                      ║
║  1 │▸Dispatch         ◀═══╪══════╪════════╪═════║  No description — click to add        ║
║  2 │ Financial             │   34 │   5.9M │482M ║  ────────────────────────────────     ║
║  3 │ Order                 │   38 │ 511.5K │ 37M ║  ⊞ 45 cols  ◫ 428.8K rows            ║
║FCTH│ FACT HISTORICAL       │      │        │     ║  ◪ 42.7 MB  ◷ 26h ago                ║
║────┼───────────────────────┼──────┼────────┼─────║                                      ║
║  4 │ Curr Conv Rate        │   12 │  89.2K │  5M ║  Tags: No tags  [+ tag]              ║
║DIM │ DIMENSION             │      │        │     ║                                      ║
║────┼───────────────────────┼──────┼────────┼─────║  ─── COLUMNS (45) ──── [Profile]     ║
║  5 │ Date                  │    8 │  73.1K │  3M ║  ┌──────────────────────────────┐     ║
║REF │ REFERENCE (42)        │      │        │     ║  │ 🔑 DISPATCH_ID   T STR   ◎  │     ║
║────┼───────────────────────┼──────┼────────┼─────║  │    DISPATCH_CODE  T STR   ◎  │     ║
║  6 │ Agent                 │   15 │   1.2K │199K ║  │    STATUS_ID  ℹ   T STR   ◎  │     ║
║  7 │ Box                   │   12 │  45.8K │  3M ║  │    TYPE_ID  ℹ     T STR   ◎  │     ║
║  8 │ Carrier          ✓    │   18 │   2.1K │  1M ║  │    ORIGIN_LOC…   T STR   ◎  │     ║
║  9 │ City                  │    8 │   3.5K │245K ║  │    DEST_LOCAT…   T STR   ◎  │     ║
║ 10 │ Client                │   25 │  15.2K │  9M ║  │    CARRIER_ID    T STR   ◎  │     ║
║ 11 │ Client Group          │   10 │   1.8K │320K ║  │    ...38 more              │     ║
║ 12 │ Company               │   12 │   2.5K │450K ║  └──────────────────────────────┘     ║
║ 13 │ Continent             │    5 │      7 │  1K ║                                      ║
║ 14 │ Country               │    8 │    250 │ 45K ║  ─── RELATIONSHIPS (13) ────────     ║
║ 15 │ Currency              │   10 │    180 │ 28K ║  → REF_DISPATCH_STATUS                ║
║ 16 │ Curr Conv Rate Ty     │    6 │     12 │  2K ║  → REF_DISPATCH_TYPE                  ║
║ 17 │ Dispatch Item         │   18 │ 890.2K │ 52M ║  → REF_LOCATION ×2                   ║
║ 18 │ Dispatch Status  ✓    │    6 │     15 │  3K ║  → REF_CARRIER                       ║
║ 19 │ Dispatch Type         │    6 │     22 │  4K ║  → REF_USER ×2                       ║
║ 20 │ Domain                │    8 │     45 │  8K ║  → REF_DOMAIN                        ║
║ 21 │ HR Department         │   10 │    120 │ 19K ║  → REF_OPS_DEPARTMENT                ║
║ 22 │ Invoice               │   22 │   1.2M │ 98M ║  → REF_MASTER_DISPATCH               ║
║ 23 │ Invoice Item          │   18 │   2.8M │185M ║  ← MAP_DISPATCH_EVENT                ║
║ 24 │ Invoice Status        │    6 │     18 │  3K ║  ← AUX_BOX_TO_DISPATCH               ║
║ ...│ ...                   │  ... │    ... │ ... ║  ← AUX_ORDER_TO_DISPATCH              ║
╚════╧═══════════════════════╧══════╧════════╧═════╩═══════════════════════════════════════╝

NOTE: Description column hidden when panel is open to save space.
      Table narrows to essential columns only (Table, Cols, Rows, Size).
      ~24 rows visible alongside the detail panel.
```

### C.3 — Conditional Formatting / Visual Signals

```
Visual cues in the spreadsheet view:

ROW HIGHLIGHTING:
┌────┬─────────────────────────┬──────────────────┬──────┬────────┬──────┐
│  1 │ Dispatch                │ —————————————————│   45 │ 428.8K │ 43MB │ ← orange tint (no desc)
│  2 │ Financial               │ —————————————————│   34 │   5.9M │482MB │ ← orange tint (no desc)
│  3 │ Order                   │ Tracks all ord…  │   38 │ 511.5K │ 37MB │ ← normal (has desc)
└────┴─────────────────────────┴──────────────────┴──────┴────────┴──────┘

SIZE HEAT MAP (optional — subtle background gradient):
│ Rows column │  7 rows  → very faint    │
│             │  2.1K    → light          │
│             │  428.8K  → medium         │
│             │  5.9M    → intense        │

This helps users instantly spot the largest/busiest tables.
```

---
---

## OPTION D (HYBRID): Compact Grouped List + Slide-Out Panel + View Toggle

> Philosophy: **Best of all worlds.** Default to a compact grouped list (A+B blend),
> with slide-out detail panel (A). Offer a toggle for power users who want
> the spreadsheet view (C).

### D.1 — Default State (List View)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7                     ║
║ ↕ [Category ↑]  Name  Rows  Cols  Size     QA 39%  ⚠ 27 issues    [☰ List] [⊞ Table] ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  ▼ FACT TABLES (3) ─────────────────────────────── 6.8M rows · 561 MB ─────────────── ║
║    Dispatch ·····················  —                 45 col   428.8K rows    42.7 MB   ║
║    Financial ····················  —                 34 col     5.9M rows   481.7 MB   ║
║    Order ························  Tracks all…  ✓   38 col   511.5K rows    36.7 MB   ║
║                                                                                        ║
║  ▼ FACT HISTORICAL (1) ─────────────────────────── 89.2K rows · 5.1 MB ───────────── ║
║    Currency Conversion Rate ·····  —                12 col    89.2K rows     5.1 MB   ║
║                                                                                        ║
║  ▼ DIMENSION (1) ───────────────────────────────── 73.1K rows · 2.8 MB ───────────── ║
║    Date ·························  Calendar…  ✓     8 col    73.1K rows     2.8 MB   ║
║                                                                                        ║
║  ▼ REFERENCE (42) ──────────────────────────────── 2.1M rows · 389 MB ────────────── ║
║    Agent ························  —                15 col     1.2K rows   198.5 KB   ║
║    Box ··························  —                12 col    45.8K rows     3.2 MB   ║
║    Carrier ······················  Air freight… ✓  18 col     2.1K rows     1.2 MB   ║
║    City ·························  —                 8 col     3.5K rows   245.0 KB   ║
║    Client ·······················  —                25 col    15.2K rows     8.9 MB   ║
║    Client Group ·················  —                10 col     1.8K rows   320.0 KB   ║
║    Company ······················  —                12 col     2.5K rows   450.0 KB   ║
║    Continent ····················  —                 5 col         7 rows     1.2 KB   ║
║    Country ······················  —                 8 col       250 rows    45.0 KB   ║
║    Currency ·····················  —                10 col       180 rows    28.0 KB   ║
║    Currency Conv Rate Type ······  —                 6 col        12 rows     2.1 KB   ║
║    Dispatch Item ················  —                18 col   890.2K rows    52.1 MB   ║
║    Dispatch Status ··············  Lookup…  ✓       6 col        15 rows     2.8 KB   ║
║    Dispatch Type ················  —                 6 col        22 rows     3.5 KB   ║
║    Domain ·······················  —                 8 col        45 rows     8.2 KB   ║
║    HR Department ················  —                10 col       120 rows    18.5 KB   ║
║    Invoice ······················  —                22 col     1.2M rows    98.2 MB   ║
║    Invoice Item ·················  —                18 col     2.8M rows   185.0 MB   ║
║    Invoice Status ···············  —                 6 col        18 rows     3.1 KB   ║
║    ... (23 more REF)                                                                   ║
║                                                                                        ║
║  ▼ MAPPING (6) ─────────────────────────────────── 1.9M rows · 112 MB ────────────── ║
║  ▼ AUXILIARY (7) ───────────────────────────────── 2.0M rows · 98 MB ─────────────── ║
╚══════════════════════════════════════════════════════════════════════════════════════════╝

The [☰ List] [⊞ Table] toggle in toolbar row 2 switches between:
  ☰ List  = This compact grouped list (default)
  ⊞ Table = Option C spreadsheet view
```

### D.2 — Table Selected (slide-out panel)

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7    [☰ List][⊞ Tbl] ║
║ ↕ [Category ↑] Name Rows Cols Size    QA 39% ⚠ 27                                     ║
╠═══════════════════════════════════════════════╦══════════════════════════════════════════╣
║                                               ║                                        ║
║  ▼ FCT (3)                                    ║  FCT · Dispatch                    ✕   ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║  FCT_DISPATCH                          ║
║  ▸ Dispatch ···· —    45  428K ◀══════════════╬══                                      ║
║    Financial ··· —    34  5.9M                ║  ┌────────────────────────────────────┐ ║
║    Order ······· Tra… 38  511K                ║  │ No description — click to add      │ ║
║                                               ║  └────────────────────────────────────┘ ║
║  ▼ FCTH (1)                                   ║                                        ║
║    Curr Conv Rate ··   12  89K                ║  ⊞ 45 columns · ◫ 428.8K rows          ║
║                                               ║  ◪ 42.7 MB    · ◷ 26h ago              ║
║  ▼ DIM (1)                                    ║                                        ║
║    Date ············    8  73K                ║  Tags: No tags  [+ tag]                 ║
║                                               ║                                        ║
║  ▼ REF (42)                                   ║  ─── DATA PREVIEW ───────────────────  ║
║    Agent ···········   15  1.2K               ║  ┌──────────────────────────────────┐   ║
║    Box ·············   12  46K                ║  │ ⊞  Load Data Preview             │   ║
║    Carrier ·········   18  2.1K               ║  └──────────────────────────────────┘   ║
║    City ············    8  3.5K               ║                                        ║
║    Client ··········   25  15K                ║  ─── COLUMNS (45) ───────── [Profile]  ║
║    Client Group ····   10  1.8K               ║  ┌──────────────────────────────────┐   ║
║    Company ·········   12  2.5K               ║  │ Column            Type      Null │   ║
║    Continent ·······    5     7               ║  │──────────────────────────────────│   ║
║    Country ·········    8   250               ║  │ 🔑 DISPATCH_ID    T STR      ◎  │   ║
║    Currency ········   10   180               ║  │    DISPATCH_CODE  T STR      ◎  │   ║
║    Curr Conv RT ····    6    12               ║  │    STATUS_ID  ℹ   T STR      ◎  │   ║
║    Dispatch Item ···   18  890K               ║  │    TYPE_ID  ℹ     T STR      ◎  │   ║
║    Dispatch Status ·    6    15               ║  │    ORIGIN_LOC…    T STR      ◎  │   ║
║    Dispatch Type ···    6    22               ║  │    DEST_LOCAT…    T STR      ◎  │   ║
║    Domain ··········    8    45               ║  │    CARRIER_ID     T STR      ◎  │   ║
║    HR Department ···   10   120               ║  │    ...38 more                   │   ║
║    Invoice ·········   22  1.2M               ║  └──────────────────────────────────┘   ║
║    Invoice Item ····   18  2.8M               ║                                        ║
║    Invoice Status ··    6    18               ║  ─── RELATIONSHIPS (13) ──────────────  ║
║    Location ········   15  8.2K               ║  References:                            ║
║    Location Type ···    5    12               ║   → REF_DISPATCH_STATUS                 ║
║    Master Dispatch ·   20  13K                ║   → REF_DISPATCH_TYPE                   ║
║    M Dispatch Stat ·    6    10               ║   → REF_LOCATION ×2                    ║
║    M Dispatch Type ·    5     8               ║   → REF_CARRIER                        ║
║    Office ··········   12   350               ║   → REF_USER ×2                        ║
║    ...17 more REF                             ║   → REF_DOMAIN                         ║
║                                               ║   → REF_OPS_DEPARTMENT                 ║
║  ▼ MAP (6)                                    ║   → REF_MASTER_DISPATCH                ║
║    Dispatch Event ··    8  512K               ║  Referenced by:                         ║
║    Dispatch Item E ·    8  891K               ║   ← MAP_DISPATCH_EVENT                 ║
║    Invoice Event ···    8  125K               ║   ← AUX_BOX_TO_DISPATCH                ║
║    Order Event ·····    8  245K               ║   ← AUX_ORDER_TO_DISPATCH              ║
║    ...                                        ║                                        ║
║                                               ║                                        ║
║  ▼ AUX (7)                                    ║                                        ║
║    Box To Dispatch ·    6  890K               ║                                        ║
║    ...                                        ║                                        ║
╚═══════════════════════════════════════════════╩══════════════════════════════════════════╝

KEY INTERACTIONS:
• Click table row → opens panel, row gets ▸ highlight
• Click different row → panel updates (no close/reopen animation)
• Click ✕ or press Esc → panel closes
• Click relationship link (e.g., → REF_CARRIER) → selects that table, scrolls list
• ↑↓ arrow keys navigate list while panel stays open
• Panel scrolls independently from list
• Panel width: ~520px (same as ERD's TableDetailPanel)
```

### D.3 — View Toggle: Spreadsheet Mode

```
╔══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary      [ Table Browser ]  ERD Diagram          🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════╣
║ 🔍 Search tables...    FCT 3  REF 42  DIM 1  FCTH 1  MAP 6  AUX 7                     ║
║ ↕ [Category ↑]  Name  Rows  Cols  Size     QA 39%  ⚠ 27 issues    [☰ List] [▣ Table] ║
╠════╤══════════════════════════════╤══════════════════╤══════╤════════╤══════╤═══════════╣
║    │ Table ▲                      │ Description      │ Cols │ Rows ▼ │ Size │ Tags      ║
╠════╪══════════════════════════════╪══════════════════╪══════╪════════╪══════╪═══════════╣
║ FCT│ Dispatch                     │ —                │   45 │ 428.8K │ 43MB │           ║
║ FCT│ Financial                    │ —                │   34 │   5.9M │482MB │           ║
║ FCT│ Order                        │ Tracks all…      │   38 │ 511.5K │ 37MB │ verified  ║
║FCTH│ Currency Conversion Rate     │ —                │   12 │  89.2K │  5MB │           ║
║ DIM│ Date                         │ Calendar dim…    │    8 │  73.1K │  3MB │           ║
║ REF│ Agent                        │ —                │   15 │   1.2K │199KB │           ║
║ REF│ Box                          │ —                │   12 │  45.8K │  3MB │           ║
║ REF│ Carrier                      │ Air freight…     │   18 │   2.1K │  1MB │ verified  ║
║ ...│ ...                          │ ...              │  ... │    ... │  ... │ ...       ║
╚════╧══════════════════════════════╧══════════════════╧══════╧════════╧══════╧═══════════╝

User clicks [▣ Table] and gets the full spreadsheet view from Option C.
Clicking [☰ List] returns to the grouped list.
The same slide-out detail panel works in both views.
```

---
---

## COMPARISON MATRIX

```
┌─────────────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Feature                 │ Option A │ Option B │ Option C │ Hybrid D │
├─────────────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Toolbar height          │  ~76px   │  ~76px   │  ~38px   │  ~76px   │
│ Tables visible (no scr) │  ~21     │  ~14     │  ~28     │  ~21     │
│ Tables visible (w/panel)│  ~25     │   N/A    │  ~24     │  ~25     │
│ Density (px/table)      │  36px    │  48px    │  28px    │  36px    │
│ Visual warmth           │  Medium  │  High    │  Low     │  Medium  │
│ Category grouping       │  ✓       │  ✓       │  ✓       │  ✓       │
│ Collapsible groups      │  ✓       │  ✓       │  ✗       │  ✓       │
│ Slide-out detail        │  ✓       │  ✗       │  ✓       │  ✓       │
│ Inline expansion        │  ✗       │  ✓       │  ✗       │  ✗       │
│ View toggle (list/table)│  ✗       │  ✗       │  ✗       │  ✓       │
│ Keyboard navigation     │  ✓       │  Partial │  ✓       │  ✓       │
│ Implementation effort   │  Medium  │  Low     │  Medium  │  High    │
│ Change from current     │  Large   │  Small   │  Large   │  Large   │
└─────────────────────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## SHARED IMPROVEMENTS (apply to any option)

### 1. Compact Toolbar
```
FROM (3 rows, ~210px):
  Row 1: [KPI card][KPI card][KPI card][KPI card][KPI card][KPI card][KPI card]
  Row 2: [Search ........]  [● REF 42] [● DIM 1] [● FCT 3] [● FCTH 1]
                             [● MAP 6]  [● AUX 7]    [↕ Category ↑ Name Rows Cols Size]
  Row 3: [🏷 verified]                                        [60 of 60 tables]

TO (2 rows, ~76px):
  Row 1: [🔍 Search....]  [FCT 3] [REF 42] [DIM 1] [FCTH 1] [MAP 6] [AUX 7]
  Row 2: [↕ Category ↑  Name  Rows  Cols  Size]     [QA 39%] [⚠ 27] [🏷 vrf] [☰][⊞]
```

### 2. Category Chips Redesign
```
FROM (text-heavy, wraps):
  [● Reference 42]  [● Dimension 1]  [● Fact 3]  [● Fact (Historical) 1]
  [● Mapping 6]  [● Auxiliary 7]

TO (compact codes, one line):
  [FCT 3]  [REF 42]  [DIM 1]  [FCTH 1]  [MAP 6]  [AUX 7]

Each chip: colored background matching category, short code, count.
Active = full opacity + ring; inactive = muted + 60% opacity (same as current).
Fits in ~400px instead of ~600px.
```

### 3. Description Indicator
```
Instead of showing "No description" text on every card (wastes space):

  ✓  = Has description (green check, tooltip shows first line)
  —  = Missing description (muted dash or orange dot)

In compact list, description column shows truncated text or "—".
```

### 4. Tag Display
```
Instead of full tag pills on every row:

  Row shows small colored dots (one per tag)
  Hover to see tag names in tooltip
  Or: show first tag as short text, "+N" for additional
```
