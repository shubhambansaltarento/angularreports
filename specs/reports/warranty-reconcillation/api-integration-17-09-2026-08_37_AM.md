# Warranty Reconciliation — Real API Integration (`WARRANTY_RECONCILLATION`)

**Created:** 2026-09-17 08:37 AM

## Status

Proposed.

## Purpose

Wire the Warranty Reconciliation feature to the real, live-verified
backend endpoints, mirroring the `WarrantyCostService`/`WarrantyCostStore`
architecture exactly:

- `GET /api/v1/reports/WARRANTY_RECONCILLATION/config`
- `POST /api/v1/reports/WARRANTY_RECONCILLATION/data`

Both endpoints were tested directly against the live backend before
writing this spec (not assumed). See the companion
`dealer-ledger-style-page-17-09-2026-08_37_AM.md` for the full captured
`/config` response; the `/data` response is captured below.

### `POST /api/v1/reports/WARRANTY_RECONCILLATION/data`

Request used:
```json
{"parameters":{"dealerCode":"10015","companyCode":"TVSL"},"paging":{"page":1,"pageSize":50},"sort":[],"configVersion":"2026.09.1"}
```

Response:
```json
{
  "reportCode": "WARRANTY_RECONCILLATION",
  "configVersion": "2026.09.1",
  "effectiveColumns": [
    { "columnName": "dealerCode", "isDefault": true, "isVisible": true },
    { "columnName": "dealerName", "isDefault": true, "isVisible": true }
  ],
  "rows": [{ "dealerCode": "10015", "dealerName": "PAWAN SARKAR AUTOMOBILES" }],
  "totals": {},
  "paging": { "page": 1, "pageSize": 1, "totalRows": 1, "totalPages": 1 },
  "meta": { "generatedAt": "2026-09-17T03:07:40.767628300Z", "dataAsOf": "2026-09-17T03:07:40.767628300Z", "queryMs": 3 }
}
```

`totals` is an empty object — this report has no summary/aggregate row
(unlike Warranty Cost Report's `{laborCost, partCost, totalCost}`).
No date field on any row, so the `toIsoDate()` normalization pattern
used for Dealer Ledger's `docDate`/Warranty Cost's `orderDate` does not
apply here.

## Scope

- `WARRANTY_RECONCILLATION_REPORT_KEY = 'WARRANTY_RECONCILLATION'`
  constant (double-L, verbatim backend spelling — not "corrected").
- `warranty-reconciliation.model.ts` — `WarrantyReconciliationRow { dealerCode: string; dealerName: string }`;
  no summary/totals model needed (`totals` is always `{}`).
- `WarrantyReconciliationService` (mirrors `WarrantyCostService`):
  - `getConfig()`: caches result of `ReportApiService.getConfig(WARRANTY_RECONCILLATION_REPORT_KEY)`.
  - `getData(filters)`: builds `{ parameters: { dealerCode, companyCode }, paging, sort: [], configVersion }`
    and calls `ReportApiService.getData(WARRANTY_RECONCILLATION_REPORT_KEY, request)`.
    No date-range fields in `parameters` at all.
- `WarrantyReconciliationStore` (mirrors `WarrantyCostStore`): `loading`,
  `hasSearched`, `error`, `data`, `effectiveColumns` signals; `search()`/`refresh()`
  via `Subject` + `switchMap` + `catchError`. No `summary` signal (nothing to expose — `totals` is empty).
- `warranty-reconciliation-column-definitions.ts` + `toWarrantyReconciliationColumns()` —
  maps `effectiveColumns` (`dealerCode`, `dealerName`) onto `TableColumn[]`,
  `hidden: !isDefault`, mirroring the existing pattern exactly.
- `WarrantyReconciliationTableComponent` — composes shared `DataTableComponent`,
  mirrors `WarrantyCostTableComponent`.
- `WarrantyReconciliationFilterComponent` — composes `ReportSearchBarComponent`
  with `readonlyDealerFields="true"`, `showCompanyCode="false"`, and the new
  `showDateRange="false"` input (see below).
- `WarrantyReconciliationListComponent` — mirrors `WarrantyCostReportListComponent`,
  including the dealer-code race-condition fix from day one: `onSearch()`/`toFilters()`
  read `dealerCode`/`dealerDescription` from `this.config()?.context` directly
  (falling back to the emitted form value only if config hasn't loaded yet),
  per `config-context-dealer-code-source-of-truth-17-09-2026-08_19_AM.md` —
  applied proactively here rather than retrofitted after a bug report.
- **Shared component change**: `ReportSearchBarComponent` gains a
  `showDateRange` input (`boolean`, default `true`) — when `false`, the
  Date Range section (and its validity gating of the submit button) is
  omitted entirely from the template. Mirrors the existing
  `showCompanyCode` precedent exactly. Every existing consumer
  (Dealer Ledger, Warranty Cost Report) is unaffected, since they don't
  pass this input and it defaults to today's behavior.
- Export filename: reuse `buildReportExportFilename(WARRANTY_RECONCILLATION_REPORT_KEY, dealerCode, now)`,
  same as Dealer Ledger/Warranty Cost Report.
- `app.routes.ts` — new lazy route for `warranty-reconciliation`, removed
  from `SEARCH_ONLY_REPORT_CONFIGS`.

## Requirements

1. `/config` and `/data` are called with the real report key
   `WARRANTY_RECONCILLATION` (verbatim, double-L) — never the
   correctly-spelled English word.
2. The `/data` request body never includes a date-range field of any
   kind (no `dateFrom`/`dateTo`/`claimDate`, etc.) — only `dealerCode`
   and `companyCode` in `parameters`.
3. `dealerCode`/`companyCode` sent to `/data` come from `config().context`
   (dealerCode/description) and `config().parameters` default
   (companyCode `TVSL`) — matching the source-of-truth fix applied to
   Warranty Cost Report, built in from the start here.
4. `ReportSearchBarComponent`'s new `showDateRange` input defaults to
   `true`; passing `false` removes the Date Range section and its
   submit-gating validity check with no effect on any other input's
   behavior.
5. Table renders `dealerCode`/`dealerName` columns from `effectiveColumns`,
   consistent with every other report's column-visibility mapping.

## Acceptance criteria

- Network tab confirms `GET .../reports/WARRANTY_RECONCILLATION/config`
  and `POST .../reports/WARRANTY_RECONCILLATION/data` (double-L) are
  the actual URLs called.
- `POST /data`'s body for dealer `10015` matches:
  `{"parameters":{"dealerCode":"10015","companyCode":"TVSL"},"paging":{"page":1,"pageSize":50},"sort":[],"configVersion":"2026.09.1"}`
  (page size may reflect the config's `paging.defaultPageSize`).
- Submitting renders a table row `10015 | PAWAN SARKAR AUTOMOBILES`
  against the live backend.
- `report-search-bar.component.spec.ts` gains a test: with
  `showDateRange="false"`, no Date Range fields render and the submit
  button is never disabled by date validity; existing tests (no input
  passed) continue to pass unchanged, confirming the default preserves
  current behavior for Dealer Ledger/Warranty Cost Report.
- New spec files: `warranty-reconciliation.service.spec.ts`,
  `warranty-reconciliation.store.spec.ts`,
  `warranty-reconciliation-list.component.spec.ts` (including a
  config-context-source-of-truth test mirroring
  `warranty-cost-report-list.component.spec.ts`'s equivalent test),
  `warranty-reconciliation-filter.component.spec.ts`.

## Open decisions

- None — directly mirrors Warranty Cost Report's already-established
  and implemented pattern, with the one net-new shared capability
  (`showDateRange`) scoped narrowly and additively.
