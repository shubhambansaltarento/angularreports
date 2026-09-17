# Dealer Ledger — Table: Filter Export Integration (PDF/XLS)

## Status

Accepted. Companion to `specs/reports/dealer-ledger/top-to-bottom-layout-16-09-2026-01_43_PM.md`.

## Purpose

Spec 2 for the Dealer Ledger filter panel puts Search, Reset, and Export on
one action line, with Export offering PDF and XLS as output formats. This
document specifies how that filter-level Export action drives the existing
table export capability already implemented in the shared
`DataTableComponent` (`src/app/shared/ui/data-table/data-table.component.ts`),
rather than introducing a second, duplicate export mechanism.

## Scope

- How the filter panel's Export (PDF/XLS) choice reaches the Dealer Ledger
  table.
- Reuse of the existing `ExportService` /
  `ExportFormat` (`src/app/shared/services/export`) already wired into
  `DataTableComponent.onExport()`.
- What is out of scope: changes to `ExportService` itself, CSV/print export
  (already supported but not requested by the filter panel), or table column
  configuration.

## Current implementation observations

- `DataTableComponent` already supports `csv`, `excel`, `pdf`, and `print`
  export via `onExport(format: ExportFormat)`, using `ExportColumn`s derived
  from `visibleColumns()` and rows from `pagedData()`/`sortedData()`
  (`exportScope()`).
- `DataTableComponent`'s own export menu (`isExportMenuOpen`,
  `toggleExportMenu()`) is a self-contained UI/action independent of any
  filter panel.
- `DealerLedgerFilterComponent.onExport()` currently emits a single
  `exported` output event with the current filter value and no format
  information (`dealer-ledger-filter.component.ts`).
- The Dealer Ledger list page composes both the filter panel and the table
  (`dealer-ledger-table.component.ts`), so it is positioned to bridge the two.

## Requirements

1. `DealerLedgerFilterComponent`'s Export action must communicate which
   format was chosen (PDF or XLS) as part of its emitted event, rather than a
   bare "exported" signal with no format.
2. The consuming Dealer Ledger list page, on receiving this event, must
   trigger the table's existing export capability
   (`DataTableComponent.onExport('pdf' | 'excel')`) using the currently
   loaded/filtered table rows — no new export/rendering logic is implemented
   outside of `ExportService`.
3. The filter panel does not gain its own PDF/XLS generation logic; it only
   signals intent (format + current filter criteria).
4. Export scope (current page vs. all filtered rows) follows
   `DataTableComponent`'s existing `exportScope` behavior; this spec does not
   change that behavior.

## Acceptance criteria

- Choosing "Export as PDF" or "Export as XLS" from the filter panel produces
  the same file output as manually using the table's own export menu with
  that format, for the same data.
- No duplicate export implementation (PDF/XLS generation) is added outside
  `ExportService`.
- Existing table-level export menu continues to work independently, for
  users who prefer to export from the table directly.

## Decisions

- **Event contract:** `DealerLedgerFilterComponent`'s existing single
  `exported` output is kept, but its payload gains a `format: 'pdf' | 'xls'`
  field alongside the current filter value
  (`DealerLedgerFilterValue & { format: ExportFormat }`). One output is used
  rather than two (`exportedPdf`/`exportedXls`), since the list page's
  handling is identical apart from the format passed to
  `DataTableComponent.onExport()`.
- **Export scope:** the filter-triggered export always exports all rows
  matching the current filter criteria, not just the table's current page —
  regardless of the table's own `exportScope` toggle. The user is exporting
  "the report I just searched for," not "the page I'm currently looking at."
  The table's own export menu (with its `currentPage`/`all` choice) is
  unaffected and continues to respect whatever scope is selected there.
