# All Reports — Spec: Filter-to-Payload Audit + Centered Loader

**Created:** 2026-09-18 16:05 IST

## Status

Implemented.

## Purpose

Two checks requested together, across every implemented report (Dealer
Ledger, Warranty Cost Report, Warranty Reconciliation, Parts Packing
List):

1. **Every filter field actually reaches the real API request** — audit
   each report's filter-panel fields against its service's mapping into
   the request body/query params, confirmed via each service's existing
   `HttpTestingController`/spy-based unit tests.
2. **Every report's loading indicator is centered on screen**, not
   left-aligned — `LoadingIndicatorComponent`
   (loading-indicator-while-report-fetches-across-all-reports-18-09-2026-01_57_PM.md)
   is shared by all four reports, so fixing it once fixes it everywhere.

## Filter -> payload audit (per report)

- **Dealer Ledger** (`dealer-ledger.service.spec.ts`): `dealerCode` ->
  `kunnr` (zero-padded `00000` prefix), `companyCode` -> `bukrs`,
  `dateFrom` -> `fromDate`, plus the fixed `limit` (2000) — all asserted
  via `HttpTestingController` on the real `GET fetch-data-bricks-data`
  request's query params. Checkbox filters (`withOeDetails` etc.) are
  collected by the filter panel but the real Databricks endpoint doesn't
  accept them (confirmed contract is `bukrs`/`kunnr`/`fromDate`/`limit`
  only) — not a gap, since the endpoint has no such parameters.
- **Warranty Cost Report** (`warranty-cost.service.spec.ts`):
  `dealerCode` (zero-padded), `companyCode` (from config), `fromDate`,
  `toDate` — asserted via `req.request.body` on the real `POST
  fetch-data-bricks-data` request.
- **Warranty Reconciliation** (`warranty-reconciliation.service.spec.ts`):
  `dealerCode`, `companyCode` (fixed `TVSL`), `reconciliationDate: {
  from, to }` — asserted via the `ReportApiService.getData` spy's call
  arguments (this report goes through the generic report-keyed API, not
  a direct `HttpClient` call).
- **Parts Packing List** (`parts-packing-list.service.spec.ts`):
  `dealerCode`, `fromDate`, `toDate` — asserted via `req.request.body`;
  Invoice/Delivery Number/Case/Material are applied as client-side
  filters after the fetch (documented in
  parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md), since the
  confirmed API contract doesn't accept them — not a gap, a documented
  design decision.

All four already had passing coverage for this before this spec — no
mapping bugs were found during the audit; this spec formalizes the audit
as a checklist so future filter changes are checked against it.

## Centered loader requirement

1. `LoadingIndicatorComponent`'s host becomes `display: block; width:
   100%`, and its inner `.loading-indicator` uses `justify-content:
   center` (previously only `align-items: center`, which centered it
   vertically within its own row but left it flush left horizontally)
   plus generous vertical padding, so it visually centers within the
   available page width wherever it's rendered.
2. No per-report change needed — every report already renders
   `<app-loading-indicator />` as a full-width block-level sibling of the
   filter/table, so the shared component fix applies everywhere at once.

## Acceptance criteria

- Every report's real API call includes exactly the mapped fields listed
  above — confirmed via each service's existing tests, all still passing.
- The loading indicator renders horizontally centered on all four report
  pages.
- Full suite (`ng test`, 232/232) and `ng build` pass (no spec assertions
  needed changing for the loader's CSS-only fix).

## Open decisions

None — the "gaps" noted above (checkbox filters, Invoice/Delivery/Case/
Material) are pre-existing, documented design decisions from their
respective specs, not defects found by this audit.
