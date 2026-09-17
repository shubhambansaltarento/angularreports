# Dealer Ledger — Spec 18: Map Config API Response onto the UI

**Created:** 2026-09-16 14:41 IST

## Status

Accepted (implemented in the same change as this spec).

## Purpose

The real config endpoint (`GET {baseUrl}reports/DEALER_LEDGER/config`, per
`api-integration-16-09-2026-02_28_PM.md`/`config-call-on-entry-16-09-2026-02_32_PM.md`) is live and
returns real values — a `context` (dealer identity), `parameters`
(Company Code, Date Range, checkboxes), and `export.formats`. Today that
response is only fetched and logged; it does not drive anything on screen.
This spec wires three specific pieces of UI to that response:

1. Dealer Code and Dealer Description (currently sourced from
   `DealerContextService`, a mocked-auth stand-in).
2. Company Code (currently also sourced from `DealerContextService`).
3. The table's Export menu's available formats (currently a fixed,
   hardcoded set of four: CSV/Excel/Print/PDF).

## Scope

- A typed `DealerLedgerConfig` model covering the fields this spec actually
  uses (`context.dealerCode`, `context.dealerDescription`, `parameters`
  array with a `companyCode` entry's `defaultValue`, `export.formats`) —
  not the full response shape (columns/column groups/checkboxes are out of
  scope for this spec).
- `DealerLedgerService.getConfig()` returns this typed shape (or `null` on
  failure, per Spec 17).
- `DealerLedgerListComponent` holds the fetched config in a signal and
  passes the relevant pieces down to `DealerLedgerFilterComponent` and
  `DealerLedgerTableComponent`.
- `DealerLedgerFilterComponent` prefers the config's `context`/Company Code
  values over `DealerContextService` once loaded, falling back to
  `DealerContextService` before the config arrives (or if it fails).
- `DataTableComponent` gains an optional way to restrict its Export menu to
  a specific set of formats; `DealerLedgerTableComponent` passes the
  config's `export.formats` through.
- Out of scope: turning Company Code into an editable `SELECT` control (the
  config marks it as a `SELECT` parameter with options, but per
  `dealer-fields-as-text-16-09-2026-01_40_PM.md`/`identity-fields-as-cards-16-09-2026-02_14_PM.md`,
  Company Code stays read-only text/card — only its *value* now comes from
  config); consuming `columnGroups`/checkbox `parameters` dynamically
  (tracked as a future spec); Date Range validation constraints from config
  (`minDate`/`maxDate`/`maxRangeDays`).

## Current implementation observations

- `DealerLedgerFilterComponent.initialValue` currently reads only
  `DealerContextService.dealerContext()` for `dealerCode`/
  `dealerDescription`/`companyCode`.
- `DataTableComponent`'s export menu (`data-table.component.html`) always
  renders all four format buttons (CSV, Excel, Print, PDF) — no input
  controls which are shown.
- The config response's `export.formats` is `["XLSX", "PDF"]` — CSV and
  Print are not offered for this report per the backend's own config.
- The config response's `parameters` array has an entry
  `{ name: 'companyCode', defaultValue: 'TVSL', options: [{ value: 'TVSL', label: 'TVS Lucas' }] }`.

## Requirements

1. A `DealerLedgerConfig` model is defined (in `models/`) covering
   `context.dealerCode`, `context.dealerDescription`, `parameters[].name`/
   `defaultValue`, and `export.formats`.
2. `DealerLedgerService.getConfig()` is typed to return
   `Observable<DealerLedgerConfig | null>`.
3. `DealerLedgerListComponent` stores the fetched config in a signal and
   passes:
   - `context` (or the whole config) to `DealerLedgerFilterComponent`.
   - The mapped `export.formats` to `DealerLedgerTableComponent`.
4. `DealerLedgerFilterComponent`'s prefill (`initialValue`) uses, in order
   of preference: the config's `context.dealerCode`/`dealerDescription` and
   the `companyCode` parameter's `defaultValue`, falling back to
   `DealerContextService` when the config is not yet loaded/failed.
5. `DataTableComponent` accepts an optional `exportFormats` input
   (`ExportFormat[] | null`, default `null` = show all formats, unaffected
   for every other report). When provided, only buttons for those formats
   render in the Export menu.
6. `DealerLedgerTableComponent` maps the config's `export.formats` (backend
   strings `"XLSX"`/`"PDF"`/`"CSV"`) onto the app's own `ExportFormat` values
   (`'excel'`/`'pdf'`/`'csv'`/`'print'`) and passes them to
   `DataTableComponent`.

## Acceptance criteria

- Once the config call succeeds, Dealer Code/Dealer Description/Company
  Code in the filter panel show the config response's values (e.g.
  `1130` / `PAWAN SARKAR AUTOMOBILES` / `TVSL`), not the mock
  `DealerContextService` values.
- Before the config call resolves (or if it fails), the filter panel still
  shows the `DealerContextService` fallback values — no blank/broken state.
- The table's Export menu shows only the formats present in
  `config.export.formats` (e.g. only XLSX and PDF, no CSV/Print) once
  config loads; before it loads, all formats show (default `null` behavior).
- Other reports using `DataTableComponent` are unaffected (the new input
  defaults to showing every format, as today).

## Open decisions

- None — this spec was implemented directly given the real API response
  observed during development.
