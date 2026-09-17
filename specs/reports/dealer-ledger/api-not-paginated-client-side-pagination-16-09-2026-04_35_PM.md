# Dealer Ledger — Spec 23: The Data API Is Not Paginated — Fetch Once, Paginate in the UI

**Created:** 2026-09-16 16:35 IST

## Status

Proposed. Supersedes the Dealer-Ledger-side wiring from
`spec-table-server-side-pagination.md` (that spec's generic, opt-in
`totalCount`/`page`/`sort` capability stays in the shared
`DataTableComponent` — it just goes unused by Dealer Ledger per this spec).

## Purpose

The `/data` API for Dealer Ledger is **not paginated on the backend** — a
single request returns the full matching result set for the given
filters/date range (not one page of it). The previous assumption (that the
backend returns one page at a time via `paging.page`/`pageSize` and a
`totalRows`/`totalPages` reflecting the whole set) does not hold. This spec
reverts Dealer Ledger to fetch the complete filtered dataset in one request
and paginate entirely client-side, in the table, matching how the API
actually behaves.

## Scope

- `DealerLedgerStore`/`DealerLedgerService`: stop treating the data API as
  paginated. One request per filter/sort change returns the entire matching
  result set.
- `DealerLedgerTableComponent`/`DealerLedgerListComponent`: stop passing
  `totalCount`/`page`/`sort` into `DataTableComponent` (revert to the
  shared table's default, client-side pagination mode — `totalCount`
  omitted/`null`).
- Sorting reverts to client-side as well, for the same reason: there is no
  "next page from the server" to keep in sync with — the whole dataset is
  already in the browser, so `DataTableComponent`'s own local sort is
  correct and sufficient.
- Out of scope: removing `DataTableComponent`'s server-side pagination
  capability itself (per `spec-table-server-side-pagination.md`) — it stays
  as a generic, opt-in feature for any report whose backend *is* actually
  paginated; Dealer Ledger simply doesn't use it.

## Current implementation observations

- `DealerLedgerApiRequest.paging` (`{ page, pageSize }`) is still sent per
  `data-api-request-contract-16-09-2026-02_48_PM.md`'s contract, but the real backend
  response's `paging.totalRows`/`totalPages` reflects the count of rows
  actually returned for the request's filters — not a subdivided page of a
  larger set the backend is holding back.
- `DealerLedgerStore.changePage()`/`changePageSize()` currently trigger a
  new server request per page change (`fetch()` re-sends `page`/`pageSize`)
  — per this spec, this is unnecessary: the full result set for the current
  filters has already been fetched once.
- `DealerLedgerTableComponent`/`DealerLedgerListComponent` currently wire
  `[page]`/`[totalCount]`/`[sort]` from the store's `pagination()`/
  `sortState()` signals into `DataTableComponent`, and forward its
  `pageChange`/`sortChange` outputs back into `store.changePage()`/`sort()`
  (added by `spec-table-server-side-pagination.md`) — this wiring is
  removed by this spec.

## Requirements

1. `DealerLedgerStore.fetch()`/`DealerLedgerService.getEntries()` requests
   the full matching dataset once per filter/sort/search change — the
   `paging` sent in the request body may still include a `pageSize` (if the
   backend requires the field to be present), but the app must not assume
   the response is only a partial page: `DealerLedgerStore.data()` holds
   every row matching the current filters, not one server page of them.
2. `DealerLedgerStore.changePage()`/`changePageSize()` (if kept at all) no
   longer trigger a new server request — pagination becomes purely a
   client-side concern owned by `DataTableComponent`. Consider removing
   these store methods entirely if nothing else calls them once the table
   no longer does (see Open decisions).
3. `DealerLedgerTableComponent` stops passing `[page]`, `[totalCount]`, and
   `[sort]` to `DataTableComponent` (or passes `totalCount={null}`
   explicitly) — restoring the shared table's default client-side
   pagination/sorting behavior, now operating correctly since `data` truly
   is the full dataset again.
4. `DealerLedgerListComponent` stops wiring `pageChange`/`sortChange` from
   the table back into `store.changePage()`/`store.sort()` — those events
   no longer fire in client-side mode.
5. `DealerLedgerStore.sort()` (if kept for column-header sort — see Open
   decisions) either becomes a no-op/removed, or is repointed to operate
   client-side only if some other reason still needs sort state tracked in
   the store (e.g. persisted alongside filters) — no new server request per
   sort click.

## Acceptance criteria

- Changing a filter (Search) issues exactly one data request for the new
  criteria, returning the complete matching result set.
- Clicking pagination controls (Prev/Next/page numbers) in the table does
  **not** trigger any network request — it only re-slices the already-
  fetched full dataset, exactly like `DataTableComponent`'s default
  behavior for every other report.
- Clicking a sortable column header does not trigger a network request —
  sorting happens instantly over the already-fetched full dataset.
- The table's row count/pagination footer (page count, "N records") reflect
  the full fetched dataset's size, not a per-page count from the backend.
- `DealerLedgerStore`'s public surface used by other components no longer
  needs `pagination().page`/`changePage()`/`sort()`'s network-triggering
  behavior — anything left unused after this change is either removed or
  clearly marked as dead/no-op.

## Open decisions

- Whether `DealerLedgerStore.changePage()`/`changePageSize()`/`sort()` are
  deleted outright (since nothing would call them once the table goes back
  to local pagination) or kept as no-ops for now — default assumption is to
  delete them along with the `pagination().page` field's meaning as
  "current server page" (pagination's `totalCount` field is still useful
  to keep, as "size of the full fetched result set," but `page`/`pageSize`
  become vestigial once nothing paginates server-side).
- Whether the request body should still send a `pageSize` value at all
  (e.g. a very large fixed number, or omitted) given the backend appears to
  ignore/not require true paging — TBD, needs confirming against the real
  backend's tolerance for a missing/oversized `pageSize` before finalizing;
  default assumption is to keep sending the existing
  `DEALER_LEDGER_DEFAULT_PAGE_SIZE` value in `paging.pageSize` (since Spec
  19 already established the field is present in every successful request
  observed) even though it's no longer used to slice the response.
- Whether `DealerLedgerRequest`'s own `page`/`pageSize` fields (the
  *internal* shape, not the wire contract) should be removed from the
  store's request-building entirely, or kept but hardcoded/unused — default
  assumption is to keep the internal `DealerLedgerRequest` shape as-is (to
  minimize churn to `DealerLedgerMockService`, which still does real
  client-side-style pagination internally for the mock dataset) and only
  change how the *store* consumes the *response*.
