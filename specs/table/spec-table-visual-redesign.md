# Table — Visual Redesign (Gradient Toolbar, Pill Controls, Rounded Pagination)

**Created:** 2026-09-16 13:46 IST

## Status

Proposed.

## Purpose

Restyle the shared `DataTableComponent` (`src/app/shared/ui/data-table`) to match
the reference UI: a colored gradient toolbar with pill-shaped controls, a clean
white row area with subtle striping, and a rounded, numbered pagination control
at the bottom-left instead of the current plain "Previous/Next/Page X of Y" text
row. This is a visual/styling change only — no behavioral change to sorting,
filtering, selection, column settings, or export.

## Reference

Provided mockup: a full-width blue gradient header bar containing a pill-shaped
"Alert" badge on the left, a pill-shaped search input in the center, and circular
icon buttons (refresh, list-view toggle, grid/columns dropdown) on the right.
Below it, a plain white table with bold uppercase column headers, sort arrows
next to sortable columns, alternating/hover row shading, and a lightweight
"Actions" icon column. The footer shows a rounded "rows visible" selector on the
left and numbered circular pagination (1, 2, 3 … 10, with prev/next chevrons) on
the right.

## Scope

- Toolbar (`.data-table__toolbar`): apply a gradient background, pill-shaped
  search input, and circular icon-button styling for the existing
  Columns/Export controls (behavior unchanged — only shape/color).
- Column headers: bold, uppercase/letter-spaced styling; keep existing sort
  button/indicator behavior.
- Rows: lighter zebra striping and hover state consistent with the reference.
- Footer/pagination (`.data-table__footer`, `.data-table__pagination`):
  replace the "Previous / Page X of Y / Next" text control with numbered,
  circular page buttons plus prev/next chevrons, and restyle the existing
  "Rows per page" select into a rounded pill control ("N rows visible").
- Out of scope: introducing a literal "Alert" badge (that is page-specific
  chrome from the mockup, not part of the reusable table), any new
  interactive behavior (this table's search/columns/export logic is
  unchanged), and third-party table libraries — the custom `DataTableComponent`
  architecture (`specs/table/table.md`) is retained.

## Requirements

1. The toolbar renders with a gradient background (color TBD against brand
   palette — see Open decisions) rather than the current plain/transparent
   background.
2. The search input renders as a pill (fully rounded) rather than the current
   `form-control-sm` rectangular input, while keeping the same
   `(input)="onSearchInput($event)"` behavior.
3. Column headers render bold and visually distinct from body rows (per the
   reference's uppercase style), without changing `onSortColumn`/sort-indicator
   behavior.
4. Table rows keep readable contrast with light zebra striping and a hover
   state.
5. Pagination renders as numbered circular buttons for page numbers (with an
   ellipsis for skipped ranges on large page counts) plus previous/next
   chevron controls, replacing the current "Page X of Y" text — all driven by
   the existing `currentPage()`/`totalPages()`/`goToPreviousPage()`/
   `goToNextPage()` state; a new page-number click handler is added
   (`goToPage(page: number)`) but no new pagination state/model is introduced.
6. The "Rows per page" control is visually restyled as a rounded pill
   (e.g. "10 rows visible") but keeps its existing `<select>`-driven behavior
   (`onPageSizeChange`).
7. This is CSS/template-only for `data-table.component.html`/`.scss` — no
   changes to `data-table.component.ts` logic beyond the new `goToPage` method
   needed to drive numbered pagination.

## Current implementation observations

- `data-table.component.html` currently renders the toolbar as a plain flex
  row (`data-table__toolbar`), a bootstrap `.table.table-hover` for rows, and
  a text-based pagination footer (`data-table__footer`) with Previous/Next
  buttons and a "Page X of Y" label.
- `specs/design/design.md` establishes Bootstrap (CSS only, no JS/Popper) as
  the app's base design library — the icon buttons and pill shapes in this
  redesign should be achieved with Bootstrap utility classes plus targeted
  component-scoped SCSS (e.g. `border-radius: 50%`/`999px`, gradient
  background), consistent with that spec's "Bootstrap utilities + retained
  BEM hooks" approach.
- No icon library is currently adopted (`specs/design/design.md` leaves this
  as an open decision) — the reference's refresh/list/grid icons need a
  source (see Open decisions).

## Acceptance criteria

- Toolbar, search input, and icon-style buttons visually match the gradient/
  pill treatment in the reference, implemented via Bootstrap utilities plus
  component-scoped SCSS.
- Pagination shows numbered page buttons (rounded) and next/previous
  controls; clicking a page number navigates directly to that page.
- Existing `data-table.component.spec.ts` DOM-structure-dependent assertions
  continue to pass, or are updated in the same change if a class/structure
  they assert on is intentionally renamed as part of this restyle.
- No sorting, filtering, selection, column-visibility, or export behavior
  regresses.
- Every report composing `DataTableComponent` (Dealer Ledger, Goods
  Acknowledgement, etc.) picks up the new look automatically, since this is a
  shared-component change.

## Open decisions

- Exact gradient colors/brand palette to use for the toolbar (the reference
  uses a blue gradient) — TBD pending brand input, per the open decision
  already tracked in `specs/design/design.md`.
- Icon source for the refresh/list-view/grid-view circular buttons (Bootstrap
  Icons vs. inline SVG vs. another set) — TBD, tracked alongside the existing
  open icon-library decision in `specs/design/design.md`.
- Whether the "Alert" pill and the list/grid view-toggle icons from the
  mockup represent new functionality (a notification banner, an alternate
  card/grid rendering of the table) or are illustrative-only and excluded
  from this restyle — TBD; this spec currently treats them as out of scope
  (see Scope).
- Page-number windowing rule for large page counts (how many numbers show
  around the current page before collapsing into "…", matching the
  reference's `1 2 3 4 5 … 10` pattern): TBD, default to a reasonable window
  (e.g. 5 visible + ellipsis + last page) pending confirmation.
