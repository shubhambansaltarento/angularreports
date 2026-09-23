# Design — Spec: Report Header Bar Spans Full Page Width

**Created:** 23-09-2026 01:00 PM IST

## Status

Implemented.

## Purpose

Reference screenshot (Warranty Reconciliation) shows the blue `ReportHeaderBarComponent` bar
spanning edge-to-edge across the full page width, with the rest of the page's content (dealer
identity line, filters, buttons) indented beneath it. On Dealer Ledger, Parts Packing List, and
Warranty Cost Report, the header bar was instead inset by the page's own outer padding
(`padding: 1rem` / responsive `1.5rem` on `.dealer-ledger-list` /
`.parts-packing-list-list` / `.warranty-cost-report-list`), since those pages wrapped
`<app-report-header-bar>` inside the same padded flex container as their filters/table —
leaving a visible margin on the header bar's left/right edges instead of it touching the page
edges.

Warranty Reconciliation, Goods Acknowledgement, and the shared `ReportSearchOnlyPageComponent`
(PQM/VOR Print/Warranty Labour Tax Invoice) already had no such outer padding, so their header
bars were already full-width — this spec brings the other three reports in line with them.

## Requirement

For `dealer-ledger-list`, `parts-packing-list-list`, and `warranty-cost-report-list`:

1. Move the page's own padding off the outer wrapper element (`.dealer-ledger-list`,
   `.parts-packing-list-list`, `.warranty-cost-report-list`) onto a new inner
   `.<page>__content` wrapper, which now contains everything except the header bar (and, where
   present, the dealer identity line) — filters, action buttons, error banner, loading
   indicator, and the table/statement viewer.
2. The outer wrapper keeps `display: flex; flex-direction: column` (no padding, no gap of its
   own) so `<app-report-header-bar>`/`<app-report-dealer-identity>`/
   `<app-dealer-ledger-toolbar>` render as direct, unpadded children and their blue background
   spans the full width of the page.
3. `<app-report-dealer-identity>`'s own internal padding (`0.375rem 1rem 0`) is unchanged —
   its small left inset now visually lines up with the content wrapper's own `1rem` padding
   below it, matching the reference screenshot's layout.

## Out of scope

- Warranty Reconciliation, Goods Acknowledgement, and `ReportSearchOnlyPageComponent` are
  unchanged — their header bars were already full-width.
- No change to the header bar's own component/styles, or to any table/filter styling beyond
  where each page's content now sits.

## Acceptance criteria

- Every report page's blue header bar touches both the left and right edges of the viewport,
  with no visible margin/padding around it.
- The rest of each page's content (filters, buttons, dealer identity line's own small inset,
  table) retains its previous spacing/padding relative to the page edges — only the header
  bar's own inset was removed.
