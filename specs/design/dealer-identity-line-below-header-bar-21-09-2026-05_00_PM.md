# Design — Spec: Dealer Identity Line Below the Report Header Bar

**Created:** 21-09-2026 05:00 PM IST

## Status

Implemented.

## Purpose

Reference screenshot (P902 - Alternate Part Details) shows a small, left-aligned line just
below the report's title bar — "10015 - Pavan Sekhar Automobiles, Vizianagaram" (dealer code -
dealer name, city). Every report should show this same small, left-aligned dealer identity line
below its blue `ReportHeaderBarComponent`.

## API contract / data availability

Surveyed every dealer-context source in the app:

- `DealerContextService` (mock): `DealerContext` has `dealerCode`, `dealerName`,
  `dealerDescription`, `companyCode`, `companyName` — no city field.
- Every report's config API context (`DealerLedgerConfigContext`,
  `WarrantyCostConfigContext`, `WarrantyReconciliationConfigContext`,
  `PartsPackingListConfigContext`): `dealerCode` + `dealerDescription` only — no city field.

No data source in the app carries a city/location today. The line therefore renders as
`"{dealerCode} - {dealerName}"`, omitting the city segment, until a backend/config change adds
one (see Open decisions).

## Requirement

1. New shared, presentational `ReportDealerIdentityComponent`
   (`src/app/shared/ui/report-dealer-identity/`) — `dealerCode`/`dealerName` required inputs,
   renders `"{dealerCode} - {dealerName}"` as a small (`0.8125rem`), left-aligned paragraph, or
   nothing if both are empty.
2. Wired into every report page, directly below `<app-report-header-bar>`:
   - `dealer-ledger-toolbar.component` — new `dealerCode`/`dealerName` inputs, passed in from
     `dealer-ledger-list.component.html` via `config()?.context`.
   - `warranty-cost-report-list.component` — from `config()?.context`.
   - `warranty-reconciliation-list.component` — from `config()?.context`.
   - `parts-packing-list-list.component` — new `dealerCode`/`dealerName` computed signals,
     preferring `config()?.context` and falling back to the existing injected
     `DealerContextService` (mirroring this report's existing `onSearch()` fallback pattern).
   - `goods-acknowledgement-list.component` — from the already-injected
     `DealerContextService` (no config exists for this report).
   - `report-search-only-page.component` (shared by PQM, VOR Print, Warranty Labour Tax
     Invoice) — from the already-injected `DealerContextService`.

## Acceptance criteria

- Every report page shows a small, left-aligned "{dealerCode} - {dealerName}" line directly
  below its blue header bar.
- No report throws or shows a blank identity line when its dealer/config data hasn't loaded yet
  — inputs default to empty string, and the component renders nothing until at least one value
  is present.

## Open decisions

- No city/location field exists in `DealerContextService` or any report's config context —
  add one (backend + `DealerContext`/`*ConfigContext` models) before the line can show
  "code - name, city" as in the reference screenshot. Until then it renders "code - name" only.
