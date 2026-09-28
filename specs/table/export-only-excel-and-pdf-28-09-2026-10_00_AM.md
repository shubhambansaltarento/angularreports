# Shared Data Table — Spec: Export Restricted to Excel and PDF Only

**Created:** 28-09-2026 10:00 AM IST

## Status

Implemented.

## Purpose

Every report's table currently offers four export formats — CSV, Excel, Print, PDF — via the
shared `DataTableComponent`'s Export panel (`ALL_EXPORT_FORMATS` in
`data-table.component.ts`). The user asked for every report's table to offer only two: **Excel**
and **PDF** — CSV and Print removed.

## Current state

- `DataTableComponent`'s own default (`exportFormats()` input `null`) falls back to
  `ALL_EXPORT_FORMATS = ['csv', 'excel', 'print', 'pdf']` — this is what Goods Acknowledgement,
  Parts Packing List, and the shared `ReportSearchOnlyPageComponent`'s placeholder table
  currently show (the screenshot's Scope/Format panel), since none of them bind `[exportFormats]`
  explicitly.
- Dealer Ledger and Warranty Reconciliation *do* bind `[exportFormats]="exportFormats()"` — a
  computed value derived from their own config API response's `export.formats` (backend format
  names `CSV`/`XLSX`/`PRINT`/`PDF`, mapped via each page's own
  `EXPORT_FORMAT_BY_BACKEND_NAME` record onto `'csv'|'excel'|'print'|'pdf'`). Whatever the
  backend's config returns today may already include/exclude any of the four — this mapping,
  not the shared table's default, currently determines what those two reports show.
- Warranty Cost Report has no table (statement/PDF viewer only) — out of scope, no Export panel
  of this kind exists there.

## Requirement

1. `data-table.component.ts`'s `ALL_EXPORT_FORMATS` fallback changes from
   `['csv', 'excel', 'print', 'pdf']` to `['excel', 'pdf']` — this alone fixes Goods
   Acknowledgement, Parts Packing List, and the search-only placeholder table's Export panel to
   show only Excel/PDF, since they rely on this default.
2. Dealer Ledger's and Warranty Reconciliation's own `exportFormats` computed values are also
   constrained to Excel/PDF only, regardless of what their config API's `export.formats`
   returns — each page's `EXPORT_FORMAT_BY_BACKEND_NAME` record (now typed
   `Partial<Record<string, ExportFormat>>`) drops the `CSV`/`PRINT` entries entirely, so those
   backend format names simply don't map to anything and get filtered out by the existing
   `.filter((format): format is ExportFormat => Boolean(format))` step.
3. `ExportFormat`, `EXPORT_FORMAT_LABELS`, and `EXPORT_FORMAT_ICONS` (all still typed/keyed for
   all four formats) are **not** narrowed by this spec — CSV/Print's export logic
   (`ExportService.exportToCsv`/`print`) stays in the codebase; this is a UI-availability
   restriction (which formats the Export panel offers), not a removal of the underlying export
   capability, in case a future report/consumer still needs it.

## Out of scope

- No change to `ExportService`'s actual CSV/Print export implementations — only which formats
  the shared table's panel lets the user pick from.
- No change to Warranty Cost Report (no table/export panel to restrict).
- No change to Scope (All Filtered Rows / Current Page) options — only the Format list.

## Acceptance criteria

- Every report's table (Dealer Ledger, Goods Acknowledgement, Warranty Reconciliation, Parts
  Packing List, and the PQM/VOR Print/Warranty Labour Tax Invoice placeholder table) shows only
  **Excel** and **PDF** in its Export panel's Format list — no CSV, no Print radio option.
- Exporting via Excel or PDF still works exactly as before.
