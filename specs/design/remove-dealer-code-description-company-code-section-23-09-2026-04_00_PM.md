# Design — Spec: Remove Editable Dealer Code/Description/Company Code From PQM/VOR Print/Warranty Labour Tax Invoice

**Created:** 23-09-2026 04:00 PM IST

## Status

Implemented.

## Purpose

PQM, VOR Print, and Warranty Labour Tax Invoice's search form (via the shared
`ReportSearchOnlyPageComponent` → `ReportSearchBarComponent`) rendered editable Dealer
Code/Dealer Description/Company Code text inputs, pre-filled from the mock dealer context. This
duplicated the dealer identity already shown once, read-only, via
`ReportDealerIdentityComponent` directly below the blue header bar on the same page
(`dealer-identity-line-below-header-bar-21-09-2026-05_00_PM.md`) — the same redundancy already
removed from Dealer Ledger/Warranty Cost Report/Warranty Reconciliation's read-only variant of
this box in `remove-redundant-search-bar-identity-box-21-09-2026-05_15_PM.md`. This spec applies
the equivalent removal to these three reports' editable variant.

## Requirement

`report-search-only-page.component.html`'s `<app-report-search-bar>` gets
`[readonlyDealerFields]="true"` — since `ReportSearchBarComponent`'s `readonlyDealerFields`
mode renders nothing for the Dealer Code/Description/Company Code fields (per
`remove-redundant-search-bar-identity-box-21-09-2026-05_15_PM.md`, which emptied that branch
entirely rather than switching it to a read-only display), this removes the section outright
rather than making it non-editable text. The Date Range fields (`showDateRange`, default
`true`) are unaffected and continue to render below.

## Acceptance criteria

- PQM, VOR Print, and Warranty Labour Tax Invoice's search form no longer shows Dealer Code,
  Dealer Description, or Company Code fields, editable or otherwise.
- The Date Range fields still render and function as before.
- The dealer's code/name is still visible exactly once per page, via
  `ReportDealerIdentityComponent` below the header bar.
