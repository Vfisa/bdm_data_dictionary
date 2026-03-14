# Phase 8b: Markdown Rendering Style Research

**Date:** 2026-03-13
**Decision:** Style D — Dashboard Cards
**Status:** Approved, ready for implementation

---

## Background

The ProjectOverviewPage renders markdown from Keboola branch metadata (`KBC.projectDescription`). The initial implementation (Phase 8) used basic styled components. Two issues prompted this upgrade:

1. **Tables not rendering** — `remark-gfm` was installed but not passed to ReactMarkdown
2. **Styling too basic** — needed a cohesive style matching the app's card-based UI

## Evaluation Method

A live demo page (`StyleDemoPage.tsx`) was created with a style switcher rendering the same sample markdown content (headers, tables, bullet lists, code spans, blockquotes, horizontal rules) in four different styles. Each style was reviewed in-browser with screenshots.

## Styles Evaluated

### Style A: GitHub README
- **Feel:** Familiar, developer-friendly, like reading a repo README
- H1/H2 with `border-bottom` underlines
- Tables with full borders + alternating row stripes (gray/white)
- Neutral gray code chips
- Simple left-border blockquotes
- Medium density, `max-w-4xl` prose column

### Style B: Notion-style
- **Feel:** Modern, clean, content-first like a Notion page
- Large headings (32px H1), generous whitespace
- Tables with no borders — just bottom dividers and uppercase small header text
- Warm pinkish/terracotta tinted code spans
- Blue left accent blockquotes with light blue background fill
- `hr` rendered as invisible spacers (no visible line)
- Spacious layout with wide margins

### Style C: Technical Report
- **Feel:** Dense reference doc, fits more on screen, good for data-heavy content
- Compact fonts (13px body, 12px tables), tighter spacing
- Uppercase H1, bold H2 with bottom border
- Tables with dark header row (white text on dark bg), uppercase column headers, full borders
- Bordered monospace code chips
- Gray background blockquotes with thin border
- High information density

### Style D: Dashboard Cards (SELECTED)
- **Feel:** Matches the rest of the Data Dictionary app's card-based UI
- H2 sections rendered as card header bars with rounded border, gray background, and colored left accent bar
- Tables in rounded border containers, no internal cell borders, row dividers only
- Purple-tinted code spans with muted background
- Blue/indigo left accent blockquotes with tinted background
- `hr` rendered as invisible spacers (section breaks handled by card gaps)
- Medium density, `max-w-5xl` content area

## Decision Rationale

**Hybrid D+B selected** — Style D body elements with Style B headings:
- Style D card-header H2s used explicit oklch backgrounds that didn't adapt well to dark mode
- Style B's large, clean headings (32/24/19px) use only CSS variables — fully dark-mode compatible
- Table styling (rounded containers, clean rows) matches the app's table components
- Code span tinting (red, oklch hue 15) provides clear distinction in both light and dark modes
- Blockquote treatment adds information hierarchy through color accents

## Final Element Specification (Hybrid D+B)

| Element | Treatment | Source |
|---------|-----------|--------|
| `h1` | 32px bold, mt-10 mb-2 (no borders/bg) | Style B |
| `h2` | 24px semibold, mt-10 mb-2 (no borders/bg) | Style B |
| `h3` | 19px semibold, mt-8 mb-2 | Style B |
| `p` | 14px, `leading-[1.7]`, mb-3 |
| `ul` | `list-disc pl-5`, 1px spacing |
| `ol` | `list-decimal pl-5`, 1px spacing |
| `li` | 14px, `leading-[1.7]` |
| `blockquote` | `border-l-3 border-[oklch(0.65_0.15_250)]`, tinted bg `oklch(0.96_0.01_250)` / dark `oklch(0.2_0.01_250)`, `rounded-r-lg` |
| `code` (inline) | Red text `oklch(0.45_0.18_15)` / dark `oklch(0.72_0.16_15)`, `bg-[var(--secondary)]`, `border border-[var(--border)]`, `rounded px-1.5 py-0.5` |
| `code` (block) | Pass-through with className |
| `pre` | `rounded-lg bg-[var(--muted)]`, border, p-4 |
| `hr` | Invisible spacer `<div className="my-2" />` |
| `strong` | `font-semibold` |
| `a` | `text-[oklch(0.55_0.15_250)]`, `hover:underline` |
| `table` | `rounded-lg border` container, no cell borders |
| `thead` | `bg-[var(--muted)]` |
| `tr` | `border-b`, `last:border-b-0` |
| `th` | `px-4 py-2.5`, 12px semibold |
| `td` | `px-4 py-2.5` |

## Technical Notes

- **Heading style change:** Style D's card-header H2s were replaced with Style B's clean large headings because the card backgrounds (explicit oklch values) didn't adapt well to dark mode. Style B headings use only `var(--foreground)` which toggles automatically.
- **Dark mode:** Body elements use CSS custom properties or explicit light/dark oklch pairs. Headings use only CSS variables for full theme compatibility.
- **GFM fix:** Adding `remarkPlugins={[remarkGfm]}` to ReactMarkdown enables table, strikethrough, autolink, and task list parsing.

## Style Refinement Notes

After initial implementation, code spans and table headers were iteratively refined for dark mode:

1. **Code color progression:** neutral (`var(--foreground)`) → purple (hue 280) → orange (hue 30) → **red (hue 15)**
   - Purple rejected: too close to the dark mode chip background color
   - Orange tested: visible but very similar to red in practice
   - Red selected: good contrast in both light and dark modes, distinct from blue links
2. **Code border added:** `border border-[var(--border)]` gives code chips more visual weight beyond just color
3. **Code background:** Changed from `bg-[var(--muted)]` to `bg-[var(--secondary)]` for better contrast with page background in dark mode
4. **Table headers:** Changed from explicit oklch values (`0.96/0.22`) to `bg-[var(--muted)]` — the explicit dark value was nearly invisible against the page background
