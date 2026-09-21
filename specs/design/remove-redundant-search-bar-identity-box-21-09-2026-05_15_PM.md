# Design — Spec: Remove the Redundant Dealer Code/Description/Company Code Box

**Created:** 21-09-2026 05:15 PM IST

## Status

Implemented.

## Purpose

`ReportSearchBarComponent`'s `readonlyDealerFields` mode rendered a bordered box with
"Dealer Code" / "Dealer Description" / "Company Code" labels and read-only values, used by
Dealer Ledger, Warranty Cost Report, and Warranty Reconciliation's filter forms. Now that
`ReportDealerIdentityComponent` (`dealer-identity-line-below-header-bar-21-09-2026-05_00_PM.md`)
shows the same dealer code/name as a small line directly below every report's blue header bar,
this box duplicated that information further down the page, one screen below the header — the
user asked to remove it.

## Requirement

1. `report-search-bar.component.html`: delete the entire `readonlyDealerFields()` block that
   rendered the `.report-search-bar__identity-group` box (Dealer Code/Description/Company
   Code columns). When `readonlyDealerFields()` is `true`, the component now renders none of
   the identity fields — previously that flag switched between an editable and a read-only
   rendering of the same three fields; now it switches between rendering them (editable) and
   rendering nothing.
2. Delete the now-dead `.report-search-bar__identity-group/__identity-col/__card-label/__card-value`
   SCSS rules.
3. Dealer Ledger, Warranty Cost Report, and Warranty Reconciliation list pages did not
   previously have their own dealer-context fallback (they relied on the filter/search-bar
   showing it via `DealerContextService` before config loaded) — since `ReportDealerIdentityComponent`
   is bound at the page level, each of `dealer-ledger-list`, `warranty-cost-report-list`, and
   `warranty-reconciliation-list` now injects `DealerContextService` directly and computes
   `dealerCode`/`dealerName` as `config()?.context.<field> ?? dealerContext().<field>` —
   preserving the existing "shows dealer context immediately, then the real config context once
   it resolves" behavior, just sourced at the page instead of inside the search bar.

## Acceptance criteria

- No report renders the old bordered Dealer Code/Description/Company Code box anywhere.
- Dealer Ledger, Warranty Cost Report, and Warranty Reconciliation each still show a dealer
  identity line immediately (from `DealerContextService`) before their config API response
  resolves, then update to the config's `context` once it does — exactly as their filters did
  before this change, just via `ReportDealerIdentityComponent` instead.
- `showCompanyCode` and the editable-mode Dealer Code/Description/Company Code inputs (used
  when `readonlyDealerFields` is `false`, e.g. Goods Acknowledgement's/PQM's editable search
  bar) are unaffected.
