# Shared Data Table — Spec: Centered Themed Pagination, No Heading/Count, Confirmed Row Striping

**Created:** 23-09-2026 12:00 PM IST

## Status

Implemented.

## Purpose

Three changes to the shared `DataTableComponent` (`src/app/shared/ui/data-table/`), used by
every report with a table (Dealer Ledger, Goods Acknowledgement, Warranty Reconciliation, Parts
Packing List):

1. Pagination currently sits right-aligned (`.data-table__footer { justify-content: flex-end }`)
   with a dark grey active-page button (`#212529`) — unrelated to the report blue used
   elsewhere (`ReportHeaderBarComponent`, the table's own header row).
2. The toolbar currently shows an optional title (`<h2 class="data-table__title">`) and always
   shows a record count (`<span class="data-table__count">{{ resolvedTotalCount() }}
   records</span>`) — both should be removed from the table itself (report titles already live
   in the blue header bar above the table, per
   `legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md`).
3. Row striping — confirming the existing behavior stays as-is: `nth-child(even)` rows (2nd,
   4th, 6th, 8th … in 1-based display order — i.e. index 1, 3, 5, 7 in 0-based JS terms) render
   grey (`#e9ecef`, per `alternate-row-colors-distinct-contrast-21-09-2026-07_30_PM.md`), and
   `nth-child(odd)` rows (1st, 3rd, 5th, 7th … 1-based; index 0, 2, 4, 6 0-based) render white.
   This already matches the requirement exactly — no change needed, called out here only so
   this spec is a complete, self-contained description of the table's current + target look.
   Adds Bootstrap's `table-striped` class
   (https://getbootstrap.com/docs/4.0/content/tables/#striped-rows) to the `<table>` element
   itself, alongside the existing `table`/`table-hover` classes — kept as a bare
   `:nth-child(even)` selector for the actual coloring, rather than Bootstrap's own
   `tbody tr:nth-of-type()`, since this app's CDK table markup doesn't reliably wrap rows in a
   `<tbody>` for that selector to match against.
4. The table itself should carry no background color of its own — no grey toolbar background,
   no tint from Bootstrap's own `.table-striped` accent variable layered underneath our custom
   striping. Only the deliberate colors already specced elsewhere apply: the header row's blue,
   the even-row grey stripe, and the hover tint — everything else (the toolbar strip above the
   table, and odd/unstruck body rows) stays transparent/white.

## Requirement

1. `.data-table__footer`: change `justify-content: flex-end` to `justify-content: center`, so
   the `<nav class="data-table__pagination">` sits centered under the table.
2. `.data-table__page-number--active`: change its background/border from `#212529` to the
   report blue (`rgb(47, 92, 138)`, the same opaque color used for the table's own header row
   and `ReportHeaderBarComponent` — `opaque-table-header-blue-21-09-2026-04_30_PM.md`), text
   stays white.
3. `data-table.component.html`: remove the entire `.data-table__toolbar-info` block — no
   `<h2>` title, no `{{ resolvedTotalCount() }} records` count — from every report's table.
   The `title()` input itself can stay on the component (harmless if unused, or removed
   outright as a follow-up cleanup) — this spec only removes its rendering, per the request.
4. Row striping keeps `.data-table__table tr[cdk-row]:nth-child(even)`; the `<table>` gains
   Bootstrap's `table-striped` class alongside it.
5. `.data-table__table` sets `--bs-table-accent-bg: transparent` to neutralize Bootstrap's own
   `.table-striped` accent (which would otherwise tint odd rows' cells), so only our explicit
   even-row grey applies.
6. `.data-table__toolbar` drops its `background: #fafafa` — the toolbar strip above the table is
   transparent, matching the "table should not have any bg color" requirement.

## Out of scope

- No change to the "Show N entries" selector, Search box, Columns menu, Export menu, or Reset
  button — only the title/count block and pagination styling change.
- No change to non-active pagination buttons' colors (Prev/Next/inactive page numbers stay as
  today — white background, grey border/hover).

## Acceptance criteria

- Every report's table shows its pagination row centered horizontally beneath the table.
- The active page number renders in the report blue (`rgb(47, 92, 138)`), not dark grey.
- No report's table shows a title or a "N records" count above the table — that information
  lives only in the blue header bar/dealer identity line above it now.
- Row striping is unchanged in effect: odd display-position rows (1st, 3rd, 5th, 7th) white,
  even display-position rows (2nd, 4th, 6th, 8th) grey. The `<table>` carries Bootstrap's
  `table-striped` class, with its own accent neutralized so it doesn't double up with our
  existing `:nth-child(even)` coloring.
- Neither the toolbar strip above the table nor the table element itself carries any
  background color of its own — the only colors present are the header row's blue, the
  even-row stripe, and the hover tint.
