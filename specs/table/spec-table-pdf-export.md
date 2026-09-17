# Table — Implement PDF Export

**Created:** 2026-09-16 15:14 IST

## Status

Proposed.

## Purpose

The shared `ExportService.exportToPdf()` (`shared/services/export/export.service.ts`)
is currently a placeholder that throws `'PDF export is not yet implemented.'`
— CSV, Excel, and Print already work, but clicking PDF in any table's Export
menu (including Dealer Ledger's, whose real config API reports `PDF` as an
available format per `map-config-response-to-ui-16-09-2026-02_41_PM.md`) fails with a
visible export error. This spec implements real PDF generation at the
shared table level, so every report gets working PDF export automatically
(no report-specific PDF logic).

## Scope

- Real PDF generation inside `ExportService.exportToPdf()` — the same
  domain-agnostic `{ rows, columns, filename }` signature already used by
  `exportToCsv`/`exportToExcel`/`print`, so no caller
  (`DataTableComponent.onExport('pdf')`) needs to change.
- A tabular PDF layout: one page (paginating onto additional pages as
  needed), a header row, and the same columns/rows already passed in today
  (whatever `DataTableComponent` currently resolves as "visible columns" +
  "current page or all filtered rows", per `exportScope()` — unchanged).
- Out of scope: custom PDF branding/letterhead, per-report PDF templates,
  page orientation/size configuration (a sensible default is chosen and
  documented below), and any change to which rows/columns are exported
  (that logic already exists in `DataTableComponent` and is not touched).

## Current implementation observations

- `ExportService.exportToPdf<T>(_rows, _columns, _filename)` — parameters
  are intentionally unused (prefixed `_`), body is `throw new Error(...)`.
- `DataTableComponent.onExport('pdf')` calls this method inside a
  `try/catch` that sets `exportError` on failure
  (`data-table.component.ts`) — so today's PDF click always surfaces
  "PDF export is not yet implemented." as a visible error banner.
- `exportToCsv`/`exportToExcel`/`print` are all synchronous, browser-only
  (`isBrowser` guard), and reuse two private helpers (`toCsv`, `toHtmlTable`)
  — no external dependency is used for any current format.
- No PDF-capable library (`jspdf`, `pdfmake`, etc.) is currently a
  dependency of this project (`package.json`).

## Requirements

1. Add a PDF-generation library as a dependency —
   `jspdf` plus `jspdf-autotable` (a `jspdf` plugin for rendering tabular
   data with automatic pagination/column sizing), per Open decisions'
   default choice.
2. `ExportService.exportToPdf<T>(rows, columns, filename)`:
   - Builds a PDF document with the given columns as a header row and the
     given rows as body rows (values passed through the same
     `formatValue()` string coercion already used by CSV/Excel, for
     consistency).
   - Paginates automatically across multiple PDF pages when content exceeds
     one page (handled by `jspdf-autotable`'s built-in behavior).
   - Saves/downloads the file as `${filename}.pdf` (parity with
     `exportToCsv`'s `${filename}.csv` / `exportToExcel`'s `${filename}.xls`
     naming).
   - Is guarded by the existing `isBrowser` check (SSR-safe, consistent with
     every other export method).
3. On generation failure (e.g. a runtime error inside the PDF library), the
   error propagates the same way it does today for other formats — caught
   by `DataTableComponent.onExport()`'s existing `try/catch`, setting
   `exportError` — no new error-handling path is introduced.
4. No changes to `DataTableComponent`, `ExportColumn`, or `ExportFormat` —
   this is entirely inside `ExportService`.

## Acceptance criteria

- Clicking "PDF" in any table's Export menu (Dealer Ledger's or any other
  report using `DataTableComponent`) downloads a `.pdf` file containing a
  table of the exported columns/rows, instead of showing an error.
- A dataset large enough to exceed one page's height renders correctly
  across multiple PDF pages.
- CSV/Excel/Print export behavior is unchanged.
- `export.service.spec.ts` gains coverage asserting `exportToPdf()` no
  longer throws and triggers a download (mocking the browser download path
  the same way existing CSV/Excel tests already do, if applicable).

## Open decisions

- Library choice: `jspdf` + `jspdf-autotable` (widely used, MIT-licensed,
  no server-side/build-step requirement, works entirely client-side like
  the existing export methods) vs. `pdfmake` (heavier, declarative
  document-definition API) — default assumption is `jspdf` +
  `jspdf-autotable` for the smaller footprint and closer fit to the
  existing simple tabular use case.
- Page orientation/size: default assumption is `landscape` (Dealer
  Ledger's table has many columns — `dealer-ledger-table.component.ts`
  lists 16 — which a `portrait` page would truncate/wrap awkwardly) on
  standard `a4` paper, with `jspdf-autotable`'s automatic column-width
  fitting; TBD if a specific report needs a different orientation later.
- Whether a title/header (report name, generated-at timestamp) should
  appear at the top of the PDF, similar to `print()`'s `<h1>${title}</h1>` —
  `exportToPdf()`'s current signature has no `title` parameter (only
  `print()` does); TBD whether to add one for parity, default assumption is
  to add an optional `title` parameter mirroring `print()`'s, defaulting to
  the filename if omitted, so a consuming table can optionally label the
  PDF the same way it already labels a print view.
