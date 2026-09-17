# Table — Default Page Size 10, Correctly Paginate a 40-Row Result Set (4 Pages)

**Created:** 2026-09-16 16:45 IST

## Status

Proposed.

## Purpose

Per `api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md`, the Dealer Ledger
data API returns the full matching result set in one request, and the
shared `DataTableComponent` paginates it entirely client-side. This spec
sets Dealer Ledger's page size to **10** (down from the current 20), and
verifies pagination is correctly managed for the concrete case the request
calls out: **40 records → 4 pages**, end to end (page numbers, row slicing,
navigation, and the interaction with sorting/search/reset).

## Scope

- Change `DEALER_LEDGER_DEFAULT_PAGE_SIZE` from `20` to `10` — the value
  `DealerLedgerTableComponent` passes as `DataTableComponent`'s
  `initialPageSize`.
- Verify/harden `DataTableComponent`'s existing client-side pagination
  logic (`totalCount`, `totalPages`, `pagedData`, `pageNumbers`, Prev/Next/
  page-number clicks, the current-page clamp effect) specifically for a
  40-row dataset at page size 10 — this is a verification/regression-test
  spec more than a new-feature spec, since the underlying pagination logic
  was already implemented; the concrete 40-row/4-page scenario has not
  been exercised as a dedicated test case.
- Out of scope: any change to the numbered-pagination *windowing* behavior
  for larger page counts (already handled — `totalPages <= 7` shows every
  page number, which covers this case) or to server-side pagination (not
  used by Dealer Ledger per Spec 23).

## Current implementation observations

- `DEALER_LEDGER_DEFAULT_PAGE_SIZE = 20` in `dealer-ledger.constants.ts`,
  passed as `DataTableComponent`'s `initialPageSize` via
  `DealerLedgerTableComponent`.
- `DataTableComponent.totalPages` is
  `Math.max(1, Math.ceil(resolvedTotalCount() / pageSize()))` — for 40 rows
  at page size 10, this is exactly `4`, with no remainder/edge case (unlike
  e.g. 41 rows, which would need a partial 5th page).
- `DataTableComponent.pageNumbers` shows every page number without an
  ellipsis whenever `totalPages <= 7` — 4 pages falls well within that,
  so no windowing logic is exercised by this case; it's the simplest
  possible multi-page scenario.
- No existing test in `data-table.component.spec.ts` uses a dataset sized
  to produce exactly 4 pages, or asserts on visiting every page in
  sequence — existing pagination tests use a 25-row/page-size-10 dataset
  (3 pages, with a partial last page of 5 rows).

## Requirements

1. `DEALER_LEDGER_DEFAULT_PAGE_SIZE` is changed to `10`.
2. With a 40-row result set (e.g. the current mock dataset size, or the
   live backend returning 40 matching rows) and page size 10:
   - The pagination footer shows exactly 4 page-number buttons (1–4), no
     ellipsis, and Prev/Next controls.
   - Each page shows exactly 10 rows; page 4 shows the last 10 rows (no
     off-by-one truncation or duplication).
   - Clicking page 2, 3, then 4 in sequence navigates correctly each time,
     and Prev/Next correctly move one page at a time, disabling
     appropriately at page 1 (Prev) and page 4 (Next).
3. Changing filters/search/sort while on a page beyond the new result
   set's page count clamps back to the last valid page (already-implemented
   clamp effect) — verified specifically for the transition into/out of a
   40-row/4-page result set (e.g. filtering 40 rows down to 25 rows, page 4
   no longer existing at page size 10, should clamp to page 3).

## Acceptance criteria

- Dealer Ledger's table shows 10 rows per page by default.
- For a 40-row result set, the table shows exactly 4 pages, each with the
  correct 10-row slice, and page navigation (numbers + Prev/Next) works
  correctly across all 4 pages.
- `data-table.component.spec.ts` gains a dedicated test using a 40-row
  dataset at page size 10, asserting: 4 page-number buttons render, each
  page's row count/content is correct, and the current-page clamp behaves
  correctly when the result set shrinks below the current page's range.
- No regression to the existing 25-row/page-size-10 (3-page, partial last
  page) pagination test already in place.

## Open decisions

- Whether `DEALER_LEDGER_DEFAULT_PAGE_SIZE = 10` is a permanent change or a
  temporary "for now" value (per the request's own phrasing) pending a
  later, possibly configurable, page size — default assumption is to treat
  it as the new default until told otherwise, with no page-size selector
  UI reintroduced (one was deliberately removed per
  `spec-table-remove-rows-visible.md`).
