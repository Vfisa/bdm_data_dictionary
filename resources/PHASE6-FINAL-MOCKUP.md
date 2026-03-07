# Phase 6 — Final Mockup (Refined)

> Incorporates all feedback:
> - KPI hover popover: confirmed
> - Category chips: short codes, to be validated live
> - Collapsed cards: name + description subtitle + "N columns" only (no rows/size)
> - Description as subtitle line under name, not inline
> - Vertical (D.1) layout for expanded detail
> - Column descriptions shown as subtitle under column name
> - Section order: Columns → Relationships → Data Preview

---

## COLLAPSED CARD DESIGN

```
CURRENT CARD (~130px):
┌──────────────────────────────────────────────────────────────────────────────┐
│ █ FCT  Dispatch                                                             │
│        FCT_DISPATCH                                                          │
│        No description                                                        │
│        ⊞ 45   ◫ 428.8K   ◪ 42.7 MB                                          │
└──────────────────────────────────────────────────────────────────────────────┘

NEW CARD (~52px):
┌──────────────────────────────────────────────────────────────────────────────┐
│ █ Dispatch                                                       45 columns │
│   Tracks all dispatch operations across air freight shipments…              │
└──────────────────────────────────────────────────────────────────────────────┘

NEW CARD — no description (~40px):
┌──────────────────────────────────────────────────────────────────────────────┐
│ █ Financial                                                      34 columns │
│   No description                                                            │
└──────────────────────────────────────────────────────────────────────────────┘

ANATOMY:
  Line 1: [color bar] [table name — human-friendly]          [N columns]
  Line 2: [description snippet as muted subtitle, or "No description" italic]

  • Color bar: 4px left border in category color (same as current)
  • Table name: text-base font-medium (primary text)
  • "N columns": text-sm text-muted-foreground, right-aligned
  • Description: text-sm text-muted-foreground, single line, truncated with …
  • "No description": italic, slightly dimmer (text-muted-foreground/60)
  • No rows, no size, no technical name (FCT_DISPATCH) on collapsed card
  • Tag dots: small colored circles after "N columns" if table has tags
```

---

## DEFAULT STATE (no table expanded)

```
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary       [ Table Browser ]  ERD Diagram           🔍 Search ⌘K     🌙 ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║  🔍 Search tables...      [FCT 3] [REF 42] [DIM 1] [FCTH 1] [MAP 6] [AUX 7]           ║
║  ↕ [Category ↑]  Name  Columns                           QA 39%   ⚠ 27   🏷 verified  ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║  ▼ FACT TABLES (3) ────────────────────────────────────────────────────────────────────  ║
║                                                                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Dispatch                                                            45 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Financial                                                           34 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Order                                                               38 columns  │  ║
║  │   Tracks all order operations across air freight shipments…                       │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                         ║
║  ▼ FACT HISTORICAL (1) ───────────────────────────────────────────────────────────────  ║
║                                                                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Currency Conversion Rate                                            12 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                         ║
║  ▼ DIMENSION (1) ─────────────────────────────────────────────────────────────────────  ║
║                                                                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Date                                                                 8 columns  │  ║
║  │   Calendar dimension table with daily granularity, fiscal periods…                │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                         ║
║  ▼ REFERENCE (42) ────────────────────────────────────────────────────────────────────  ║
║                                                                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Agent                                                               15 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Box                                                                 12 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Carrier                                                             18 columns  │  ║
║  │   Air freight carrier master data including routes and capacity…                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ City                                                                 8 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Client                                                              25 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Client Group                                                        10 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Company                                                             12 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Continent                                                            5 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Country                                                              8 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Currency                                                            10 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Currency Conversion Rate Type                                        6 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║  │ ...30 more REF tables (scroll ↓)                                                  │  ║
║                                                                                         ║
║  ► MAPPING (6) ───────────────────────────────────────────────────────────────────────  ║
║  ► AUXILIARY (7) ─────────────────────────────────────────────────────────────────────  ║
║                                                                                         ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝

METRICS:
  Header:            56px
  Toolbar:           76px (2 rows)
  Content starts:   132px
  Card height:      ~52px (name + subtitle)
  Category header:  ~28px
  ──────────────────────────
  Visible in 900px viewport:
    768px content area ÷ 52px per card = ~14 cards
    Plus 4 category headers (~112px) = still ~12-13 tables visible

  Current: ~2.5 cards visible → New: ~13 cards visible (5× improvement)
```

---

## EXPANDED CARD — Large Table (FCT_DISPATCH, 45 columns)

```
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║  🗄 Data Dictionary       [ Table Browser ]  ERD Diagram           🔍 Search ⌘K     🌙 ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║  🔍 Search tables...      [FCT 3] [REF 42] [DIM 1] [FCTH 1] [MAP 6] [AUX 7]           ║
║  ↕ [Category ↑]  Name  Columns                           QA 39%   ⚠ 27   🏷 verified  ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║  ▼ FACT TABLES (3) ────────────────────────────────────────────────────────────────────  ║
║                                                                                         ║
║  ┌─ ▾ ──────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch                                                        45 columns     │   ║
║  │   No description                                                                 │   ║
║  │──────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                   │   ║
║  │  ┌────────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │ No description — click to add                          Tags: [+ tag]       │   │   ║
║  │  │ ⊞ 45 columns · ◫ 428.8K rows · ◪ 42.7 MB · ◷ 26h ago                     │   │   ║
║  │  └────────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                   │   ║
║  │  ─── COLUMNS (45) ────────────────────────────────────────────── [Profile] ─────  │   ║
║  │                                                                                   │   ║
║  │  ┌─── scrollable, max-h: 400px ─────────────────────────────────────────────┐    │   ║
║  │  │ Column                                                 Type        Null  │    │   ║
║  │  │──────────────────────────────────────────────────────────────────────────│    │   ║
║  │  │ 🔑 DISPATCH_ID                                         T STRING     ◎    │    │   ║
║  │  │    Unique identifier for each dispatch                                   │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    DISPATCH_CODE                                        T STRING     ◎    │    │   ║
║  │  │    Human-readable dispatch reference code                                │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    DISPATCH_STATUS_ID  ℹ  → REF_DISPATCH_STATUS         T STRING     ◎    │    │   ║
║  │  │    FK to dispatch lifecycle status lookup                                │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    DISPATCH_TYPE_ID  ℹ  → REF_DISPATCH_TYPE             T STRING     ◎    │    │   ║
║  │  │    FK to dispatch type (air, sea, road, rail)                            │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    ORIGIN_LOCATION_ID  ℹ  → REF_LOCATION                T STRING     ◎    │    │   ║
║  │  │    FK to origin pickup location                                          │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    DESTINATION_LOCATION_ID  ℹ  → REF_LOCATION            T STRING     ◎    │    │   ║
║  │  │    FK to final delivery destination                                      │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    CARRIER_ID  ℹ  → REF_CARRIER                         T STRING     ◎    │    │   ║
║  │  │    FK to carrier handling the shipment                                   │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    CREATED_BY_USER_ID  ℹ  → REF_OPERATOR                T STRING     ◎    │    │   ║
║  │  │    No description                                                        │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    HANDLED_BY_USER_ID  ℹ  → REF_OPERATOR                T STRING     ◎    │    │   ║
║  │  │    No description                                                        │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    DOMAIN_ID  ℹ  → REF_DOMAIN                           T STRING     ◎    │    │   ║
║  │  │    No description                                                        │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    OPS_DEPARTMENT_ID  ℹ  → REF_OPS_DEPARTMENT            T STRING     ◎    │    │   ║
║  │  │    No description                                                        │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    MASTER_DISPATCH_ID  ℹ  → REF_MASTER_DISPATCH          T STRING     ◎    │    │   ║
║  │  │    No description                                                        │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    DOCUMENT_NUMBER                                      T STRING     ◎    │    │   ║
║  │  │    No description                                                        │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    CLIENT_REFERENCE                                     T STRING     ◎    │    │   ║
║  │  │    No description                                                        │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    CHARGEABLE_WEIGHT                                    # NUMERIC    ◎    │    │   ║
║  │  │    Weight used for billing calculation in kg                             │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    DEADLINE_DT                                          📅 TIMESTAMP  ◎    │    │   ║
║  │  │    Final deadline for dispatch completion                                │    │   ║
║  │  │                                                                          │    │   ║
║  │  │    ... (scroll for 28 more columns)                                      │    │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                                   │   ║
║  │  ─── RELATIONSHIPS (13) ──────────────────────────────────────────────────────── │   ║
║  │                                                                                   │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐     │   ║
║  │  │  References (10 outgoing)                                                │     │   ║
║  │  │  ──────────────────────────────────────────────────────────────────────  │     │   ║
║  │  │  DISPATCH_STATUS_ID          →  REF_DISPATCH_STATUS                      │     │   ║
║  │  │  DISPATCH_TYPE_ID            →  REF_DISPATCH_TYPE                        │     │   ║
║  │  │  ORIGIN_LOCATION_ID          →  REF_LOCATION                             │     │   ║
║  │  │  DESTINATION_LOCATION_ID     →  REF_LOCATION                             │     │   ║
║  │  │  CARRIER_ID                  →  REF_CARRIER                              │     │   ║
║  │  │  CREATED_BY_USER_ID          →  REF_OPERATOR                             │     │   ║
║  │  │  HANDLED_BY_USER_ID          →  REF_OPERATOR                             │     │   ║
║  │  │  DOMAIN_ID                   →  REF_DOMAIN                               │     │   ║
║  │  │  OPS_DEPARTMENT_ID           →  REF_OPS_DEPARTMENT                       │     │   ║
║  │  │  MASTER_DISPATCH_ID          →  REF_MASTER_DISPATCH                      │     │   ║
║  │  │                                                                          │     │   ║
║  │  │  Referenced by (3 incoming)                                              │     │   ║
║  │  │  ──────────────────────────────────────────────────────────────────────  │     │   ║
║  │  │  MAP_DISPATCH_EVENT          ←  via DISPATCH_ID                          │     │   ║
║  │  │  AUX_BOX_TO_DISPATCH         ←  via DISPATCH_ID                          │     │   ║
║  │  │  AUX_ORDER_TO_DISPATCH       ←  via DISPATCH_ID                          │     │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘     │   ║
║  │                                                                                   │   ║
║  │  ─── DATA PREVIEW ───────────────────────────────────────────────────────────── ─ │   ║
║  │                                                                                   │   ║
║  │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐     │   ║
║  │  ┊                       ⊞  Load Data Preview                              ┊     │   ║
║  │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘     │   ║
║  │                                                                                   │   ║
║  └───────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Financial                                                           34 columns  │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                         ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

### Column row detail — how descriptions render

```
COLUMN WITH DESCRIPTION:
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔑 DISPATCH_ID                                         T STRING     ◎   │
│    Unique identifier for each dispatch                                  │
├──────────────────────────────────────────────────────────────────────────┤
│    CHARGEABLE_WEIGHT                                   # NUMERIC    ◎   │
│    Weight used for billing calculation in kg                            │
└──────────────────────────────────────────────────────────────────────────┘

COLUMN WITHOUT DESCRIPTION:
┌──────────────────────────────────────────────────────────────────────────┐
│    DOCUMENT_NUMBER                                     T STRING     ◎   │
│    No description                                                       │
└──────────────────────────────────────────────────────────────────────────┘

FK COLUMN WITH DESCRIPTION:
┌──────────────────────────────────────────────────────────────────────────┐
│    DISPATCH_STATUS_ID  ℹ  → REF_DISPATCH_STATUS        T STRING     ◎   │
│    FK to dispatch lifecycle status lookup                                │
└──────────────────────────────────────────────────────────────────────────┘

ANATOMY:
  Line 1: [key icon?] [column_name] [ℹ if _ID] [→ FK target?]  [type badge]  [null]
  Line 2: [description in muted text, or "No description" in italic]

  • Line 1 = ~28px (column metadata)
  • Line 2 = ~20px (description subtitle)
  • Total per column row = ~48px (with description) or ~28px (collapsed, no desc)
  • Description is text-xs or text-sm, text-muted-foreground
  • "No description" = italic, text-muted-foreground/50 (very faint)
  • FK link (→ REF_DISPATCH_STATUS) is clickable, navigates to that table
  • Description is editable on click (same as current hover pencil pattern)

Every column always shows the subtitle line — consistent 2-line rows (~48px each).
  "No description" renders in faint italic (text-muted-foreground/50).
  This keeps the layout uniform and makes missing descriptions clearly visible,
  encouraging users to fill them in.
```

---

## EXPANDED CARD — Small Table (REF_DISPATCH_STATUS, 6 columns)

```
║  ┌─ ▾ ──────────────────────────────────────────────────────────────────────────────┐   ║
║  │ █ Dispatch Status                                                  6 columns     │   ║
║  │   Lookup table for dispatch lifecycle status codes                                │   ║
║  │──────────────────────────────────────────────────────────────────────────────────│   ║
║  │                                                                                   │   ║
║  │  ┌────────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │ Lookup table for dispatch lifecycle status codes      Tags: verified [+]   │   │   ║
║  │  │ ⊞ 6 columns · ◫ 15 rows · ◪ 2.8 KB · ◷ 26h ago                           │   │   ║
║  │  └────────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                   │   ║
║  │  ─── COLUMNS (6) ──────────────────────────────────────────────── [Profile] ────  │   ║
║  │                                                                                   │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐     │   ║
║  │  │ 🔑 DISPATCH_STATUS_ID                               T STRING       ◎    │     │   ║
║  │  │    Unique identifier for status                                          │     │   ║
║  │  │                                                                          │     │   ║
║  │  │    DISPATCH_STATUS_CODE                              T STRING       ◎    │     │   ║
║  │  │    Short code (NEW, ACTV, COMP…)                                         │     │   ║
║  │  │                                                                          │     │   ║
║  │  │    DISPATCH_STATUS_NAME                              T STRING       ◎    │     │   ║
║  │  │    Human-readable status label                                           │     │   ║
║  │  │                                                                          │     │   ║
║  │  │    IS_ACTIVE                                         ◈ BOOLEAN      ◎    │     │   ║
║  │  │    Whether this status represents an active dispatch                     │     │   ║
║  │  │                                                                          │     │   ║
║  │  │    LOADED_AT                                         📅 TIMESTAMP    ◎    │     │   ║
║  │  │                                                                          │     │   ║
║  │  │    SOURCE_SYSTEM                                     T STRING       ◎    │     │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘     │   ║
║  │                                                                                   │   ║
║  │  ─── RELATIONSHIPS (1) ───────────────────────────────────────────────────────── │   ║
║  │                                                                                   │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐     │   ║
║  │  │  Referenced by (1 incoming)                                              │     │   ║
║  │  │  ──────────────────────────────────────────────────────────────────────  │     │   ║
║  │  │  FCT_DISPATCH               ←  via DISPATCH_STATUS_ID                    │     │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘     │   ║
║  │                                                                                   │   ║
║  │  ─── DATA PREVIEW ───────────────────────────────────────────────────────────── ─ │   ║
║  │                                                                                   │   ║
║  │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐     │   ║
║  │  ┊                       ⊞  Load Data Preview                              ┊     │   ║
║  │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘     │   ║
║  │                                                                                   │   ║
║  └───────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │ █ Dispatch Type                                                    6 columns      │  ║
║  │   No description                                                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────────────┘  ║

Small table expanded height: ~420px.
Columns (6 with descriptions): ~300px
Relationships (1): ~60px
Data preview button: ~50px
The next card (Dispatch Type) is still visible below.
```

---

## EXPANDED WITH DATA PREVIEW LOADED

```
║  │  ─── DATA PREVIEW ──────────────────────────────── Showing 15 of 15 rows ──────── │   ║
║  │                                                                                   │   ║
║  │  ┌─── max-h: 300px, horizontal + vertical scroll ──────────────────────────┐     │   ║
║  │  │ STATUS_ID │STATUS_CODE│ STATUS_NAME          │IS_ACTIVE│ LOADED_AT      │     │   ║
║  │  │───────────┼───────────┼──────────────────────┼─────────┼────────────────│     │   ║
║  │  │ STS-001   │ NEW       │ New Dispatch          │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-002   │ ACTV      │ Active                │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-003   │ PICK      │ Ready for Pickup      │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-004   │ TRNS      │ In Transit            │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-005   │ DLVR      │ Delivered             │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-006   │ COMP      │ Completed             │ false   │ 2026-03-06 …  │     │   ║
║  │  │ STS-007   │ CNCL      │ Cancelled             │ false   │ 2026-03-06 …  │     │   ║
║  │  │ STS-008   │ HOLD      │ On Hold               │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-009   │ PEND      │ Pending Approval      │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-010   │ RJCT      │ Rejected              │ false   │ 2026-03-06 …  │     │   ║
║  │  │ STS-011   │ EXPR      │ Expired               │ false   │ 2026-03-06 …  │     │   ║
║  │  │ STS-012   │ ARCH      │ Archived              │ false   │ 2026-03-06 …  │     │   ║
║  │  │ STS-013   │ DRFT      │ Draft                 │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-014   │ REVW      │ Under Review          │ true    │ 2026-03-06 …  │     │   ║
║  │  │ STS-015   │ CSTM      │ Custom                │ true    │ 2026-03-06 …  │     │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘     │   ║
║  │                                                                                   │   ║
║  └───────────────────────────────────────────────────────────────────────────────────┘   ║
```

---

## CATEGORY GROUPS — COLLAPSED STATE

```
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║  ► FACT TABLES (3) ────────────────────────────────────────────────────────────────────  ║
║  ► FACT HISTORICAL (1) ───────────────────────────────────────────────────────────────  ║
║  ► DIMENSION (1) ─────────────────────────────────────────────────────────────────────  ║
║  ► REFERENCE (42) ────────────────────────────────────────────────────────────────────  ║
║  ► MAPPING (6) ───────────────────────────────────────────────────────────────────────  ║
║  ► AUXILIARY (7) ─────────────────────────────────────────────────────────────────────  ║
║                                                                                         ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣

All 60 tables represented in 6 lines (~170px).
Click ▼ to expand any group.
```

---

## TOOLBAR — KPI POPOVER DETAIL

```
Toolbar row 2:
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  ↕ [Category ↑]  Name  Columns                           QA 39%   ⚠ 27   🏷 verified  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
                                                             ↑
                                                     Hover or click reveals:
                                              ┌────────────────────────────────────┐
                                              │  Project Overview                   │
                                              │  ───────────────────────────────── │
                                              │  60 tables · 1,046 columns         │
                                              │  62.1M total rows · 3.2 GB         │
                                              │                                     │
                                              │  QA Score: 39%                      │
                                              │  ███████░░░░░░░░░░░░░░             │
                                              │                                     │
                                              │  ⚠ 27 tables missing description   │
                                              │  ⚠ 644 columns missing description │
                                              │  ✓ 0 empty tables                  │
                                              └────────────────────────────────────┘

⚠ 27 click behavior:
  Click cycles through stat filters (same as current KPI card clicks):
    → Missing table descriptions (27 tables)
    → Missing column descriptions (shows tables with uncovered columns)
    → Empty tables (0)
    → Clear filter

  Active filter shows ring/highlight on ⚠ badge + results text in toolbar:
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  ↕ [Category ↑]  Name  Columns    [⚠ 27 missing table desc ✕]   QA 39%  🏷 verified│
  └──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## SORT CONTROLS — UPDATED

```
Since we removed rows and size from collapsed cards, sort options adjust:

  ↕ [Category ↑]  Name  Columns

  • Category: sort by category priority (FCT→FCTH→DIM→REF→MAP→AUX), then alpha
  • Name: alphabetical by human-friendly name
  • Columns: by column count (most → fewest or reverse)

  Rows and Size sort options are removed since those values aren't visible
  in collapsed state. (They're still shown in expanded detail.)
```

---

## DESIGN DECISIONS SUMMARY

```
┌──────────────────────────────────┬────────────────────────────────────────────┐
│ Element                          │ Decision                                   │
├──────────────────────────────────┼────────────────────────────────────────────┤
│ Card collapsed                   │ Name + desc subtitle + "N columns"         │
│ Card collapsed — no rows/size    │ ✓ Only shown in expanded detail            │
│ Card collapsed — no tech name    │ ✓ FCT_DISPATCH hidden, only "Dispatch"     │
│ Description placement            │ Subtitle line under name (not inline)      │
│ Column descriptions              │ Subtitle under column name in column table │
│ Columns w/o description          │ Show "No description" faint italic subtitle│
│ Expanded section order           │ Columns → Relationships → Data Preview     │
│ Layout                           │ Vertical stacking (D.1)                    │
│ KPI stats                        │ Inline badges + hover popover              │
│ Category chips                   │ Short codes: FCT, REF, DIM, FCTH, MAP, AUX│
│ Toolbar                          │ 2 rows, ~76px total                        │
│ Category groups                  │ Collapsible headers with ▼/► toggle        │
│ Sort options                     │ Category, Name, Columns (no Rows/Size)     │
│ Column table max-height          │ 400px with scroll                          │
│ Data preview max-height          │ 300px with scroll                          │
│ Tag display (collapsed card)     │ Not shown (saves space)                    │
│ Tag display (expanded)           │ Full tag editor in detail header           │
└──────────────────────────────────┴────────────────────────────────────────────┘
```
