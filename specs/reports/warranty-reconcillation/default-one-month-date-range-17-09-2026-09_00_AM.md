# Warranty Reconciliation — Default the Reconciliation Date Range to the Last 1 Month

**Created:** 2026-09-17 09:00 AM

## Status

Proposed.

## Purpose

Since `add-date-range-ui-17-09-2026-09_05_AM.md` made the
`reconciliationDate` range mandatory with **no `defaultValue`**,
`WarrantyReconciliationFilterComponent.initialValue` currently sets
`dateFrom`/`dateTo` to `null` — Submit stays disabled until the user
manually picks both bounds, and the page never auto-fetches `/data` on
load with any range. This has been reported as `/data` calls
"failing" — in practice, the request is disabled/never sent client-side
until dates are picked, but the user wants the page to behave like
Dealer Ledger/Warranty Cost Report: default to a sensible 1-month
range immediately, so a first-time Submit works right away without
requiring the user to first open the date pickers.

This reuses the existing shared `defaultDateRange()` util
(`shared/utils/default-date-range.ts`) — "one month up to today" —
already used by Dealer Ledger and Warranty Cost Report for exactly
this purpose. No new date-math needs to be written.

## Scope

- `WarrantyReconciliationFilterComponent.initialValue`: replace the
  hardcoded `dateFrom: null, dateTo: null` with
  `...defaultDateRange()`, matching Dealer Ledger's/Warranty Cost
  Report's own `initialValue` pattern exactly.
- No change to the mandatory-range validation itself
  (`requireDateRange`, `minDate: 2020-04-01`, `maxDate: today`,
  `maxRangeDays: 366`) — the default value must itself satisfy these
  constraints (it does: "1 month up to today" is well within
  `maxRangeDays: 366` and above `minDate`).
- No change to `ReportSearchBarComponent` — it already patches its
  form from `initialValue()` via its existing `effect()`; supplying a
  non-null default is exactly what Dealer Ledger/Warranty Cost Report
  already rely on.
- Out of scope: auto-submitting on page load — this spec only makes
  the *default field values* pre-filled and valid; per this report's
  established behavior (`WarrantyCostReportListComponent`'s "creates
  without fetching any data" test), the user must still click "Show
  Report" once. No new auto-search-on-load behavior is being
  introduced here or anywhere else in this codebase.

## Requirements

1. On first render (before any Submit), the Reconciliation Date
   fields show a valid, pre-filled 1-month range (today minus 1 month
   → today), not empty fields.
2. Submit is enabled immediately on load (no need to first touch the
   date pickers) — `isDateRangeInvalid()` is `false` with the default
   values applied.
3. Clicking "Show Report" immediately after load sends a real,
   valid `/data` request with `reconciliationDate: { from, to }` set
   to the default range, and returns data successfully (verified
   against the live backend).
4. No change to any other report's default-date-range behavior.

## Acceptance criteria

- `warranty-reconciliation-filter.component.spec.ts`: a new/updated
  test asserts `initialValue()`'s `dateFrom`/`dateTo` are non-null and
  equal to `defaultDateRange()`'s output, and that Submit is not
  disabled on initial render with no further user interaction.
- Manually verified: loading `/warranty-reconciliation` and
  immediately clicking "Show Report" returns real rows from the live
  backend rather than being blocked or erroring.
- Full test suite (`npx ng test --watch=false`) and `tsc --noEmit`
  still pass.

## Open decisions

- None — directly reuses an already-established, already-shared util
  with no new logic.
