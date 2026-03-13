# Phase 7: Transformation Lineage — Visual Testing Summary

**Date:** 2026-03-13
**Environment:** Vite dev (5173) + Express mock mode (3000)

## Verified Scenarios

### 1. Table Browser — FCT_PAYMENT (Lineage with entries)
- **LINEAGE (2)** section visible between Relationships and Data Preview
- **Created by (1):** `SQL` Build FCT Payment — 5d ago ✅ 2h ago
- **Used by (1):** `PY` Export Client Report — 1d ago, 1d ago
- Type badges render correctly: `SQL` (monospace, muted bg), `PY` (same style)
- Transformation names are bold blue, clickable (open in Keboola UI)

### 2. Table Browser — FCT_ORDER (Multiple lineage entries)
- **LINEAGE (3)** header with correct count
- **Created by (1):** Build FCT Order
- **Used by (2):** Build FCT Payment, Enrich Dispatch Data
- All entries render correctly with timestamps

### 3. Table Browser — DIM_DATE (Empty lineage state)
- **LINEAGE (0)** header
- Italic muted message: "No transformations reference this table"
- Clean empty state, no visual artifacts

### 4. ERD Diagram — FCT_ORDER (Floating detail panel)
- Lineage section renders in ERD floating panel after Relationships
- **LINEAGE (3)** with full entries
- Status icons visible: ✅ success (green), ❌ error (red), ⚠️ warning (yellow)
- Timestamps: last change date + last run date

### 5. Refresh Button in Table Browser
- Refresh icon (↻) visible in toolbar Row 2
- Timestamp "Xm ago" displays next to refresh button
- Button disabled state with spinner animation during refresh

## Section Order Verified
Columns → Relationships → **Lineage** → Data Preview (matches PRD spec)

## Component Rendering
- RunStatusIcon: ✅ CheckCircle2 (green), ❌ XCircle (red), ⚠️ AlertTriangle (yellow), — Minus (null)
- TypeBadge: Monospace `SQL`, `PY` labels with muted background
- LineageSectionHeader: GitBranch icon + "Lineage (N)" count
- External link icon appears on hover
