# Table — Remove the "Rows Visible" (Page-Size) Section

**Created:** 2026-09-16 13:59 IST

## Status

Proposed. Companion to `specs/table/spec-table-visual-redesign.md`.

## Scope

This document specifies removing the "N rows visible" page-size control from
the shared `DataTableComponent`'s footer
(`src/app/shared/ui/data-table/data-table.component.html`,
`.data-table__page-size`).

## Current implementation observations

- `data-table.component.html`'s footer (`.data-table__footer`) currently
  renders a `<select>` bound to `pageSize()`/`onPageSizeChange()`, styled (per
  `spec-table-visual-redesign.md`) as a pill labeled "N rows visible", next
  to the numbered pagination control.
- `pageSize` is a writable signal seeded from `initialPageSize()` (an input,
  default the first entry of `pageSizeOptions()`), and drives `pagedData()`
  and `totalPages()`.

## Requirements

1. The "rows visible" page-size `<select>` is removed from the table
   footer — it is no longer visible or interactive.
2. The table still paginates using a page size: `pageSize` is fixed to
   `initialPageSize()` (the value each report already configures — e.g.
   Dealer Ledger's `DEALER_LEDGER_DEFAULT_PAGE_SIZE`) for the lifetime of the
   table instance, with no in-UI way to change it.
3. `pageSizeOptions` input becomes unused by the footer once this ships;
   it is either removed from `DataTableComponent`'s public API or kept
   only if another consumer still needs it (see Open decisions).
4. No other footer/pagination behavior changes — numbered pagination and
   prev/next controls (per the visual-redesign spec) are unaffected.

## Acceptance criteria

- The table footer no longer shows a page-size selector or "rows visible"
  text.
- Pagination still works correctly using each report's configured
  `initialPageSize`.
- `data-table.component.spec.ts` tests that exercise `onPageSizeChange`/the
  page-size select are removed or updated to reflect the fixed page size.

## Open decisions

- Whether `pageSizeOptions` input and `onPageSizeChange()` are deleted
  outright from `DataTableComponent`, or kept (unused by the default
  template) in case a future report needs a page-size control again — TBD;
  default assumption is to delete the now-dead UI and keep the underlying
  `pageSize` signal/logic, since no report currently needs to change page
  size at runtime.
