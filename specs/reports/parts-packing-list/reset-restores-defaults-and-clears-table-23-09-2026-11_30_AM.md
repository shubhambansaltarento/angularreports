# Parts Packing List — Spec: Reset Restores Default Field Values and Clears the Table

**Created:** 23-09-2026 11:30 AM IST

## Status

Implemented.

## Purpose

Clicking Reset (the table header's Reset control, after Export —
`reset-after-export-in-all-reports-21-09-2026-06_30_PM.md`) should return the whole page to its
initial, pre-search state: every filter field back to its default value, and the table cleared/
hidden accordingly rather than left showing stale results for filters that no longer match what
the form displays.

## Requirement

1. `PartsPackingListFilterComponent.resetFilters()` resets the form to:
   - `invoiceNumber`: `null` (the input renders empty).
   - `deliveryNumber`: `null` (the input renders empty).
   - `dateFrom`/`dateTo`: back to `defaultDateRange()` — the same initial 1-month range the
     form starts with on first load, not emptied.
   Then emits `reset` so the page can react.
2. `parts-packing-list-list.component`'s `onTableReset()` (triggered by the table's Reset
   button) calls `table().resetPagination()` and `filter().resetFilters()` — the latter is what
   performs the field reset above and, via its `reset` output, calls `onReset()`.
3. `onReset()` calls `PartsPackingListStore.reset()`, which:
   - Clears `hasSearched` back to `false` — the table (`app-parts-packing-list-table`) is
     conditionally rendered only when `store.hasSearched() && store.data().length > 0`, so it
     disappears entirely, exactly as it does before the very first search.
   - Clears `data`/`columns` back to empty.
   - Clears the request/raw-rows cache used by
     `skip-refetch-when-date-range-unchanged-23-09-2026-11_00_AM.md`, so the next search after
     a Reset always performs a real fetch rather than reusing pre-Reset cached rows.
4. No automatic re-fetch happens on Reset — matching every other report's "no data until Show
   Report is explicitly submitted" behavior. The user must click Show Report again (now with
   the restored default filters) to see results.

## Acceptance criteria

- After clicking Reset: Invoice Number and Delivery Number inputs are empty, Date From/Date To
  show the same default (last 1 month) range as a fresh page load, and the table is no longer
  visible (same as before any search was ever submitted).
- No fetch happens automatically as a result of clicking Reset.
- Clicking Show Report again after a Reset performs a real fetch (not served from any stale
  cache) and displays results matching the restored default filters.
