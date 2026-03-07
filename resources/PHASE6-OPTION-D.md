# Phase 6 — Option D: Final Design

> **Base**: Option B (condensed cards, collapsible category groups, inline expansion)
> **Toolbar**: From A.4 (compact 2-row, KPIs as inline badges with hover popover)
> **Section order** (expanded detail): Columns → Relationships → Data Preview
> **Viewport**: 1440×900px

---

## TOOLBAR (shared by both D.1 and D.2)

```
FROM current (3 rows, ~210px):
  Row 1: [KPI card][KPI card][KPI card][KPI card][KPI card][KPI card][KPI card]
  Row 2: [Search ........]  [● REF 42] [● DIM 1] [● FCT 3] [● FCTH 1]
                             [● MAP 6]  [● AUX 7]    [↕ Category ↑ Name Rows Cols Size]
  Row 3: [🏷 verified]                                        [60 of 60 tables]

TO (2 rows, ~76px):
  Row 1: [🔍 Search tables...]   [FCT 3] [REF 42] [DIM 1] [FCTH 1] [MAP 6] [AUX 7]
  Row 2: ↕ [Category ↑]  Name  Rows  Cols  Size       QA 39%   ⚠ 27 issues   🏷 verified
```

### KPI hover popover (on "QA 39%" or "⚠ 27 issues"):
```
                    ┌─────────────────────────────────────┐
                    │  Project Overview                    │
                    │  ─────────────────────────────────── │
                    │  60 tables · 1.0K columns · 62.1M   │
                    │  rows · 3.2 GB total                 │
                    │                                      │
                    │  QA Score: 39%  ██████░░░░░░░░░░░░  │
                    │                                      │
                    │  ⚠ 27 tables missing description     │
                    │  ⚠ 644 columns missing description   │
                    │  ✓ 0 empty tables                    │
                    └─────────────────────────────────────┘
```

### Category chips behavior:
```
  [FCT 3]  [REF 42]  [DIM 1]  [FCTH 1]  [MAP 6]  [AUX 7]
     ↑         ↑
  colored bg   colored bg
  (green)      (cyan)

  Active = full opacity + ring highlight
  Inactive = muted 60% opacity
  Click = toggle filter (same as current)

  ⚠ 27 issues = clickable, cycles through:
    click 1: filter → missing table descriptions (27)
    click 2: filter → missing column descriptions (644)
    click 3: filter → empty tables (0)
    click 4: clear filter
    (or: single click shows filter dropdown)
```

---
---

## D.1 — VERTICAL LAYOUT (sections stacked)

> Columns → Relationships → Data Preview, all full width, stacked vertically.

### D.1a — Default state (no table expanded)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary        [ Table Browser ]  ERD Diagram            🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║  🔍 Search tables...       [FCT 3] [REF 42] [DIM 1] [FCTH 1] [MAP 6] [AUX 7]             ║
║  ↕ [Category ↑]  Name  Rows  Cols  Size                  QA 39%   ⚠ 27   🏷 verified     ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                            ║
║  ▼ FACT TABLES ──────────────────────────────────────── 3 tables · 6.8M rows · 561 MB ──  ║
║                                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch              —                              ⊞ 45   ◫ 428.8K   ◪ 42.7 MB │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Financial             —                              ⊞ 34   ◫ 5.9M    ◪ 481.7 MB │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Order                 Tracks all order…   verified   ⊞ 38   ◫ 511.5K   ◪ 36.7 MB │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
║  ▼ FACT HISTORICAL ─────────────────────────────────────── 1 table · 89.2K rows · 5 MB ─  ║
║                                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Currency Conversion Rate   —                         ⊞ 12   ◫ 89.2K    ◪ 5.1 MB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
║  ▼ DIMENSION ────────────────────────────────────────────── 1 table · 73.1K rows · 3 MB ─ ║
║                                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Date                  Calendar dimension…            ⊞ 8    ◫ 73.1K    ◪ 2.8 MB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
║  ▼ REFERENCE ──────────────────────────────────────────── 42 tables · 2.1M rows · 389 MB  ║
║                                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Agent                 —                              ⊞ 15   ◫ 1.2K   ◪ 198.5 KB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Box                   —                              ⊞ 12   ◫ 45.8K    ◪ 3.2 MB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Carrier               Air freight carr…   verified   ⊞ 18   ◫ 2.1K     ◪ 1.2 MB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ City                  —                              ⊞ 8    ◫ 3.5K   ◪ 245.0 KB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Client                —                              ⊞ 25   ◫ 15.2K    ◪ 8.9 MB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Client Group          —                              ⊞ 10   ◫ 1.8K   ◪ 320.0 KB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Company               —                              ⊞ 12   ◫ 2.5K   ◪ 450.0 KB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  │ ...35 more REF tables (scroll ↓)                                                    │   ║
║                                                                                            ║
║  ► MAPPING ──────────────────────────────────────────────── 6 tables (collapsed) ──────── ║
║  ► AUXILIARY ────────────────────────────────────────────── 7 tables (collapsed) ──────── ║
║                                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝

METRICS:
  Header:          56px
  Toolbar:         76px (2 rows)
  ─────────────────────
  Content starts: 132px (was ~270px — saved 138px)
  Card height:    ~48px (single line + padding)
  Category hdr:   ~32px
  Visible cards: ~14 tables on initial load (was ~2.5)
```

### D.1b — Table expanded: Columns → Relationships → Data Preview (stacked)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary        [ Table Browser ]  ERD Diagram            🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║  🔍 Search tables...       [FCT 3] [REF 42] [DIM 1] [FCTH 1] [MAP 6] [AUX 7]             ║
║  ↕ [Category ↑]  Name  Rows  Cols  Size                  QA 39%   ⚠ 27   🏷 verified     ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                            ║
║  ▼ FACT TABLES ──────────────────────────────────────── 3 tables · 6.8M rows · 561 MB ──  ║
║                                                                                            ║
║  ┌─ ▾ ─────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch              —                              ⊞ 45   ◫ 428.8K   ◪ 42.7 MB │   ║
║  │─────────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                     │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │ No description — click to add                            Tags: [+ tag]      │    │   ║
║  │  │ ⊞ 45 columns · ◫ 428.8K rows · ◪ 42.7 MB · ◷ 26h ago                      │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ─── COLUMNS (45) ──────────────────────────────────────────────────── [Profile] ── │   ║
║  │                                                                                     │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │ Column                                         Type              Null       │    │   ║
║  │  │─────────────────────────────────────────────────────────────────────────────│    │   ║
║  │  │ 🔑 DISPATCH_ID  ℹ                              T STRING           ◎        │    │   ║
║  │  │    DISPATCH_CODE                                T STRING           ◎        │    │   ║
║  │  │    DISPATCH_STATUS_ID  ℹ  → REF_DISPATCH_ST…   T STRING           ◎        │    │   ║
║  │  │    DISPATCH_TYPE_ID  ℹ    → REF_DISPATCH_TY…   T STRING           ◎        │    │   ║
║  │  │    ORIGIN_LOCATION_ID  ℹ  → REF_LOCATION        T STRING           ◎        │    │   ║
║  │  │    DESTINATION_LOCATION_ID  ℹ  → REF_LOCATION   T STRING           ◎        │    │   ║
║  │  │    CARRIER_ID  ℹ             → REF_CARRIER       T STRING           ◎        │    │   ║
║  │  │    CREATED_BY_USER_ID  ℹ     → REF_OPERATOR      T STRING           ◎        │    │   ║
║  │  │    HANDLED_BY_USER_ID  ℹ     → REF_OPERATOR      T STRING           ◎        │    │   ║
║  │  │    DOMAIN_ID  ℹ              → REF_DOMAIN        T STRING           ◎        │    │   ║
║  │  │    OPS_DEPARTMENT_ID  ℹ      → REF_OPS_DEPT      T STRING           ◎        │    │   ║
║  │  │    MASTER_DISPATCH_ID  ℹ     → REF_MASTER_D…    T STRING           ◎        │    │   ║
║  │  │    DOCUMENT_NUMBER                              T STRING           ◎        │    │   ║
║  │  │    CLIENT_REFERENCE                             T STRING           ◎        │    │   ║
║  │  │    DEPARTURE_DELAY_REASON                       T STRING           ◎        │    │   ║
║  │  │    ARRIVAL_DELAY_REASON                         T STRING           ◎        │    │   ║
║  │  │    TRANSPORT_DETAILS_GRID                       T STRING           ◎        │    │   ║
║  │  │    AGENTS_FINANCIALS_GRID                       T STRING           ◎        │    │   ║
║  │  │    CHARGEABLE_WEIGHT                            # NUMERIC          ◎        │    │   ║
║  │  │    DEADLINE_DT                                  📅 TIMESTAMP       ◎        │    │   ║
║  │  │    CUTOFF_DATETIME                              📅 TIMESTAMP       ◎        │    │   ║
║  │  │    DOCUMENTS_CUTOFF_DATETIME                    📅 TIMESTAMP       ◎        │    │   ║
║  │  │    PICKLIST_CUTOFF_DATETIME                     📅 TIMESTAMP       ◎        │    │   ║
║  │  │    PORT_CUTOFF_DATETIME                         📅 TIMESTAMP       ◎        │    │   ║
║  │  │    DANGEROUS_GOODS_CUTOFF_DATETIME              📅 TIMESTAMP       ◎        │    │   ║
║  │  │    ALL_BOXES_ARRIVED                            ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_DRY_DOCK                                  ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_NO_REPACK                                 ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_WEEKEND_CONSOLIDATION                     ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_NO_BILLING                                ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_JFK                                       ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_IAH                                       ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_NORMAL_FARE                               ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_EXPRESS_FARE                               ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_OFF_LANDED                                ◈ BOOLEAN          ◎        │    │   ║
║  │  │    IS_COMPLICATED                               ◈ BOOLEAN          ◎        │    │   ║
║  │  │    LOADED_AT                                    📅 TIMESTAMP       ◎        │    │   ║
║  │  │    LAST_UPDATED_AT                              📅 TIMESTAMP       ◎        │    │   ║
║  │  │    SOURCE_SYSTEM                                T STRING           ◎        │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ─── RELATIONSHIPS (13) ───────────────────────────────────────────────────────── ─ │   ║
║  │                                                                                     │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │  References (10 outgoing)                                                   │    │   ║
║  │  │  ─────────────────────────────────────────────────────────────────────────  │    │   ║
║  │  │  DISPATCH_STATUS_ID          →  REF_DISPATCH_STATUS       via STATUS_ID     │    │   ║
║  │  │  DISPATCH_TYPE_ID            →  REF_DISPATCH_TYPE         via TYPE_ID       │    │   ║
║  │  │  ORIGIN_LOCATION_ID          →  REF_LOCATION              via LOCATION_ID   │    │   ║
║  │  │  DESTINATION_LOCATION_ID     →  REF_LOCATION              via LOCATION_ID   │    │   ║
║  │  │  CARRIER_ID                  →  REF_CARRIER               via CARRIER_ID    │    │   ║
║  │  │  CREATED_BY_USER_ID          →  REF_OPERATOR              via OPERATOR_ID   │    │   ║
║  │  │  HANDLED_BY_USER_ID          →  REF_OPERATOR              via OPERATOR_ID   │    │   ║
║  │  │  DOMAIN_ID                   →  REF_DOMAIN                via DOMAIN_ID     │    │   ║
║  │  │  OPS_DEPARTMENT_ID           →  REF_OPS_DEPARTMENT        via OPS_DEPT_ID   │    │   ║
║  │  │  MASTER_DISPATCH_ID          →  REF_MASTER_DISPATCH       via M_DISPATCH_ID │    │   ║
║  │  │                                                                             │    │   ║
║  │  │  Referenced by (3 incoming)                                                 │    │   ║
║  │  │  ─────────────────────────────────────────────────────────────────────────  │    │   ║
║  │  │  MAP_DISPATCH_EVENT          ←  via DISPATCH_ID                             │    │   ║
║  │  │  AUX_BOX_TO_DISPATCH         ←  via DISPATCH_ID                             │    │   ║
║  │  │  AUX_ORDER_TO_DISPATCH       ←  via DISPATCH_ID                             │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ─── DATA PREVIEW ────────────────────────────────────────────────────────────── ─  │   ║
║  │                                                                                     │   ║
║  │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐    │   ║
║  │  ┊                        ⊞  Load Data Preview                                ┊    │   ║
║  │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘    │   ║
║  │                                                                                     │   ║
║  └─────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Financial             —                              ⊞ 34   ◫ 5.9M    ◪ 481.7 MB │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Order                 Tracks all order…   verified   ⊞ 38   ◫ 511.5K   ◪ 36.7 MB │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝

NOTE: The column table shows ALL 45 columns (no "show more" — scroll within
the column list's max-h container). For smaller tables (5-10 columns) the
entire list is visible without scrolling.

The → link annotations in the column list (e.g., "→ REF_LOCATION") are
clickable — they navigate to that table in the list.

The relationships section repeats the same info in a different format,
showing the full FK mapping (source column → target table via target column).
This is useful because columns show "where does this FK point?" while
relationships show the full picture including incoming references.
```

### D.1c — Expanded with data preview loaded

```
╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║  ...toolbar...                                                                              ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                             ║
║  ▼ FACT TABLES                                                                              ║
║                                                                                             ║
║  ┌─ ▾ ──────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch              —                              ⊞ 45   ◫ 428.8K   ◪ 42.7 MB  │   ║
║  │──────────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                      │   ║
║  │  ...description / stats / tags...                                                    │   ║
║  │                                                                                      │   ║
║  │  ─── COLUMNS (45) ───────────────────────────────────────────────────── [Profile] ── │   ║
║  │  ┌─── max-h: 400px, scrollable ─────────────────────────────────────────────────┐   │   ║
║  │  │ 🔑 DISPATCH_ID  ℹ                              T STRING           ◎          │   │   ║
║  │  │    DISPATCH_CODE                                T STRING           ◎          │   │   ║
║  │  │    DISPATCH_STATUS_ID  ℹ  → REF_DISPATCH_ST…   T STRING           ◎          │   │   ║
║  │  │    ... (scrollable, all 45 columns)                                           │   │   ║
║  │  │    LAST_UPDATED_AT                              📅 TIMESTAMP       ◎          │   │   ║
║  │  │    SOURCE_SYSTEM                                T STRING           ◎          │   │   ║
║  │  └───────────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                      │   ║
║  │  ─── RELATIONSHIPS (13) ─────────────────────────────────────────────────────────── │   ║
║  │  ┌───────────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │  References (10)                                                              │   │   ║
║  │  │  STATUS_ID → REF_DISPATCH_STATUS    TYPE_ID → REF_DISPATCH_TYPE               │   │   ║
║  │  │  ORIGIN_LOCATION_ID → REF_LOCATION  DEST_LOCATION_ID → REF_LOCATION           │   │   ║
║  │  │  CARRIER_ID → REF_CARRIER           CREATED_BY → REF_OPERATOR                 │   │   ║
║  │  │  HANDLED_BY → REF_OPERATOR          DOMAIN_ID → REF_DOMAIN                    │   │   ║
║  │  │  OPS_DEPT_ID → REF_OPS_DEPARTMENT   MASTER_DISPATCH_ID → REF_MASTER_DISPATCH  │   │   ║
║  │  │                                                                               │   │   ║
║  │  │  Referenced by (3)                                                            │   │   ║
║  │  │  ← MAP_DISPATCH_EVENT  ← AUX_BOX_TO_DISPATCH  ← AUX_ORDER_TO_DISPATCH        │   │   ║
║  │  └───────────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                      │   ║
║  │  ─── DATA PREVIEW ────────────────────────────────── Showing 20 of 428.8K rows ──── │   ║
║  │  ┌─── max-h: 300px, scrollable both axes ───────────────────────────────────────┐   │   ║
║  │  │ DISPATCH_ID │DISPATCH_CO│STATUS_ID│TYPE_ID │ORIGIN_LOC│DEST_LOCA│CARRIER_ID  │   │   ║
║  │  │─────────────┼───────────┼─────────┼────────┼──────────┼─────────┼────────────│   │   ║
║  │  │ DSP-00001   │ DC-2024-A │ ACTV    │ AIR    │ LOC-0012 │LOC-0089 │ CRR-0045   │   │   ║
║  │  │ DSP-00002   │ DC-2024-B │ ACTV    │ SEA    │ LOC-0034 │LOC-0012 │ CRR-0012   │   │   ║
║  │  │ DSP-00003   │ DC-2024-C │ COMP    │ AIR    │ LOC-0089 │LOC-0045 │ CRR-0045   │   │   ║
║  │  │ DSP-00004   │ DC-2024-D │ PEND    │ ROAD   │ LOC-0012 │LOC-0067 │ CRR-0078   │   │   ║
║  │  │ DSP-00005   │ DC-2024-E │ ACTV    │ AIR    │ LOC-0067 │LOC-0034 │ CRR-0023   │   │   ║
║  │  │ ...15 more rows                                                              │   │   ║
║  │  └───────────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                      │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                             ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Financial             —                              ⊞ 34   ◫ 5.9M    ◪ 481.7 MB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                             ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
```

### D.1d — Small table expanded (few columns, no scroll needed)

```
║  ▼ REFERENCE                                                                               ║
║                                                                                            ║
║  ...                                                                                       ║
║  ┌─ ▾ ─────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch Status       Lookup table f…  verified     ⊞ 6    ◫ 15       ◪ 2.8 KB   │   ║
║  │─────────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                     │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │ Lookup table for dispatch lifecycle…                 Tags: verified [+ tag]  │    │   ║
║  │  │ ⊞ 6 columns · ◫ 15 rows · ◪ 2.8 KB · ◷ 26h ago                             │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ─── COLUMNS (6) ─────────────────────────────────────────────────── [Profile] ─── │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │ 🔑 DISPATCH_STATUS_ID  ℹ               T STRING           ◎               │    │   ║
║  │  │    DISPATCH_STATUS_CODE                 T STRING           ◎               │    │   ║
║  │  │    DISPATCH_STATUS_NAME                 T STRING           ◎               │    │   ║
║  │  │    IS_ACTIVE                            ◈ BOOLEAN          ◎               │    │   ║
║  │  │    LOADED_AT                            📅 TIMESTAMP       ◎               │    │   ║
║  │  │    SOURCE_SYSTEM                        T STRING           ◎               │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ─── RELATIONSHIPS (1) ────────────────────────────────────────────────────────── ─ │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │  Referenced by (1 incoming)                                                 │    │   ║
║  │  │  ← FCT_DISPATCH   via DISPATCH_STATUS_ID                                   │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ─── DATA PREVIEW ────────────────────────────────────────────────────────────── ─  │   ║
║  │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐    │   ║
║  │  ┊                        ⊞  Load Data Preview                                ┊    │   ║
║  │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘    │   ║
║  │                                                                                     │   ║
║  └─────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch Type         —                              ⊞ 6    ◫ 22       ◪ 3.5 KB  │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║

NOTE: For small tables (≤10 columns), all columns are visible without scrolling.
      The entire expanded card fits compactly, showing the next table card below.
      Total expanded height for a 6-column table: ~350px (vs ~2000px for 45 columns).
```

---
---

## D.2 — SIDE-BY-SIDE LAYOUT (columns + relationships side by side, preview below)

> Same toolbar and card structure as D.1, but the expanded detail uses a
> two-column layout: Columns on the left, Relationships on the right,
> Data Preview spanning full width below.

### D.2a — Table expanded: side-by-side layout

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary        [ Table Browser ]  ERD Diagram            🔍 Search ⌘K      🌙 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║  🔍 Search tables...       [FCT 3] [REF 42] [DIM 1] [FCTH 1] [MAP 6] [AUX 7]             ║
║  ↕ [Category ↑]  Name  Rows  Cols  Size                  QA 39%   ⚠ 27   🏷 verified     ║
╠══════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                            ║
║  ▼ FACT TABLES ──────────────────────────────────────── 3 tables · 6.8M rows · 561 MB ──  ║
║                                                                                            ║
║  ┌─ ▾ ─────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch              —                              ⊞ 45   ◫ 428.8K   ◪ 42.7 MB │   ║
║  │─────────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                     │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │ No description — click to add                            Tags: [+ tag]      │    │   ║
║  │  │ ⊞ 45 columns · ◫ 428.8K rows · ◪ 42.7 MB · ◷ 26h ago                      │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ┌─ COLUMNS (45) ─── [Profile] ─────────┐  ┌─ RELATIONSHIPS (13) ──────────────┐  │   ║
║  │  │                                       │  │                                    │  │   ║
║  │  │ Column              Type        Null  │  │  References (10 outgoing)          │  │   ║
║  │  │───────────────────────────────────────│  │  ────────────────────────────────  │  │   ║
║  │  │ 🔑 DISPATCH_ID  ℹ   T STR        ◎   │  │  STATUS_ID                         │  │   ║
║  │  │    DISPATCH_CODE     T STR        ◎   │  │   → REF_DISPATCH_STATUS            │  │   ║
║  │  │    DISPATCH_STAT…ℹ   T STR        ◎   │  │  TYPE_ID                           │  │   ║
║  │  │    DISPATCH_TYPE…ℹ   T STR        ◎   │  │   → REF_DISPATCH_TYPE              │  │   ║
║  │  │    ORIGIN_LOCAT… ℹ   T STR        ◎   │  │  ORIGIN_LOCATION_ID                │  │   ║
║  │  │    DEST_LOCATIO… ℹ   T STR        ◎   │  │   → REF_LOCATION                  │  │   ║
║  │  │    CARRIER_ID  ℹ     T STR        ◎   │  │  DESTINATION_LOCATION_ID            │  │   ║
║  │  │    CREATED_BY_U… ℹ   T STR        ◎   │  │   → REF_LOCATION                  │  │   ║
║  │  │    HANDLED_BY_U… ℹ   T STR        ◎   │  │  CARRIER_ID                        │  │   ║
║  │  │    DOMAIN_ID  ℹ      T STR        ◎   │  │   → REF_CARRIER                   │  │   ║
║  │  │    OPS_DEPARTME… ℹ   T STR        ◎   │  │  CREATED_BY_USER_ID                │  │   ║
║  │  │    MASTER_DISPA… ℹ   T STR        ◎   │  │   → REF_OPERATOR                  │  │   ║
║  │  │    DOCUMENT_NUMBER   T STR        ◎   │  │  HANDLED_BY_USER_ID                │  │   ║
║  │  │    CLIENT_REFERENCE  T STR        ◎   │  │   → REF_OPERATOR                  │  │   ║
║  │  │    DEPARTURE_DEL…    T STR        ◎   │  │  DOMAIN_ID                         │  │   ║
║  │  │    ARRIVAL_DELAY…    T STR        ◎   │  │   → REF_DOMAIN                    │  │   ║
║  │  │    TRANSPORT_DET…    T STR        ◎   │  │  OPS_DEPARTMENT_ID                  │  │   ║
║  │  │    AGENTS_FINANC…    T STR        ◎   │  │   → REF_OPS_DEPARTMENT             │  │   ║
║  │  │    CHARGEABLE_WE…   # NUM        ◎   │  │  MASTER_DISPATCH_ID                 │  │   ║
║  │  │    DEADLINE_DT      📅 TST        ◎   │  │   → REF_MASTER_DISPATCH            │  │   ║
║  │  │    CUTOFF_DATETI…   📅 TST        ◎   │  │                                    │  │   ║
║  │  │    DOCUMENTS_CUT…   📅 TST        ◎   │  │  Referenced by (3 incoming)        │  │   ║
║  │  │    PICKLIST_CUTO…   📅 TST        ◎   │  │  ────────────────────────────────  │  │   ║
║  │  │    PORT_CUTOFF_D…   📅 TST        ◎   │  │  ← MAP_DISPATCH_EVENT              │  │   ║
║  │  │    DANGEROUS_GOO…   📅 TST        ◎   │  │     via DISPATCH_ID                │  │   ║
║  │  │    ALL_BOXES_ARR…   ◈ BOOL       ◎   │  │  ← AUX_BOX_TO_DISPATCH             │  │   ║
║  │  │    IS_DRY_DOCK      ◈ BOOL       ◎   │  │     via DISPATCH_ID                │  │   ║
║  │  │    IS_NO_REPACK     ◈ BOOL       ◎   │  │  ← AUX_ORDER_TO_DISPATCH           │  │   ║
║  │  │    IS_WEEKEND_CO…   ◈ BOOL       ◎   │  │     via DISPATCH_ID                │  │   ║
║  │  │    IS_NO_BILLING    ◈ BOOL       ◎   │  │                                    │  │   ║
║  │  │    IS_JFK           ◈ BOOL       ◎   │  │                                    │  │   ║
║  │  │    IS_IAH           ◈ BOOL       ◎   │  │                                    │  │   ║
║  │  │    IS_NORMAL_FARE   ◈ BOOL       ◎   │  │                                    │  │   ║
║  │  │    IS_EXPRESS_FARE  ◈ BOOL       ◎   │  │                                    │  │   ║
║  │  │    IS_OFF_LANDED    ◈ BOOL       ◎   │  │                                    │  │   ║
║  │  │    IS_COMPLICATED   ◈ BOOL       ◎   │  │                                    │  │   ║
║  │  │    LOADED_AT        📅 TST        ◎   │  │                                    │  │   ║
║  │  │    LAST_UPDATED_AT  📅 TST        ◎   │  │                                    │  │   ║
║  │  │    SOURCE_SYSTEM    T STR        ◎   │  │                                    │  │   ║
║  │  └───────────────────────────────────────┘  └────────────────────────────────────┘  │   ║
║  │                                                                                     │   ║
║  │  ─── DATA PREVIEW ──────────────────────────────────── Showing 20 of 428.8K rows ─  │   ║
║  │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐    │   ║
║  │  ┊                        ⊞  Load Data Preview                                ┊    │   ║
║  │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘    │   ║
║  │                                                                                     │   ║
║  └─────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Financial             —                              ⊞ 34   ◫ 5.9M    ◪ 481.7 MB │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝

KEY ADVANTAGE: Columns and relationships are visible simultaneously.
               User can cross-reference "_ID" columns with their FK targets
               without scrolling between sections.

LAYOUT: ~60% width for columns, ~40% width for relationships.
        Both panels scroll independently if content overflows.
        Data preview spans full width below.
```

### D.2b — Small table expanded (side-by-side, few columns)

```
║  ┌─ ▾ ─────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch Status       Lookup table f…  verified     ⊞ 6    ◫ 15       ◪ 2.8 KB   │   ║
║  │─────────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                     │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   ║
║  │  │ Lookup table for dispatch lifecycle…                 Tags: verified [+ tag]  │    │   ║
║  │  │ ⊞ 6 columns · ◫ 15 rows · ◪ 2.8 KB · ◷ 26h ago                             │    │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                     │   ║
║  │  ┌─ COLUMNS (6) ─── [Profile] ──────────┐  ┌─ RELATIONSHIPS (1) ───────────────┐  │   ║
║  │  │                                       │  │                                    │  │   ║
║  │  │ 🔑 DISPATCH_STATUS_ID  ℹ  T STR  ◎   │  │  Referenced by (1 incoming)        │  │   ║
║  │  │    DISPATCH_STATUS_CODE    T STR  ◎   │  │  ────────────────────────────────  │  │   ║
║  │  │    DISPATCH_STATUS_NAME    T STR  ◎   │  │  ← FCT_DISPATCH                   │  │   ║
║  │  │    IS_ACTIVE              ◈ BOOL  ◎   │  │     via DISPATCH_STATUS_ID         │  │   ║
║  │  │    LOADED_AT              📅 TST   ◎   │  │                                    │  │   ║
║  │  │    SOURCE_SYSTEM           T STR  ◎   │  │  No outgoing references            │  │   ║
║  │  │                                       │  │                                    │  │   ║
║  │  └───────────────────────────────────────┘  └────────────────────────────────────┘  │   ║
║  │                                                                                     │   ║
║  │  ─── DATA PREVIEW ────────────────────────────────────────────────────────────── ─  │   ║
║  │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐    │   ║
║  │  ┊                        ⊞  Load Data Preview                                ┊    │   ║
║  │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘    │   ║
║  │                                                                                     │   ║
║  └─────────────────────────────────────────────────────────────────────────────────────┘   ║

NOTE: For small tables, the side-by-side layout is very compact.
      Both columns and relationships fit without scrolling.
      The expanded card is only ~280px tall — the next card is still visible.
```

### D.2c — Data preview loaded (side-by-side)

```
║  ┌─ ▾ ─────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch Status       Lookup table f…  verified     ⊞ 6    ◫ 15       ◪ 2.8 KB   │   ║
║  │─────────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                     │   ║
║  │  ...description / stats / tags...                                                   │   ║
║  │                                                                                     │   ║
║  │  ┌─ COLUMNS (6) ─── [Profile] ──────────┐  ┌─ RELATIONSHIPS (1) ───────────────┐  │   ║
║  │  │ 🔑 DISPATCH_STATUS_ID  ℹ  T STR  ◎   │  │  Referenced by (1 incoming)        │  │   ║
║  │  │    DISPATCH_STATUS_CODE    T STR  ◎   │  │  ← FCT_DISPATCH                   │  │   ║
║  │  │    DISPATCH_STATUS_NAME    T STR  ◎   │  │     via DISPATCH_STATUS_ID         │  │   ║
║  │  │    IS_ACTIVE              ◈ BOOL  ◎   │  │                                    │  │   ║
║  │  │    LOADED_AT              📅 TST   ◎   │  │  No outgoing references            │  │   ║
║  │  │    SOURCE_SYSTEM           T STR  ◎   │  │                                    │  │   ║
║  │  └───────────────────────────────────────┘  └────────────────────────────────────┘  │   ║
║  │                                                                                     │   ║
║  │  ─── DATA PREVIEW ──────────────────────────────────────── Showing 15 of 15 rows ─  │   ║
║  │  ┌───────────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │ STATUS_ID  │ STATUS_CODE │ STATUS_NAME         │ IS_ACTIVE │ LOADED_AT       │   │   ║
║  │  │────────────┼─────────────┼─────────────────────┼───────────┼─────────────────│   │   ║
║  │  │ STS-001    │ NEW         │ New Dispatch         │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-002    │ ACTV        │ Active               │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-003    │ PICK        │ Ready for Pickup     │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-004    │ TRNS        │ In Transit           │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-005    │ DLVR        │ Delivered            │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-006    │ COMP        │ Completed            │ false     │ 2026-03-06 14:… │   │   ║
║  │  │ STS-007    │ CNCL        │ Cancelled            │ false     │ 2026-03-06 14:… │   │   ║
║  │  │ STS-008    │ HOLD        │ On Hold              │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-009    │ PEND        │ Pending Approval     │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-010    │ RJCT        │ Rejected             │ false     │ 2026-03-06 14:… │   │   ║
║  │  │ STS-011    │ EXPR        │ Expired              │ false     │ 2026-03-06 14:… │   │   ║
║  │  │ STS-012    │ ARCH        │ Archived             │ false     │ 2026-03-06 14:… │   │   ║
║  │  │ STS-013    │ DRFT        │ Draft                │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-014    │ REVW        │ Under Review         │ true      │ 2026-03-06 14:… │   │   ║
║  │  │ STS-015    │ CSTM        │ Custom               │ true      │ 2026-03-06 14:… │   │   ║
║  │  └───────────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                     │   ║
║  └─────────────────────────────────────────────────────────────────────────────────────┘   ║

NOTE: For a 15-row lookup table, the entire preview fits without scrolling.
      The complete table detail (columns + relationships + full preview)
      fits in ~500px — very compact for small reference tables.
```

---
---

## COMPARISON: D.1 vs D.2

```
┌─────────────────────────────────────┬──────────────────┬──────────────────┐
│ Aspect                              │ D.1 (Vertical)   │ D.2 (Side-by-side)│
├─────────────────────────────────────┼──────────────────┼──────────────────┤
│ Expanded height (45-col table)      │ ~1600px          │ ~1100px          │
│ Expanded height (6-col table)       │ ~350px           │ ~280px           │
│ Columns + relationships visible     │ Must scroll      │ Both visible     │
│ together?                           │ between them     │ simultaneously   │
│ Column name truncation              │ Minimal          │ More truncation  │
│ Column description space            │ Full width       │ Constrained      │
│ Relationship detail                 │ Full width       │ ~40% width       │
│ Cross-reference FK ↔ columns        │ Harder (scroll)  │ Easy (side-by-side)│
│ Data preview width                  │ Full             │ Full             │
│ Works well for small tables         │ ✓ Great          │ ✓ Great          │
│ Works well for large tables         │ ✓ Good (scroll)  │ ✓ Better (less h)│
│ Implementation complexity           │ Low              │ Medium           │
│ Responsive (narrow screens)         │ ✓ Natural stack  │ Needs fallback   │
│ Profile drawer (expand column)      │ Full width       │ Left panel only  │
└─────────────────────────────────────┴──────────────────┴──────────────────┘
```

### Key trade-offs:

**D.1 (Vertical)** is simpler and gives each section maximum width — good for
long column names and column descriptions. But for tables with many columns
(like FCT_DISPATCH with 45), the relationships section is far below and
requires scrolling past all columns.

**D.2 (Side-by-side)** saves ~30% vertical space on large tables and lets
you see columns and relationships together — the FK columns in the left
panel visually correspond to the relationship entries on the right. But
column names get truncated more, and on narrow screens it would need to
fall back to vertical stacking.

**Responsive behavior for D.2**: Below ~900px width, automatically stack
vertically (fall back to D.1 layout). Above ~900px, use side-by-side.
