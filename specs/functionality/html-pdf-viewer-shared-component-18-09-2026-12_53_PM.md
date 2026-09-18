# Shared Functionality — Spec: HTML "PDF Viewer" Component (Zoom/Rotate/Print/Download)

**Created:** 2026-09-18 12:53 IST

## Status

Implemented.

## Purpose

Warranty Cost Report's real UI is not a data table — it's a printed
statement/bill (per the attached SAP-generated reference PDF: "STATEMENT OF
WARRANTY COST REIMBURSEMENT DETAILS", a fixed-layout document with a
company letterhead, a line-item table, subtotal/total blocks, and a
signatory footer — no pagination, no sorting, no column picker). It should
render as an HTML reproduction of that document, displayed inside a
PDF-viewer-style chrome: zoom in/out, rotate, print, and "export/download as
PDF" — the same interaction model as a browser's native PDF viewer (per the
attached PDF-viewer screenshot), but built from scratch since the content
starts as HTML/data, not an actual PDF file.

This is the first report needing this treatment, but the viewer itself is
built as a **shared, reusable, domain-agnostic component** — the same
pattern as `shared/ui/data-table`: it knows nothing about Warranty Cost
Report specifically, and any future "bill/ledger/statement"-shaped report
can reuse it by projecting its own HTML content in.

## Reference designs

- The attached PDF (`adobe_form.pdf`) is the actual reproduced document
  layout: letterhead, "FOR THE PERIOD .../DATE/PAGE" line, a line-item
  table (SL NO/CN MEMO NO./DOC DATE/ORDER NUM/ORDER DATE/DLR REF NUM/REF
  DATE/PART NUMBER+DESCRIPTION/QUANTITY/NDP RATE/EXCISE/SALES TAX/LABOUR/
  OCTROI/SERVICE TAX/TOT COST), a highlighted dealer identity row, a
  totals row, a yellow-highlighted summary block (Parts/Freight/Demurrage/
  Total Value, then the same four "Dealer ..." figures), and a signatory
  footer.
- The attached PDF-viewer screenshot shows the *chrome* to build around
  that content: a dark toolbar with page indicator ("1/1"), zoom
  percentage + in/out, rotate, an annotate/pen icon (not required here),
  undo/redo (not required here), download, print, and an overflow menu —
  plus a thumbnail sidebar (not required, since this is always one page).

## API contract (confirmed live)

- `POST http://localhost:8080/warranty-cost/fetch-data-bricks-data` with
  JSON body `{"dealerCode":"10015","fromDate":"2026-08-01","toDate":"2026-08-31"}`
  (note: **unpadded** dealer code — confirmed via testing that
  `dealerCode` here is the plain code, e.g. `10015`; the previously-used
  `00000`-padding convention is Dealer Ledger/`kunnr`-specific, not
  universal across every Databricks endpoint — this endpoint's own
  `dealer` field in the response echoes back a zero-padded value
  (`"0000010015"`), but that's the *response* shape, not what the
  *request* body expects).
- Response: a flat JSON array, snake_case fields — confirmed real fields:
  `dealer`, `dealer_name`, `cn_memo_no`, `doc_date` (numeric `YYYYMMDD`
  string, e.g. `"20250121"` — not ISO, not `DD-MM-YYYY` like other
  reports' date fields), `order_num`, `order_date` (same `YYYYMMDD`
  shape), `dlr_ref_num`, `ref_date` (same shape), `item_no`,
  `part_number`, `description`, `quantity`, `plant`, `ndp_rate`,
  `excise`, `sales_tax`, `labour`, `octroi`, `service_tax`, `tot_cost`,
  `freight`, `demurrage`, `billing_doc`.
- `GET http://localhost:8080/warranty-cost/config` does **not** exist
  (confirmed `404`) — unlike every other report, there is no config
  endpoint for Warranty Cost Report. Dealer identity (code/name) is taken
  directly from the response rows themselves (`dealer`/`dealer_name`),
  not a separate config call.

## Scope

- New shared component, `shared/ui/html-pdf-viewer/`, providing the
  viewer chrome (zoom/rotate/print/download) around projected content.
- Warranty Cost Report's list page renders its statement content inside
  this shared viewer instead of `WarrantyCostTableComponent`/
  `DataTableComponent` — the table component, column definitions,
  pagination model, and effective-columns concept are all removed from
  this feature (no longer applicable).
- A new `WarrantyCostStatementComponent`, the Warranty Cost-specific piece
  that renders the actual bill/statement markup (letterhead, line-item
  table, totals, signatory) from the fetched rows — this is *not* shared;
  it's this report's own content, projected into the shared viewer.
- Out of scope: multi-page support (this report is always a single
  "page"), annotation/undo-redo (shown in the reference screenshot but not
  requested), and any other report adopting this viewer yet.

## Requirements

### Shared `HtmlPdfViewerComponent`

1. Inputs: none required beyond projected content (`<ng-content>`);
   optional `title` (shown in the toolbar) and `filename` (base name for
   downloads, mirroring `buildReportExportFilename`'s existing per-report
   filename convention).
2. Toolbar: zoom-out button, zoom percentage readout, zoom-in button
   (clamped to a sensible range, e.g. 50%–200%, default 100%); a rotate
   button (cycles 0°/90°/180°/270°); a Print button; a Download (as PDF)
   button.
3. Zoom is implemented via CSS `transform: scale(...)` on the projected
   content's wrapper; rotate via `transform: rotate(...)` composed with
   the same scale.
4. Print opens the browser's native print dialog scoped to just the
   projected content (a print-only stylesheet, or an isolated
   `window.print()` target) — not the whole app shell/toolbar.
5. Download renders the projected content to a PDF client-side (via
   `html2canvas` + the already-installed `jspdf`, the standard combo — a
   new `html2canvas` dependency is added) and triggers a file download
   named from `filename` (or a sensible default).
6. No pagination, sorting, or column-picker affordances anywhere in this
   component — it is a single, fixed "page" of arbitrary projected HTML.

### `WarrantyCostStatementComponent` (feature-specific)

7. Renders the statement layout from `WarrantyCostRow[]`: letterhead
   ("TVS MOTOR COMPANY LIMITED" / address), a "FOR THE PERIOD X TO Y" /
   "DATE" / "PAGE" line, one dealer-identity row per distinct
   `dealer`/`dealer_name` in the result set, that dealer's line items in
   the reference table's exact column order, a totals row per dealer
   (summed `ndp_rate`/`excise`/`sales_tax`/`labour`/`octroi`/
   `service_tax`/`tot_cost`), and the yellow summary block (Parts
   Value/Total Freight/Total Demurrage/Total Value, then the four
   "Dealer ..." equivalents) computed from the same rows.
8. `doc_date`/`order_date`/`ref_date`'s numeric `YYYYMMDD` strings are
   formatted to `DD.MM.YYYY` for display (a new date-formatting utility,
   since this shape is unique to this endpoint — distinct from every
   other report's `DD-MM-YYYY`/ISO date handling).

### Wiring

9. `WarrantyCostService.getEntries()` calls
   `POST /warranty-cost/fetch-data-bricks-data` directly via `HttpClient`
   (replacing the generic `ReportApiService` call), with body
   `{ dealerCode, fromDate, toDate }` (unpadded dealer code, per the API
   contract above).
10. `WarrantyCostService.getConfig()` is removed entirely — no config
    endpoint exists for this report; the list page no longer fetches or
    depends on one (dealer name comes from the response rows instead).
11. `WarrantyCostStore` drops pagination/effectiveColumns state (this
    report was never paginated server-side, but even the table's own
    client-side pagination goes away along with the table itself).
12. `WarrantyCostReportListComponent` renders
    `<app-html-pdf-viewer><app-warranty-cost-statement .../></app-html-pdf-viewer>`
    instead of `<app-warranty-cost-table>`, still gated on
    `store.hasSearched() && store.data().length > 0`
    (auto-dismiss-alert-and-hide-empty-table-across-all-reports-18-09-2026-12_23_PM.md's
    hide-when-empty convention still applies).

## Acceptance criteria

- Submitting the filter panel renders a statement that visually matches
  the reference PDF's structure (letterhead/period line/table/totals/
  summary/signatory), inside the shared viewer's toolbar chrome.
- Zoom in/out visibly scales the statement; rotate visibly rotates it;
  Print opens the browser print dialog with only the statement content;
  Download saves a PDF file.
- No pagination/column-picker/search-box controls appear anywhere on this
  page (those were `DataTableComponent`-only affordances, now removed for
  this report).
- `WarrantyCostService`/`WarrantyCostStore`/`WarrantyCostReportListComponent`
  specs are updated for the new API contract and rendering; a new spec
  covers `HtmlPdfViewerComponent` (zoom bounds, rotate cycling, download
  triggering `html2canvas`/`jspdf`) and `WarrantyCostStatementComponent`
  (correct totals/summary math, date formatting).
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

- Exact zoom range/step and rotate increment are not specified by the
  mockups beyond "zoom in/out, rotate" — default assumption: 50%–200% in
  10% steps, rotate in 90° increments, matching common PDF-viewer
  conventions.
- Whether "Download" should produce a single-page PDF sized to the
  statement's natural content height (this report's actual behavior,
  since it's never paginated) vs. a fixed A4/Letter page size with the
  content scaled to fit — default assumption: size the PDF page to the
  captured content's own dimensions (via `html2canvas`'s canvas size),
  since the reference document is inherently single-page/no fixed paper
  size is specified.
- The reference PDF viewer's annotate/undo/redo/overflow-menu icons are
  not implemented — flagged as explicitly out of scope, not an oversight.
- Multi-dealer handling: the response can (in principle) contain rows for
  more than one dealer in one date range; the statement groups by dealer
  with its own identity row/totals per the reference document's
  "DEALER: ..." row — but the summary block's "Total"/"Dealer Total"
  distinction (with no dealer grouping shown in the reference PDF, which
  only has one dealer) is assumed to mean: "Total ..." = grand total
  across all returned rows, "Dealer Total ..." = repeated per dealer
  (identical to "Total ..." when only one dealer is present, as in the
  reference document) — TBD if a multi-dealer result set ever occurs in
  practice.
