# Dealer Ledger — Spec 8: Default 1-Month Date Range

**Created:** 2026-09-16 13:59 IST

## Status

Proposed.

## Scope

This document specifies defaulting the Dealer Ledger filter panel's Report
Range (Date From/Date To) to a one-month window on initial load, instead of
starting empty.

## Current implementation observations

- `DealerLedgerFilterComponent.initialValue` (computed from
  `DealerContextService`) currently sets `dateFrom: null, dateTo: null` —
  the date range starts empty until the user picks dates.
- `ReportSearchBarComponent` patches its form from `initialValue()` via an
  `effect()`, so whatever `dateFrom`/`dateTo` values are supplied there are
  what the date inputs show on load.
- Per `remove-actions-row-16-09-2026-01_52_PM.md`, any field change (including this
  initial patch) feeds into the debounced auto-search — the effect's
  "skip first run" guard already prevents the initial prefill itself from
  triggering an unwanted extra search.

## Requirements

1. On initial load (and after Reset — see `reset-in-table-header-16-09-2026-01_59_PM.md`),
   Date From defaults to one month before today and Date To defaults to
   today, rather than both being empty.
2. The one-month default is computed at render/reset time (i.e. "today" and
   "one month ago from today"), not a hardcoded fixed date.
3. The user can still freely change Date From/Date To after the default is
   applied; this only affects the initial/reset value.
4. The default range must not itself be flagged as invalid by
   `isDateRangeInvalid()` (Date From before Date To).

## Acceptance criteria

- On first load, Date From/Date To show a one-month range ending today.
- After Reset, the date range returns to this same one-month default (not
  empty), consistent with Dealer Code/Description/Company Code also
  reverting to their context defaults.
- No invalid-date-range error shows for the default range.
- `dealer-ledger-filter.component.spec.ts` gains a test asserting the
  default date range on initial render.

## Open decisions

- Exact definition of "one month before today" (calendar month subtraction,
  e.g. `2026-09-16` → `2026-08-16`, vs. a fixed 30-day window) — TBD, default
  assumption is calendar-month subtraction.
- Whether Reset should restore this same rolling one-month-to-today window,
  or clear the date range back to empty (as it does for other fields) — TBD,
  default assumption is Reset also restores the one-month default, so the
  page never shows an empty/unbounded date range.
