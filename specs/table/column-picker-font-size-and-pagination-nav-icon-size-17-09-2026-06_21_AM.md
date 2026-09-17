# Table — Smaller Column-Picker Label Font, Larger Prev/Next Pagination Icons

**Created:** 2026-09-17 06:21 AM

## Status

Implemented — column label `0.8125rem`; Prev/Next icons `1.125rem`
(page-number digits stay `0.8125rem`).

## Purpose

Two refinements to the shared `DataTableComponent`, from the Dealer
Ledger screenshot:

1. In the Columns picker popup, each column-name checkbox label
   ("Dealer Code", "Doc. Type", etc.) renders at too large a font
   size relative to the rest of the compact table UI — decrease it.
2. The pagination footer's Previous/Next controls (the `‹`/`›` glyph
   buttons on either side of the numbered pages) are barely visible —
   increase their icon size so they're clearly legible/clickable.

## Current implementation

- `.form-check-label` (the column-name text next to each checkbox in
  `data-table-column-settings.component.html:23`) has no explicit
  `font-size` rule in `data-table-column-settings.component.scss` — it
  inherits the panel's ambient/default text size, which is
  noticeably larger than the table's own compact `0.8125rem` cell text
  (`square-smaller-buttons-toolbar-order-and-cell-font-size-17-09-2026-06_00_AM.md`)
  and the picker's other small text (up/down buttons, pin `<select>`).
- The Previous/Next buttons
  (`data-table.component.html:177-182,201-206`) render literal `‹`/`›`
  characters as their content, inside `.data-table__page-nav`
  (shared with `.data-table__page-number`,
  `data-table.component.scss:294-311`), which sets
  `font-size: 0.8125rem` — the same reduced size introduced by
  `square-smaller-buttons-toolbar-order-and-cell-font-size-17-09-2026-06_00_AM.md`
  for the *numbered* page buttons (where a small font is appropriate
  for a digit). Applied to the thin `‹`/`›` glyphs, this size renders
  them faint and hard to see, per the screenshot.

## Scope

- `data-table-column-settings.component.scss` — add an explicit,
  smaller `font-size` to the column-name label
  (`.form-check-label` within `.data-table-column-settings__visibility`,
  or a new dedicated class if targeting the shared Bootstrap class
  directly is too broad).
- `data-table.component.scss` — increase the `‹`/`›` icon size on
  `.data-table__page-nav` specifically, without changing
  `.data-table__page-number`'s (the numbered buttons') font size,
  since those two currently share one rule
  (`.data-table__page-nav, .data-table__page-number { ... font-size: 0.8125rem; ... }`)
  that will need splitting apart for icon-only vs. digit-only sizing.
- Out of scope: the up/down/pin controls in the column-settings panel,
  and the numbered page buttons — not mentioned in this request.

## Requirements

1. Column-name labels in the Columns picker render at a smaller,
   consistent font size, matching the picker's other compact text
   (search input, up/down buttons).
2. The Previous/Next pagination buttons' `‹`/`›` glyphs render large
   enough to be clearly visible and easy to click, without changing
   the numbered page buttons' own (already-correct) smaller sizing.
3. No functional change — checkbox toggling and Prev/Next navigation
   behavior are unaffected; this is a visual sizing change only.

## Acceptance criteria

- Opening the Columns picker shows every column name at a visibly
  smaller font size than before.
- The Previous (`‹`) and Next (`›`) buttons are clearly visible,
  legible glyphs — not faint/hard-to-see — while the numbered page
  buttons (1, 2, 3, ...) keep their current compact size.
- Existing `data-table.component.spec.ts`/`data-table-column-settings.component.spec.ts`
  tests (which locate these controls by class/`aria-label`, not visual
  size) continue to pass unchanged.

## Open decisions

- Exact column-name label font size — default assumption: `0.8125rem`,
  matching the table's own established compact text size from
  `square-smaller-buttons-toolbar-order-and-cell-font-size-17-09-2026-06_00_AM.md`,
  for consistency across the redesign.
- Exact Prev/Next icon size — default assumption: `1rem`–`1.125rem`
  (up from `0.8125rem`) for the `‹`/`›` glyphs specifically, large
  enough to read clearly at a glance without enlarging the button's
  own `min-width`/`height` box (which stays at the already-reduced
  `1.625rem` square from the same button-sizing spec).
