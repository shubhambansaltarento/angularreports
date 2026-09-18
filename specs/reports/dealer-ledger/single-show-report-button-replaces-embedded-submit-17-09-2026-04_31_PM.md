# Dealer Ledger — Spec: Single "Show Report" Button Replaces Embedded Submit

**Created:** 2026-09-17 16:31 IST

## Status

Implemented.

## Purpose

Consolidate the Dealer Ledger page down to one visible submit action. The
filter panel previously rendered its own "Show Report" submit button
(`dealer-ledger-filter.component.html`), and the page separately grew a
temporary "Fetch DealerLedge Databricks" manual-test button
(fetch-databricks-real-api-and-manual-test-button-17-09-2026-04_13_PM.md) —
leaving two buttons that both ultimately triggered a data fetch. This spec
removes the embedded button and repurposes the page-level button as the
single "Show Report" action, styled with Bootstrap's small/secondary
variants.

## Requirements

1. `DealerLedgerFilterComponent` no longer renders its own submit button or
   `.dealer-ledger-filter__submit-row` — its Submit/Date-Range-validation
   logic (`onSubmit()`) is renamed to a **public** `submit()` method, plus a
   new public `isSubmitDisabled()` (wrapping `searchBar().isDateRangeInvalid()`),
   both callable from the consuming page.
2. `DealerLedgerListComponent`'s page-level button (previously the
   Databricks manual-test hook) is renamed to "Show Report", styled with
   `btn btn-sm btn-secondary` (Bootstrap small + secondary), bound
   `[disabled]="filter().isSubmitDisabled()"`, and its click handler
   (`onShowReport()`) calls `this.filter().submit()` — i.e. it now drives the
   real filter-panel submit flow (Dealer Code/Description/Company
   Code/Date Range/checkboxes → `onSearch()` → `store.search()` →
   `DealerLedgerService.getEntries()` → the real `fetchDatabricksdata`
   endpoint), not a separate config-derived test path.
3. The previous config-derived `onFetchDatabricksTest()` method,
   `DEALER_CODE_KUNNR_PREFIX` constant, and
   `.dealer-ledger-list__databricks-test-btn` styling are removed — no longer
   needed now that the one button always submits the live filter form.

## Acceptance criteria

- The Dealer Ledger page shows exactly one submit-style button, labeled
  "Show Report", styled `btn btn-sm btn-secondary`.
- Clicking it submits whatever values are currently in the filter panel
  (Dealer Code/Description/Company Code/Date Range/checkboxes), identically
  to how the old embedded button behaved.
- The button is disabled exactly when the Date Range is invalid, matching
  the old embedded button's behavior.
- `dealer-ledger-filter.component.spec.ts` and
  `dealer-ledger-list.component.spec.ts` are updated to exercise
  `submit()`/`isSubmitDisabled()` and the renamed/relabeled button; full
  suite (`ng test`) and `ng build` both pass.

## Open decisions

None — this is a straightforward consolidation of the two ad hoc buttons
into the one intended by the original filter-panel design.
