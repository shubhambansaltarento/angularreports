# Table — Square/Smaller Buttons, Toolbar Order, and Smaller Cell Font Size

**Created:** 2026-09-17 06:00 AM

## Status

Implemented — Open decisions resolved as: `4px` button radius
(matching the panels' existing radius), pagination buttons `1.625rem`,
toolbar button/input padding `0.2rem 0.5rem`, cell font size
`0.8125rem`.

## Purpose

Four related refinements to the shared `DataTableComponent`'s toolbar
and grid, following on from
`monochrome-redesign-and-column-picker-text-fix-17-09-2026-05_56_AM.md`:

1. Remove the border radius from every button in the table (currently
   pill-shaped toolbar buttons and fully circular pagination
   controls) — square/sharp corners instead.
2. Make every button smaller than its current size.
3. Reorder the toolbar's controls to: **Search bar, Columns, Reset,
   Export** (currently: Reset, Search, Columns, Export).
4. Reduce the font size of the table's cell content (rows/data) —
   currently too large.

## Current implementation

- **Border radius:**
  - `.data-table__pill-input` (the search box) and
    `.data-table__pill-button` (Reset/Columns/Export toggle buttons) —
    `border-radius: 999px` (`data-table.component.scss:57,74`), i.e.
    fully pill-shaped.
  - `.data-table__page-nav`/`.data-table__page-number` (Prev/Next/page
    number pagination buttons) — `border-radius: 50%`
    (`data-table.component.scss:293`), i.e. fully circular.
- **Button size:** all toolbar buttons already use Bootstrap's
  `btn-sm`, and pagination buttons are sized via
  `min-width: 2rem; height: 2rem;` (`data-table.component.scss:290-291`)
  — both are the current "small" baseline the request wants reduced
  further.
- **Toolbar order:** `data-table.component.html:10-81`
  (`.data-table__toolbar-actions`) currently renders, in order: Reset
  button (if `showReset()`) → Search input → Columns menu → Export
  menu.
- **Cell font size:** `.data-table__table th`
  (`data-table.component.scss:166-174`) sets `font-size: 0.75rem`, but
  `.data-table__table td` (`data-table.component.scss:159-164`) sets no
  `font-size` at all — table body text renders at whatever the
  ambient/inherited font size is (the page's default, larger than the
  compact `0.75rem` header text), which is the "font size inside the
  table is large" symptom.

## Scope

- `data-table.component.scss` — remove/replace the `border-radius: 999px`
  pill styling and `border-radius: 50%` circular styling on all
  buttons with square corners (or a small, non-pill radius per Open
  decisions); reduce toolbar button and pagination-control sizing;
  add an explicit, smaller `font-size` to table body cells.
- `data-table.component.html` — reorder `.data-table__toolbar-actions`'
  children to Search → Columns → Reset → Export.
- Out of scope: the Columns/Export popup panels' own internal buttons
  (up/down/pin/Restore Default in `data-table-column-settings.component.html`)
  and their border radius (`border-radius: 4px` on the *panels*
  themselves, not buttons) — the request is about the table's own
  toolbar/pagination buttons; panel-container radius is a separate,
  non-button concern not mentioned in this request.
- Out of scope: font size elsewhere in the table (toolbar title/count,
  header cells, empty state, skeleton) — already reasonably sized;
  only the data row/cell text is called out as too large.

## Requirements

1. `.data-table__pill-input` and `.data-table__pill-button` (Search
   box, Reset, Columns, Export toggle buttons) have no pill/rounded
   shape — square corners (or a small consistent radius per Open
   decisions, not the current 999px pill).
2. `.data-table__page-nav`/`.data-table__page-number` (pagination
   controls) are square, not circular.
3. Every one of these buttons is visually smaller than its current
   size — reduced padding/min-dimensions, while remaining a usable
   click target.
4. The toolbar's action controls render, left to right (or in DOM
   order, matching current flex layout): Search bar, Columns, Reset,
   Export.
5. Table body cell text uses an explicit, smaller `font-size` than
   today's inherited default — visually smaller than the header text
   remains fine, but the current unset/larger body text size is
   reduced to match the table's overall compact, dense design.
6. No functional behavior changes — this is a layout/styling change
   only; button click handlers, disabled states, and the Reset
   button's conditional rendering (`showReset()`) are unaffected.

## Acceptance criteria

- Visually: every toolbar button and every pagination button has
  square corners, not rounded/pill/circular.
- Visually: toolbar and pagination buttons are noticeably smaller than
  before this change.
- The toolbar's controls appear in the order Search, Columns, Reset,
  Export (when Reset is shown at all — `showReset()` still governs
  whether it renders, just repositioned when it does).
- Table row text is visibly smaller than before, and legible.
- Existing `data-table.component.spec.ts` tests (which query buttons
  by CSS selector/text, not by their visual position within the
  toolbar) continue to pass — reordering the DOM should not break any
  test that finds "the Reset button" or "the Export button" by
  selector/label alone; any test relying on positional/index ordering
  of `.data-table__toolbar-actions` children is updated. No new tests
  are required for a pure CSS sizing change, but confirm the reorder
  doesn't regress `showReset()`'s conditional-rendering test.

## Open decisions

- Exact button radius: fully square (`border-radius: 0`) vs. a small
  radius (e.g. `2px`–`4px`, matching the panels' existing `4px`) for a
  slightly softened corner — default assumption: a small `4px` radius
  (consistent with the rest of the table's containers/panels) rather
  than perfectly sharp corners, since "remove the border radius" most
  plausibly means "stop looking like a pill/circle," not necessarily
  "zero radius everywhere."
- Exact reduced sizing values (padding/min-dimensions/font-size) —
  default assumption: roughly a 15–20% reduction from current values
  (e.g. toolbar buttons keep `btn-sm` but drop custom padding;
  pagination controls shrink from `2rem` to `1.5rem`–`1.75rem`; cell
  text drops to `0.8125rem`, between the header's `0.75rem` and the
  current larger inherited size) — exact values to be finalized during
  implementation and confirmed visually.
