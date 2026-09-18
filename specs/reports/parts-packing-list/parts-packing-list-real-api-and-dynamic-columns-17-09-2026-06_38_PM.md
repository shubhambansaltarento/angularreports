# Parts Packing List — Spec: Real API Integration + Dynamic Columns

**Created:** 2026-09-17 18:38 IST

## Status

Proposed.

## Purpose

Implement the Parts Packing List report end-to-end: a filter panel matching
the provided SAP-reference UI (Invoice Number / Delivery Number input
parameters, plus a Filter Menu with Date Range / Case / Material range
fields), wired to the real config and data APIs, with the table's columns
derived dynamically from the first row of the response rather than a
hardcoded column definition (unlike Dealer Ledger/Warranty Cost/Warranty
Reconciliation, which all use fixed `*-column-definitions.ts` files).

Currently `parts-packing-list.config.ts` marks this report as
`hasTable: false, apiIntegrated: false` and it renders only via the generic
`ReportSearchOnlyPageComponent` (`app.routes.ts`'s `SEARCH_ONLY_REPORT_CONFIGS`)
— no dedicated feature module exists yet.

## Reference UI

Per the provided screenshot (SAP "Parts Packing List" transaction):

- **Input Parameters**: Invoice Number, Delivery Number — free-typed lookup
  fields (rendered with a lookup/dropdown icon in SAP; here, implemented as
  typeahead inputs per Requirements below).
- **Filter Menu**: Date Range (From/To), Case (From/To), Material (From/To)
  — each a range pair.
- A single **Process** button — this app's equivalent of the existing
  "Show Report" action used by Dealer Ledger/Warranty reports
  (single-show-report-button-replaces-embedded-submit-17-09-2026-04_31_PM.md).

This report's own filter panel is a new shape (Invoice/Delivery Number
+ three range pairs), not the shared common Dealer Code/Description/Company
Code/Date Range bar (`ReportSearchBarComponent`) used by Dealer Ledger/
Warranty reports — it does not reuse that component.

## API contract

- Config: `GET http://localhost:8080/parts-packing-list/config` — returns
  `{ reportCode, title, parameters: [{ name, label, dataType, required }] }`
  for `dealerCode` (STRING), `fromDate` (DATE), `toDate` (DATE). Fetched but
  **not used to render dealer code/name in the UI** — Parts Packing List's
  own UI never shows Dealer Code/Name (unlike Dealer Ledger/Warranty
  reports). The config call still happens (for parity/future use and
  console-logging, per api-integration-16-09-2026-02_28_PM.md's pattern) but its
  response drives nothing visible.
- Data: `POST http://localhost:8080/parts-packing-list/fetchDatabricksdata`
  with JSON body `{ dealerCode, fromDate, toDate }` (all required, per
  config) — e.g.:
  ```
  curl -X POST "http://localhost:8080/parts-packing-list/fetchDatabricksdata" \
    -H "Content-Type: application/json" \
    -d '{"dealerCode": "0000010015", "fromDate": "2026-08-01", "toDate": "2026-09-01"}'
  ```
  Response: a flat JSON array of rows, snake_case fields — confirmed shape:
  `dealer_code`, `dealer_name`, `dealer_city`, `invoice_number`,
  `delivery_number`, `case_number`, `carton_box`, `part_number`,
  `part_description`, `quantity`. No pagination/summary wrapper (same shape
  family as Dealer Ledger's `fetchDatabricksdata`).
- Note: the config's declared parameters (`dealerCode`/`fromDate`/`toDate`)
  don't include Invoice Number/Delivery Number/Case/Material from the
  reference UI — those screenshot fields are not yet reflected in the
  data API's request body. Open decision below.

## Requirements

1. New feature module `src/app/features/parts-packing-list/` following the
   existing Warranty Reconciliation/Warranty Cost Report structure:
   `models/`, `services/`, `store/`, `pages/parts-packing-list-list/`,
   `components/parts-packing-list-table/`, `filters/parts-packing-list-filter/`,
   `parts-packing-list.routes.ts`.
2. `PartsPackingListService`:
   - `getConfig()`: `GET /parts-packing-list/config`, logged, cached — same
     shape/pattern as `DealerLedgerService.getConfig()` — but its response is
     not bound to any visible field (no dealer code/name shown).
   - `getEntries(request)`: `POST /parts-packing-list/fetchDatabricksdata`
     with `{ dealerCode, fromDate, toDate }`, mapping the flat snake_case
     row array onto internal row objects preserving every field from the
     first row (see Requirement 3).
3. **Dynamic columns**: the table's column set is derived from
   `Object.keys()` of the **first row** of a given response (not a
   hardcoded `*-column-definitions.ts` file, unlike every other report
   table so far). Column labels are derived from each key
   (snake_case → Title Case, e.g. `part_description` → "Part Description").
   If the response is empty, the table shows its existing empty state (no
   columns to derive).
4. **Filter panel** (`PartsPackingListFilterComponent`) — new shape, not the
   shared `ReportSearchBarComponent`:
   - Invoice Number, Delivery Number — typeahead inputs (Requirement 6).
   - Date Range (From/To), Case (From/To), Material (From/To) — three range
     pairs, matching the screenshot's Filter Menu section.
   - A single Process/"Show Report" button, consistent with
     single-show-report-button-replaces-embedded-submit-17-09-2026-04_31_PM.md
     (page-level button, `btn btn-sm btn-secondary`, calls the filter
     panel's public `submit()`).
5. **No table until submit**: matching Dealer Ledger's
   hide-table-until-submit-17-09-2026-12_01_AM.md — the table is hidden
   until the user clicks Process/"Show Report" at least once.
6. **Typeahead ("typed dropdown") fields**: every input field (Invoice
   Number, Delivery Number, Case From/To, Material From/To) lets the user
   either type a free value or pick from a suggestion list — implemented as
   a small reusable typeahead component (new shared UI component, since
   none exists yet) backed by a static/mock suggestion source for now (no
   lookup API is specified here — see Open decisions).
7. Same visual theme as the rest of the app (Bootstrap, existing
   `ReportSearchOnlyPageComponent`/Dealer Ledger page conventions,
   breadcrumbs via `BreadcrumbComponent`, monochrome table styling per
   monochrome-redesign-and-column-picker-text-fix-17-09-2026-05_56_AM.md).
8. Update `parts-packing-list.config.ts` to `hasTable: true,
   apiIntegrated: true` and wire a real route in `app.routes.ts` (dedicated
   `loadChildren`, replacing its current `SEARCH_ONLY_REPORT_CONFIGS`
   membership), matching how Warranty Cost/Warranty Reconciliation are
   wired (single-show-report-button-... / app.routes.ts pattern).

## Acceptance criteria

- Navigating to Parts Packing List shows Input Parameters (Invoice/Delivery
  Number) and Filter Menu (Date Range/Case/Material) fields, each a typeahead
  input, and no table.
- Clicking Process/"Show Report" issues the real `POST
  /parts-packing-list/fetchDatabricksdata` call and renders a table whose
  columns exactly match the first response row's keys (Title Cased), with
  no dealer code/name shown anywhere in this report's own UI chrome (beyond
  whatever is inside the dynamically-rendered columns themselves, since
  `dealer_code`/`dealer_name` are literal fields in the row data).
- The config call (`GET /parts-packing-list/config`) fires on page entry and
  is logged, but nothing in the rendered UI is sourced from its response.
- Unit tests cover: dynamic column derivation from the first row,
  hide-until-submit behavior, the service's request/response mapping, and
  the filter panel's typeahead fields.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

- The reference screenshot's Invoice Number/Delivery Number/Case/Material
  fields aren't present in the confirmed data API's request body (only
  `dealerCode`/`fromDate`/`toDate` are) — TBD whether these fields are
  client-side filters applied after fetch, sent as additional (undocumented)
  request fields, or purely presentational until the backend contract is
  extended. Default assumption: implement the UI fields as specified, but
  only send `dealerCode`/`fromDate`/`toDate` in the actual request until the
  backend confirms the others.
- Where `dealerCode` comes from for this report, given its own UI never
  shows/collects a Dealer Code field — TBD; default assumption is the same
  `DealerContextService`/config-context fallback used by other reports
  (invisible to the user, same as Warranty Cost/Reconciliation's dealer
  scoping).
- Typeahead suggestion source (static list vs. a real lookup endpoint) is
  unspecified — default assumption is a small static/mock list per field
  until a lookup API is confirmed.
- Whether the shared, generic `ReportSearchBarComponent` should be extended
  to support this report's different field set, or a fully separate filter
  component is cleaner — default assumption is a separate component, since
  the field set (Invoice/Delivery/Case/Material) doesn't overlap with the
  common Dealer Code/Description/Company Code/Date Range bar.
