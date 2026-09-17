# Table — Server-Side Pagination Support (Fixes Broken Pagination + Initial-Load Glitch)

**Created:** 2026-09-16 16:08 IST

## Status

Proposed.

## Purpose

Dealer Ledger's pagination controls do not work correctly, and the table
sometimes visibly "breaks" on the very first load but recovers after
Reset. Root-caused below: the shared `DataTableComponent` only ever
paginates *client-side*, over whatever `data` array it is given — but
`DealerLedgerStore` already does *server-side* pagination (one page of
rows per request, via `changePage()`/`changePageSize()`), and nothing
connects the two.

## Root cause

- `DataTableComponent.data` is expected to be "the full (unpaginated,
  unfiltered) dataset" (per its own doc comment) — `filteredData()`,
  `sortedData()`, and `pagedData()` all derive from it, and
  `totalCount`/`totalPages` are computed as `data().length` /
  `Math.ceil(totalCount / pageSize)`.
- `DealerLedgerListComponent` passes `[rows]="store.data()"` — but
  `store.data()` is only **one page** of rows (whatever the last request
  returned, e.g. 20 of a real 41-row result set per the live backend), not
  the full result set.
- So `DataTableComponent` thinks the *entire* dataset is however many rows
  happen to be on the current page: `totalCount` is wrong (20, not 41),
  `totalPages` is wrong (1, not 3), and clicking "next page" or a page
  number just re-slices the same already-small array the table already has
  — it never asks the store to fetch the next page. Pagination controls
  either look inert (only "page 1 of 1") or, worse, appear to have pages
  but clicking them does nothing meaningful.
- The initial-load "breaking" symptom is consistent with this same
  mismatch compounding with `effective-columns-drive-table-headers-16-09-2026-03_59_PM.md`'s
  column-set changing between the very first render (default hardcoded
  columns, before any response) and the first real response arriving
  (`effectiveColumns`-derived columns) — `DataTableComponent`'s persisted
  per-`tableId` column state (`localStorage`) can briefly reconcile against
  a stale/partial column set while `totalCount`/`totalPages` are also wrong
  from the pagination bug above, producing a visibly inconsistent first
  paint that a Reset (a fresh, settled request/response cycle) doesn't
  exhibit.

## Scope

- Add an explicit, opt-in "server-side pagination" mode to the shared
  `DataTableComponent` — existing client-side-pagination consumers (any
  report passing its whole dataset) are unaffected by default.
- Wire `DealerLedgerTableComponent`/`DealerLedgerListComponent` to use it,
  driven by `DealerLedgerStore`'s existing `pagination()`/`changePage()`/
  `changePageSize()`.
- Out of scope: changing `DealerLedgerStore`'s pagination logic itself
  (already correct — `page`/`pageSize`/`totalCount` are already tracked and
  fetched correctly); changing any other report's table (none currently
  rely on server pagination).

## Requirements

1. `DataTableComponent` gains an optional `totalCount` input
   (`number | null`, default `null`). When provided (non-null), it is used
   as the row-count basis for `totalPages`/display instead of
   `data().length` — signaling "the `data` I was given is only the current
   page, not the full set."
2. When `totalCount` is provided, `pagedData()` returns `sortedData()`
   as-is (the caller has already paginated it server-side) rather than
   re-slicing by `currentPage`/`pageSize`.
3. `DataTableComponent` gains `pageChange`/`pageSizeChange` outputs, firing
   instead of mutating internal `currentPage`/`pageSize` state, whenever
   `totalCount` is provided (server-side mode) — so page-number clicks,
   prev/next, and (if re-added later) a page-size control all delegate to
   the consumer rather than the table's own local pagination state.
4. `DealerLedgerTableComponent` passes `[totalCount]="pagination().totalCount"`
   (or equivalent) and forwards `pageChange`/`pageSizeChange` to
   `DealerLedgerStore.changePage()`/`changePageSize()`.
5. `DealerLedgerListComponent`/`DealerLedgerTableComponent` expose whatever
   pagination state (`page`, `pageSize`, `totalCount`) the store already
   tracks — no duplicate pagination state is introduced.
6. Client-side sorting/search inside `DataTableComponent` remain scoped to
   the current page's data in this server-paginated mode (full-dataset
   sort/search across all server pages is explicitly out of scope — sorting
   should ideally trigger a new server request via `DealerLedgerStore.sort()`,
   itself already implemented; wiring the table's sort-click to call that
   instead of local in-memory sort is part of this same fix, since local
   sort of a single page is equally as broken as local pagination of one).

## Acceptance criteria

- Dealer Ledger's pagination footer shows the correct total page count
  (e.g. "3 pages" for a 41-row/20-per-page result), matching the store's
  `pagination().totalCount`.
- Clicking a page number, or Next/Previous, triggers a new server request
  for that page (visible in the Network tab) and the table updates with
  that page's rows — not a re-slice of already-loaded rows.
- Clicking a sortable column header triggers a new server request via
  `DealerLedgerStore.sort()`, not a client-side re-sort of only the current
  page.
- The first page load renders a consistent, non-broken table (correct
  columns, correct row count/pagination) without requiring a Reset.
- Other reports using `DataTableComponent` in its default (client-side)
  mode are completely unaffected — `totalCount` defaults to `null`, current
  behavior unchanged.

## Open decisions

- Whether search (`DataTableComponent`'s own global search box) should
  also delegate to the server (via `DealerLedgerStore.search()`'s
  `searchTerm`) in server-paginated mode, rather than filtering only the
  currently-loaded page — TBD; the Requirements section above scopes this
  spec to pagination and sorting, treating table-level search as a
  follow-up given it already has a different, filter-panel-driven path
  today (per `remove-actions-row-16-09-2026-01_52_PM.md`'s auto-search).
- Exact shape of the new outputs (`pageChange: number` vs. emitting the
  full next-page-request intent) — TBD, default assumption is the simplest
  `pageChange = output<number>()` / `pageSizeChange = output<number>()`,
  mirroring `changePage(page)`/`changePageSize(pageSize)`'s own signatures.
