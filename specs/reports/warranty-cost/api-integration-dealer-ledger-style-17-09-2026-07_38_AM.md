# Warranty Cost Report — Real API Integration, Dealer-Ledger-Style

**Created:** 2026-09-17 07:38 AM

## Status

Implemented. Open decisions resolved as: `isVisible: false` skips the
column entirely (untested against a real `false` value — flagged in
code comments as an assumption); Company Code silently defaulted
(`TVSL`), never rendered; Claim Date's `minDate`/`maxDate`/
`maxRangeDays` constraints NOT yet enforced client-side (left to the
backend, per the spec's default); no mock fallback service added;
`claimDate` row-value normalization deferred (unverified, zero real
rows tested). `hasTable` is now `true`; Reports Home no longer shows
the "Search parameters only" badge for this report.

## Purpose

Wire Warranty Cost Report up to the real backend
(`http://localhost:8080/api/v1/reports/WARRANTY_COST/config` and
`.../data`), fetching config on entry and data on Submit, mapping both
onto the app's internal shapes and rendering a real results table —
mirroring Dealer Ledger's architecture (`DealerLedgerService`,
`DealerLedgerStore`, `DealerLedgerConfig`/`DealerLedgerResponse`
models, `toDealerLedgerColumns()`, `DealerLedgerTableComponent`,
`hasSearched`-gated table visibility). This graduates Warranty Cost
Report from "search parameters only" (`hasTable: false`,
`warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md`)
to a fully working, real-data report — both `/config` and `/data` were
confirmed live and returning real responses (below), so `hasTable`
becomes `true`.

## Confirmed real API contracts

Both endpoints were tested directly against the running backend before
writing this spec (not assumed).

### `GET /api/v1/reports/WARRANTY_COST/config`

```json
{
  "reportCode": "WARRANTY_COST",
  "title": "Warranty Cost",
  "configVersion": "2026.09.1",
  "context": { "dealerCode": "10015", "dealerDescription": "PAWAN SARKAR AUTOMOBILES" },
  "parameters": [
    {
      "name": "dealerCode", "label": "Dealer Code", "control": "TEXT", "dataType": "STRING",
      "required": false, "defaultValue": null, "options": null, "validation": null,
      "layout": { "row": 1, "span": 4 }, "multiple": null, "lookup": null
    },
    {
      "name": "companyCode", "label": "Company Code", "control": "SELECT", "dataType": "STRING",
      "required": true, "defaultValue": "TVSL",
      "options": [{ "value": "TVSL", "label": "TVS Lucas" }],
      "validation": null, "layout": { "row": 1, "span": 4 }, "multiple": null, "lookup": null
    },
    {
      "name": "claimDate", "label": "Claim Date", "control": "DATE_RANGE", "dataType": null,
      "required": true, "defaultValue": null, "options": null,
      "validation": { "minDate": "2020-04-01", "maxDate": "$TODAY", "maxRangeDays": 366, "requireBothBounds": true },
      "layout": { "row": 2, "span": 6 }, "multiple": null, "lookup": null
    }
  ],
  "columnGroups": [
    {
      "key": "base", "label": "Warranty Cost", "visibleWhen": null,
      "columns": [
        { "field": "dealerCode", "label": "Dealer Code", "dataType": "string", "align": "left", "sortable": true, "columnType": "DATA", "defaultVisible": true, "visible": true, "...": "(format/aggregate/editable/action/displayHints all null/false/{})" },
        { "field": "dealerName", "label": "Dealer Name", "dataType": "string", "align": "left", "sortable": false, "defaultVisible": true, "visible": true },
        { "field": "claimNo", "label": "Claim No.", "dataType": "string", "align": "left", "sortable": true, "defaultVisible": true, "visible": true },
        { "field": "claimDate", "label": "Claim Date", "dataType": "date", "format": "dd-MM-yyyy", "align": "left", "sortable": true, "defaultVisible": true, "visible": true },
        { "field": "partNo", "label": "Part No.", "dataType": "string", "align": "left", "sortable": false, "defaultVisible": true, "visible": true },
        { "field": "partDescription", "label": "Part Description", "dataType": "string", "align": "left", "sortable": false, "defaultVisible": true, "visible": true },
        { "field": "laborCost", "label": "Labor Cost", "dataType": "decimal", "format": "#,##0.00", "align": "right", "aggregate": "SUM", "defaultVisible": true, "visible": true },
        { "field": "partCost", "label": "Part Cost", "dataType": "decimal", "format": "#,##0.00", "align": "right", "aggregate": "SUM", "defaultVisible": true, "visible": true },
        { "field": "totalCost", "label": "Total Cost", "dataType": "decimal", "format": "#,##0.00", "align": "right", "aggregate": "SUM", "defaultVisible": true, "visible": true }
      ]
    }
  ],
  "export": { "formats": ["XLSX", "PDF"] },
  "paging": { "defaultPageSize": 50, "maxPageSize": 1000 },
  "reportGroup": null, "groupLabel": null, "groupOrder": null,
  "parameterGroups": [], "dateRangeConstraints": [], "rowKey": null, "actions": []
}
```

### `POST /api/v1/reports/WARRANTY_COST/data`

Tested request:
```json
{
  "parameters": { "dealerCode": "10015", "companyCode": "TVSL", "claimDate": { "from": "2026-08-17", "to": "2026-09-17" } },
  "paging": { "page": 1, "pageSize": 50 },
  "sort": [],
  "configVersion": "2026.09.1"
}
```

Real response (empty result set for this date range, but structurally
confirmed):
```json
{
  "reportCode": "WARRANTY_COST",
  "configVersion": "2026.09.1",
  "effectiveColumns": [
    { "columnName": "dealerCode", "isDefault": true, "isVisible": true },
    { "columnName": "dealerName", "isDefault": true, "isVisible": true },
    { "columnName": "claimNo", "isDefault": true, "isVisible": true },
    { "columnName": "claimDate", "isDefault": true, "isVisible": true },
    { "columnName": "partNo", "isDefault": true, "isVisible": true },
    { "columnName": "partDescription", "isDefault": true, "isVisible": true },
    { "columnName": "laborCost", "isDefault": true, "isVisible": true },
    { "columnName": "partCost", "isDefault": true, "isVisible": true },
    { "columnName": "totalCost", "isDefault": true, "isVisible": true }
  ],
  "rows": [],
  "totals": {},
  "paging": { "page": 1, "pageSize": 50, "totalRows": 0, "totalPages": 0 },
  "meta": { "generatedAt": "2026-09-17T02:07:52.763217400Z", "dataAsOf": "2026-09-17T02:07:52.762309600Z", "queryMs": 0 }
}
```

## Root cause / gaps vs. current placeholder implementation

- `WarrantyCostReportFilterComponent`/`WarrantyCostReportListComponent`
  (`warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md`)
  currently: prefill Dealer Code/Description from the mocked
  `DealerContextService` only (never the real config's `context`), show
  no Company Code field at all, use a generic 1-month
  `defaultDateRange()` with no min/max/range-length validation, and
  `onSearch()` is a hardcoded no-op — none of this calls any API.
- The real config **requires** `companyCode` (`required: true`,
  default `"TVSL"`) even though the reference SAP screenshot the user
  shared didn't show a visible Company Code field — this needs
  resolving (see Open decisions): the request must include
  `companyCode`, but the UI may still choose not to expose it as an
  editable field (defaulting it silently), consistent with the
  screenshot.
- The date parameter is `claimDate` (a single `DATE_RANGE` control
  with `minDate`/`maxDate`/`maxRangeDays`/`requireBothBounds`
  constraints) — not Dealer Ledger's `postingDate`/`dateFrom`+`dateTo`
  naming, and with real validation constraints Dealer Ledger's simpler
  date range does not have.
- The response's `effectiveColumns` entries include an extra
  `isVisible` field beyond Dealer Ledger's `{ columnName, isDefault }`
  shape (effective-columns-shape-change-17-09-2026-05_41_AM.md) — its
  exact semantics vs. `isDefault` are not yet confirmed (see Open
  decisions); both are `true` for every column in this response, so no
  real column is exercised as `false` for either flag yet.
- `totals` in the real response is an empty object `{}` for this
  report (not Dealer Ledger's fixed `{debit, credit}` shape) — Warranty
  Cost's summary concept (if any) is undefined; `paging`/`meta` are
  otherwise directly analogous to Dealer Ledger's `paging`.
- No `WarrantyCostService`/`WarrantyCostStore`/models/column
  definitions/table component exist yet — this is a from-scratch build
  mirroring Dealer Ledger's, not a small patch.

## Scope

- New models: `WarrantyCostConfig` (reportCode/title/configVersion/
  context/parameters/columnGroups/export/paging, matching the
  confirmed real shape — richer than `DealerLedgerConfig`, since this
  backend's config schema is itself richer), `WarrantyCostApiRequest`/
  `WarrantyCostApiResponse` (real backend request/response shapes),
  `WarrantyCostResponse`/`WarrantyCostRow` (internal shapes, mirroring
  `DealerLedgerResponse`/`DealerLedgerRow`).
- New `WarrantyCostService` (`getConfig()`/`getEntries()`), mirroring
  `DealerLedgerService`'s config-caching/request-mapping/response-mapping
  pattern — via the same generic `ReportApiService`
  (`reportKey: 'WARRANTY_COST'`).
- New `WarrantyCostStore` (loading/hasSearched/error/data/effectiveColumns/
  filters), mirroring `DealerLedgerStore` — including the same
  `hasSearched` gate
  (`hide-table-until-submit-17-09-2026-12_01_AM.md`) so the table
  doesn't render until the first Submit.
- New `WarrantyCostColumnDefinitions`/`toWarrantyCostColumns()`,
  mirroring `dealer-ledger-column-definitions.ts` — mapping the real
  `columnGroups[].columns[]` field names
  (`dealerCode`/`dealerName`/`claimNo`/`claimDate`/`partNo`/
  `partDescription`/`laborCost`/`partCost`/`totalCost`) onto
  `TableColumn<WarrantyCostRow>` definitions, `hidden: !isDefault`
  (matching the resolution of the `isVisible` open decision below).
- New `WarrantyCostTableComponent`, mirroring
  `DealerLedgerTableComponent` — composes the shared
  `DataTableComponent`, formats `claimDate` (already `dd-MM-yyyy` per
  the config's own `format` — confirm whether this needs the same
  `toIsoDate()`-style normalization Dealer Ledger needed for its
  `DD-MM-YYYY` dates, per
  `doc-date-dd-mm-yyyy-format-17-09-2026-12_00_AM.md`), `laborCost`/
  `partCost`/`totalCost` as currency.
- `WarrantyCostReportFilterComponent` — prefer the real config's
  `context`/Company Code default over `DealerContextService`
  (mirroring `DealerLedgerFilterComponent.initialValue`), and use the
  config's real `claimDate` validation constraints (`minDate`,
  `maxDate: "$TODAY"`, `maxRangeDays: 366`) instead of the generic
  1-month `defaultDateRange()` (see Open decisions for exactly how
  `$TODAY` and the range-length limit are enforced).
- `WarrantyCostReportListComponent` — fetch config on entry (mirroring
  `config-call-on-entry-16-09-2026-02_32_PM.md`), gate the table behind
  `store.hasSearched()`, wire the filter's `searched` output to
  `store.search()`, add a header/breadcrumb (already built), and an
  export filename via `buildReportExportFilename('WARRANTY_COST', dealerName)`
  (already generic, per `generic-report-export-filename-17-09-2026-06_46_AM.md`).
- `warranty-cost-report.config.ts` — `hasTable` becomes `true` (both
  APIs are confirmed working with real data returned, even if this
  particular test query matched zero rows).
- `warranty-cost-report.routes.ts` — provide `WarrantyCostStore`/
  `WarrantyCostService` at the route level, mirroring
  `dealer-ledger.routes.ts`.
- Out of scope: any mock/fallback service (Dealer Ledger has a
  `DealerLedgerMockService` fallback on fetch failure — whether
  Warranty Cost needs an equivalent is an Open decision, not assumed
  required just because Dealer Ledger has one).

## Requirements

1. On page entry, `WarrantyCostReportListComponent` fetches
   `/config` and uses it to prefill Dealer Code/Description (context)
   and the Company Code value (default `"TVSL"`, sent in every
   request even though not shown as an editable field, per the
   reference screenshot).
2. No data fetch happens until Submit — `hasSearched` stays `false`
   until then, and the table is not rendered before that point,
   exactly like Dealer Ledger.
3. Submitting issues `POST /data` with `parameters.dealerCode`,
   `parameters.companyCode`, `parameters.claimDate.{from,to}`,
   `paging`, `sort: []`, `configVersion` — matching the confirmed real
   request shape.
4. The response's `effectiveColumns` (with both `isDefault` and
   `isVisible`) drives the table's columns/default-visibility, per the
   resolution of the `isVisible` semantics open decision.
5. The table renders Dealer Code, Dealer Name, Claim No., Claim Date,
   Part No., Part Description, Labor Cost, Part Cost, Total Cost —
   currency-formatted for the three cost columns, date-formatted for
   Claim Date.
6. `warranty-cost-report.config.ts`'s `hasTable` becomes `true`, and
   Warranty Cost Report no longer shows the Reports Home "Search
   parameters only" badge.

## Acceptance criteria

- Loading `/warranty-cost-report` fetches `/config` (confirmed via a
  service test) and shows the filter prefilled from its `context`.
- No `/data` request fires until Submit.
- Submitting with a valid Claim Date range fetches and renders the
  real columns/rows from `/data`, matching the confirmed response
  shape.
- `warranty-cost.service.spec.ts` gains tests mirroring
  `dealer-ledger.service.spec.ts`'s request/response-mapping coverage,
  using the exact real payloads captured above as fixtures.
- `warranty-cost-column-definitions.spec.ts` gains a test mirroring
  `dealer-ledger-column-definitions.spec.ts` (hidden mapping, skip
  unrecognized keys).
- `warranty-cost-report-list.component.spec.ts`/
  `warranty-cost-report-filter.component.spec.ts` are updated: the
  "table not yet available" placeholder is removed, replaced with
  `hasSearched`-gated table assertions mirroring Dealer Ledger's own
  list-component tests.
- Reports Home no longer shows "Search parameters only" for Warranty
  Cost Report.

## Open decisions

- **`isVisible` vs. `isDefault` semantics** — both are `true` for
  every column in the one real response captured so far, so their
  difference is unconfirmed. Default assumption: `isVisible: false`
  means "never show this column at all, not even in the picker"
  (permanently excluded — e.g. a column reserved for a future
  permission tier), while `isDefault` continues to mean "checked/shown
  by default, but user-togglable" (existing Dealer Ledger semantics).
  `toWarrantyCostColumns()` should skip a column entirely when
  `isVisible === false`, and only then apply `hidden: !isDefault` for
  the remaining ones. **Needs confirmation against a real response
  where `isVisible: false` actually occurs** before implementation
  finalizes this — do not guess further than this default without
  testing it.
- **Company Code**: shown as an editable field (extending
  `WarrantyCostReportFilterComponent` to add it back, contradicting
  the screenshot) vs. silently defaulted from config and sent in every
  request with no UI (matching the screenshot) — default assumption:
  silently defaulted, not shown, since the user's own reference
  screenshot for this exact report has no visible Company Code field
  and the config supplies an unambiguous default (`"TVSL"`, currently
  the only option).
- **Claim Date validation** (`minDate: "2020-04-01"`,
  `maxDate: "$TODAY"`, `maxRangeDays: 366`,
  `requireBothBounds: true`): whether to enforce these client-side
  (disabling/validating the date inputs beyond the existing
  `isDateRangeInvalid()` "from after to" check) or leave enforcement
  to the backend (which will presumably reject an out-of-range
  request) — default assumption: enforce `minDate`/`maxDate` as
  `<input type="date" min/max>` attributes (cheap, native, no new
  logic) and leave `maxRangeDays`/`requireBothBounds` enforcement to
  the backend for now, revisiting if real usage shows this needs
  client-side validation too.
- **Mock fallback**: whether Warranty Cost Report gets a
  `WarrantyCostMockService` fallback like Dealer Ledger's, for local
  development without a running backend — default assumption: not
  needed yet, since Dealer Ledger's mock fallback exists for
  historical reasons (built before the real backend existed) and this
  report is being built directly against an already-confirmed-working
  real backend from day one.
- Whether `claimDate`'s `dd-MM-yyyy` format (per the config's own
  `format` field for the *display* of the column) also applies to how
  the backend *sends* the raw `claimDate` value in row data — needs
  verification against a response with actual rows (this test query
  returned zero rows) before assuming the same `DD-MM-YYYY`-to-ISO
  normalization Dealer Ledger needed
  (`doc-date-dd-mm-yyyy-format-17-09-2026-12_00_AM.md`) is required
  here too.
