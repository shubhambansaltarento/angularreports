# Shared Data Table — Spec: Reset Button After Export, in Every Report's Table

**Created:** 21-09-2026 06:30 PM IST

## Status

Implemented.

## Purpose

The shared `DataTableComponent`'s optional header "Reset" control (`showReset`) rendered
*before* the Export menu, and was only wired up by Dealer Ledger — Goods Acknowledgement,
Warranty Reconciliation, and Parts Packing List had no Reset control in their tables at all.
The user asked for a Reset button positioned after Export, present in every report's table.

## Requirement

1. `data-table.component.html`: move the `showReset()` button to render after the Export menu
   `<div>`, instead of before it — applies to every consumer, Dealer Ledger included.
2. Enable `[showReset]="true"` on every report's table that didn't already have it:
   - **Goods Acknowledgement** — wired directly to the existing `onClear()` page method (no
     new store/filter reset logic needed; this report already had a page-level Clear button
     with the same effect).
   - **Warranty Reconciliation** — new `resetFilters()` on `WarrantyReconciliationFilterComponent`
     (clears the search bar back to empty) and a new `reset()` on `WarrantyReconciliationStore`
     (clears filters/rows/pagination/effectiveColumns and resets `hasSearched` to `false`),
     wired the same way as Dealer Ledger: `WarrantyReconciliationTableComponent` exposes
     `resetPagination()` + a `reset` output; the list page's `onTableReset()` calls both
     `table().resetPagination()` and `filter().resetFilters()`, and the filter's own `reset`
     output triggers `store.reset()`.
   - **Parts Packing List** — same pattern: `PartsPackingListFilterComponent.resetFilters()`
     (resets the form back to `{ invoiceNumber: null, deliveryNumber: null, ...defaultDateRange() }`)
     and a new `PartsPackingListStore.reset()` (clears rows/columns/`hasSearched`/`lastRequest`),
     wired through `PartsPackingListTableComponent`'s new `resetPagination()`/`reset` output and
     the list page's `onTableReset()`.
3. Dealer Ledger's existing Reset wiring (`resetFilters()`/`hasActiveFilters()`/`resetDisabled`)
   is unchanged — only the button's position moved.
4. Neither new store `reset()` re-fetches automatically — both clear straight back to the
   pre-search (`hasSearched: false`) state, matching every one of these reports' existing "no
   data until Show Report is submitted" behavior, rather than Dealer Ledger's own `reset()`
   (which re-fetches with empty filters) — a deliberate difference, not an oversight, since
   Warranty Reconciliation/Parts Packing List have no default-fetch-on-empty-filters behavior
   to replicate.

## Acceptance criteria

- Every report's table (Dealer Ledger, Goods Acknowledgement, Warranty Reconciliation, Parts
  Packing List) shows a Reset button in its header, positioned after the Export control.
- Clicking Reset clears that report's filter form back to defaults and returns the table to its
  pre-search state (hidden, per each report's existing `hasSearched` gate) — without
  re-fetching automatically.
