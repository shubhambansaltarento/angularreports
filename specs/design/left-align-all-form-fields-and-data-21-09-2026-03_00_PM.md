# Left-Align All Form Fields and Data

## Context

Reports should present a consistent, left-aligned reading order for every filter form field
(label + input) and every rendered data value (table cells), matching standard business-report
conventions and the legacy SAP-BO-style layouts already targeted by
`legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md`.

A survey of the current filter forms and shared table found almost everything already
left-aligned by default — Bootstrap/flex layouts with no explicit centering on labels, inputs,
or standard data cells. Two concrete deviations exist:

1. `src/app/shared/ui/data-table/data-table.component.scss` — `.data-table__select-cell {
   text-align: center }` centers the checkbox/select column (header and body).
2. `src/app/features/parts-packing-list/pages/parts-packing-list-list/parts-packing-list-list.component.scss`
   — `.parts-packing-list-list__card { margin: 0 auto; max-width: 620px }` horizontally centers
   the entire filter card panel on the page (not its field contents).

Additionally, `TableColumn.align` (`src/app/shared/ui/data-table/models/table-column.model.ts`)
lets any report opt a column into `center`/`end` alignment — several reports already set
`align: 'end'` on numeric columns intentionally (per the earlier redesign spec, for
counts/amounts). This spec does not touch that per-column override mechanism.

## Requirement

1. **Filter form fields**: every label and input across all filter form components (Dealer
   Ledger, Warranty Cost Report, Warranty Reconciliation, Parts Packing List, Goods
   Acknowledgement's `ReportSearchBarComponent`, `TypeaheadInputComponent`) render left-aligned.
   No new work needed here except a regression check — none currently center field text.
2. **Table data values**: the shared `DataTableComponent`'s default cell alignment stays
   `text-align: left` for all data columns (already the case) with one exception below.
3. **Select/checkbox column**: remove `.data-table__select-cell { text-align: center }` — the
   selection checkbox column's header and body cells become left-aligned like every other
   column, for reports using `selectionMode`.
4. **Whole-panel centering**: remove `margin: 0 auto` (and the accompanying `max-width: 620px`
   centering) from `.parts-packing-list-list__card` — the filter card should sit flush left
   under the header bar like every other report's filter panel, not centered on the page.
5. **Per-column `align` overrides stay intact**: numeric/count columns that a report
   deliberately right-aligns via `TableColumn.align: 'end'` are unaffected — this spec only
   changes the *defaults*, not explicit per-column opt-ins.

## Out of scope

- The blue `ReportHeaderBarComponent`'s internal `justify-content: space-between` layout (title
  left, actions right) — that's a title bar, not a form, and stays as-is.
- Any report's own explicit `align: 'center'`/`align: 'end'` column choices.
- No change to `ReportSearchOnlyPageComponent`'s Search/Reset button row
  (`.report-search-only-page__actions { display: flex; gap: 0.5rem }`) — buttons are actions,
  not form fields/data, and already render left-aligned (default flex start) regardless.

## Acceptance criteria

- No filter form, `TypeaheadInputComponent`, or `ReportSearchBarComponent` centers any label,
  input, or value.
- The shared data table's select/checkbox column is left-aligned, matching every other column.
- Parts Packing List's filter card is no longer horizontally centered on the page.
- Reports that intentionally right-align numeric columns (via `TableColumn.align: 'end'`) are
  unaffected.
