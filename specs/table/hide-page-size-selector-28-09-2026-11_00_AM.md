# Data Table — Spec: Hide the "Show [N] entries" Page-Size Selector

**Created:** 28-09-2026 11:00 AM IST

## Status

Implemented.

## Purpose

Remove the "Show [10 / 25 / 50 …] entries" page-size dropdown from the shared data table toolbar for now. Every report table pages at its configured `initialPageSize` (default 10) with no user-facing control to change it. The selector is hidden behind a flag, not deleted, so it can be turned back on later without re-implementing it.

## Requirements

1. `DataTableComponent` exposes a new input `showPageSizeSelector` (boolean, default `false`).
2. When `showPageSizeSelector` is `false`, the toolbar renders none of the `.data-table__page-size` label, its `<select>`, or the "Show" / "entries" text.
3. When `showPageSizeSelector` is `true`, the selector renders and works exactly as before (uses `pageSizeOptions`; changing it resets to page 1).
4. Pagination is otherwise unchanged: page size comes from `initialPageSize`, and the page-number and prev/next controls keep working.
5. No consumer passes `showPageSizeSelector`, so the selector is hidden in every report.
6. `pageSizeOptions`, `onPageSizeChange` and the `.data-table__page-size*` styles are kept for when the selector comes back.

## Acceptance criteria

- No report's table toolbar shows a "Show [N] entries" dropdown.
- Tables still show 10 rows per page (or their configured `initialPageSize`) and paginate correctly.
- Search, Columns, Export and Reset controls in the toolbar are unaffected.
- Unit test: by default the data table renders no `.data-table__page-size` / `.data-table__page-size-select` element and no "entries" text.

## Open decisions

- Whether to bring the selector back later, either globally (flip the default) or per report (pass `[showPageSizeSelector]="true"`).
