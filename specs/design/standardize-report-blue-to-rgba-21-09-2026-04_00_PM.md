# Standardize the Report Blue Token to `rgba(47, 92, 138, 0.7411764706)`

## Context

The shared report blue — used by the blue `ReportHeaderBarComponent` bar and the shared
`DataTableComponent`'s header row (`$report-header-blue` in
`src/app/shared/styles/_tokens.scss`, introduced by
`legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md`) — was defined as hex `#2f5c8abd`.
Separately, `HtmlPdfViewerComponent`'s toolbar (the black bar behind `.html-pdf-viewer__title`,
shown around Warranty Cost Report's printed statement) used its own unrelated dark literal,
`#212529`.

`#2f5c8abd`'s alpha channel (`0xbd` = 189/255 ≈ 0.7412) is numerically the same color as
`rgba(47, 92, 138, 0.7411764706)`.

## Requirement

1. `.html-pdf-viewer__toolbar`'s background (`src/app/shared/ui/html-pdf-viewer/html-pdf-viewer.component.scss`)
   changes from `#212529` to `rgba(47, 92, 138, 0.7411764706)`, so the PDF viewer's toolbar
   matches the same report blue used everywhere else, instead of its own separate dark color.
2. `$report-header-blue` (`src/app/shared/styles/_tokens.scss`) is re-expressed as
   `rgba(47, 92, 138, 0.7411764706)` instead of hex `#2f5c8abd` — same color, written in the
   `rgba()` form going forward, since that is the form used to introduce it.
3. Dealer Ledger's table header (via the shared `DataTableComponent`, which already consumes
   `$report-header-blue`) needed no separate change — it already matched by construction, since
   Dealer Ledger has no table styling of its own (`dealer-ledger-table.component.scss` only sets
   `display: block`; all header/row styling comes from the shared table).

## Out of scope

- No other component's colors change — this only touches the PDF viewer's toolbar and the
  single shared token.
- The earlier, reverted attempt to recolor Warranty Cost Report's statement table
  (`warranty-cost-statement.component.scss`'s `#000` borders/text) is explicitly NOT part of
  this spec — that change was requested, then undone ("stop"/"revert") in the same session, and
  stays reverted.

## Acceptance criteria

- `.html-pdf-viewer__toolbar` and every consumer of `$report-header-blue` (report header bar,
  shared data table header row) render the identical color.
- `warranty-cost-statement.component.scss` is unchanged from its pre-existing `#000`
  borders/text.
