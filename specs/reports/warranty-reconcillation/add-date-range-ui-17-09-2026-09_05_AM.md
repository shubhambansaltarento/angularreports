# Warranty Reconciliation — Add Real `reconciliationDate` Date Range (Backend Now Supports It)

**Created:** 2026-09-17 09:05 AM
**Superseded/corrected:** 2026-09-17 09:24 AM — backend config changed; see below.

## Status

Proposed.

## Purpose

This spec originally found (09:05 AM) that the backend rejected any
date parameter for `WARRANTY_RECONCILLATION` (`UNKNOWN_PARAMETER` on
`dateFrom`/`dateTo`), and planned a UI-only, non-functional Date Range
control pending backend support.

The backend has since been updated. Re-verified live just now (not
assumed):

`GET /api/v1/reports/WARRANTY_RECONCILLATION/config` now returns a
**third parameter**:

```json
{
  "name": "reconciliationDate",
  "label": "Reconciliation Date",
  "control": "DATE_RANGE",
  "dataType": null,
  "required": true,
  "validation": { "minDate": "2020-04-01", "maxDate": "$TODAY", "maxRangeDays": 366, "requireBothBounds": true },
  "layout": { "row": 2, "span": 6 }
}
```

...and a **third column** in `columnGroups`:

```json
{ "field": "reconciliationDate", "label": "Reconciliation Date", "dataType": "date", "format": "dd-MM-yyyy", "align": "left", "sortable": true, "defaultVisible": true, "visible": true }
```

Confirmed working end-to-end via a live `/data` call:

```
POST /api/v1/reports/WARRANTY_RECONCILLATION/data
{
  "parameters": {
    "dealerCode": "10015",
    "companyCode": "TVSL",
    "reconciliationDate": { "from": "2026-06-01", "to": "2026-07-31" }
  },
  "configVersion": "2026.09.1"
}
```

Response (4 real rows, each with a `reconciliationDate` in `DD-MM-YYYY`
string form, e.g. `"02-06-2026"`):

```json
{
  "reportCode": "WARRANTY_RECONCILLATION",
  "configVersion": "2026.09.1",
  "effectiveColumns": [
    { "columnName": "dealerCode", "isDefault": true, "isVisible": true },
    { "columnName": "dealerName", "isDefault": true, "isVisible": true },
    { "columnName": "reconciliationDate", "isDefault": true, "isVisible": true }
  ],
  "rows": [
    { "dealerCode": "10015", "dealerName": "PAWAN SARKAR AUTOMOBILES", "reconciliationDate": "02-06-2026" },
    { "dealerCode": "10015", "dealerName": "PAWAN SARKAR AUTOMOBILES", "reconciliationDate": "20-06-2026" },
    { "dealerCode": "10015", "dealerName": "PAWAN SARKAR AUTOMOBILES", "reconciliationDate": "10-07-2026" },
    { "dealerCode": "10015", "dealerName": "PAWAN SARKAR AUTOMOBILES", "reconciliationDate": "25-07-2026" }
  ],
  "totals": {},
  "paging": { "page": 1, "pageSize": 4, "totalRows": 4, "totalPages": 1 }
}
```

Important shape difference from every other report built so far:
`reconciliationDate` is sent as a **nested object** `{ "from": "...", "to": "..." }`
under `parameters.reconciliationDate` — NOT as two flat sibling fields
(`dateFrom`/`dateTo`) the way Dealer Ledger's `postingDate` range and
Warranty Cost's `claimDate` range are sent. This is a genuinely
different request shape and must not be copy-pasted from those
reports' request builders.

`required: true` — unlike Dealer Ledger/Warranty Cost Report (whose
date ranges are optional with a default range), this report's date
range is **mandatory**: `requireBothBounds: true`, and there's no
`defaultValue`. The Submit button must be disabled until both bounds
are chosen. `maxRangeDays: 366` and `minDate`/`maxDate` bounds also
apply (`minDate: 2020-04-01`, `maxDate: today`).

This replaces the two earlier specs' "no date range exists"
premise (`dealer-ledger-style-page-17-09-2026-08_37_AM.md`,
`api-integration-17-09-2026-08_37_AM.md`) and the prior version of
this file's "UI-only, don't send it" plan — both are now superseded
for the date-range aspect specifically; their non-date-range content
(read-only dealer identity fields, no summary/totals, backend key
spelling, etc.) still stands unchanged.

## Scope

- Re-enable `ReportSearchBarComponent`'s Date Range section on
  `WarrantyReconciliationFilterComponent`: pass `showDateRange="true"`
  (or omit the input — `true` is the default) instead of `"false"`.
  Also revert `showCompanyCode`/`readonlyDealerFields` — unchanged,
  still `showCompanyCode="false"`, `readonlyDealerFields="true"`.
- Since `reconciliationDate` has **no default value** and is required,
  the filter must not auto-submit or default to any implicit range
  (unlike `defaultDateRange()`'s 1-month default used elsewhere) —
  the user must explicitly pick both bounds before Submit is enabled.
- `WarrantyReconciliationFilterComponent`/`ReportSearchBarComponent`
  must apply the reconciliation-specific validation constraints:
  `minDate: 2020-04-01`, `maxDate: today`, `maxRangeDays: 366`,
  both bounds required. Check whether `ReportSearchBarComponent`
  already supports `minDate`/`maxDate`/`maxRangeDays` as inputs (used
  for Dealer Ledger/Warranty Cost's own range validation) — if so,
  reuse those inputs; only add new ones if the existing validation
  inputs can't express "both bounds mandatory, no default."
- `WarrantyReconciliationService.getData()`: build the request as
  `{ parameters: { dealerCode, companyCode, reconciliationDate: { from, to } }, paging, sort: [], configVersion }`
  — nested object, not flat `dateFrom`/`dateTo` keys. Dates sent in
  `YYYY-MM-DD` (ISO date, no time), matching the exact values that
  worked in the live test above.
- `WarrantyReconciliationRow`/model: add `reconciliationDate: string`
  (raw `DD-MM-YYYY` string from the API, same as Dealer Ledger's
  `docDate`/Warranty Cost's `orderDate`) — apply the same `toIsoDate()`
  normalization before handing it to Angular's `DatePipe` for display,
  per this codebase's established DD-MM-YYYY→ISO pattern.
- `warranty-reconciliation-column-definitions.ts`: add the
  `reconciliationDate` column (sortable, `date` type, `dd-MM-yyyy`
  format) to the default column set.
- Filter component's emitted filter type gains `reconciliationFrom`/
  `reconciliationTo` (or equivalent) fields; list component's
  `toFilters()`/request builder maps them into the nested
  `reconciliationDate: {from, to}` shape.
- Out of scope: `dealerCode`/`companyCode` handling — unchanged from
  the already-implemented spec (still sourced from `config().context`
  per the source-of-truth fix).

## Requirements

1. The Date Range control renders on the Warranty Reconciliation page,
   with the same visual style as Dealer Ledger/Warranty Cost Report.
2. Submit is disabled until both a from-date and to-date are selected
   (no default range, no partial-range submission), and disabled if
   the selected range violates `minDate`/`maxDate`/`maxRangeDays`.
3. `POST /data`'s request body sends `parameters.reconciliationDate`
   as `{ "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }` — never as flat
   `dateFrom`/`dateTo` keys.
4. The results table shows a "Reconciliation Date" column, correctly
   parsed from the API's `DD-MM-YYYY` row values and displayed via
   Angular's `DatePipe` (matching the existing `toIsoDate()` pattern).
5. No other report's Date Range request shape or validation changes —
   this nested-object shape and mandatory-both-bounds behavior is
   scoped to Warranty Reconciliation only.

## Acceptance criteria

- Network tab confirms a `/data` request body matching:
  `{"parameters":{"dealerCode":"10015","companyCode":"TVSL","reconciliationDate":{"from":"2026-06-01","to":"2026-07-31"}}, ...}`
  for a real search, and returns real rows (verified against the live
  backend, not mocked).
- Selecting only one bound (or none) keeps Submit disabled.
- Selecting a range longer than 366 days, or outside
  2020-04-01..today, is rejected client-side (or at minimum surfaces
  the resulting `VALIDATION_FAILED` from the backend gracefully,
  matching this codebase's existing error-banner pattern, if
  client-side range-length validation isn't already wired for reuse).
- Table renders "Reconciliation Date" formatted as `dd-MM-yyyy` (or
  the app's standard display format, consistent with other date
  columns) for each row.
- `warranty-reconciliation.service.spec.ts`,
  `warranty-reconciliation-filter.component.spec.ts`,
  `warranty-reconciliation-list.component.spec.ts` updated: assert the
  nested `reconciliationDate: {from, to}` request shape, and that
  Submit is disabled without both bounds chosen.

## Open decisions

- None remaining — the earlier spec's "blocked on backend" open
  decision is resolved: the backend now fully supports this parameter,
  confirmed via live testing.
