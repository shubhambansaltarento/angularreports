# Shared Data Table — Spec: Opaque Table Header Background

**Created:** 21-09-2026 04:30 PM IST

## Status

Implemented.

## Purpose

`.data-table__table th` and `.data-table__table th.cdk-table-sticky`
(`src/app/shared/ui/data-table/data-table.component.scss`) used
`background: tokens.$report-header-blue` directly — `rgba(47, 92, 138, 0.7411764706)`. Because
that token is translucent (alpha ≈ 0.74), the rendered header color blends with whatever sits
beneath a `th` (the table's own background, the page background behind a scrolled/sticky
column), so it visibly washes out lighter than the intended navy across every report using the
shared `DataTableComponent` (Dealer Ledger and others).

## Requirement

- Both header-background rules in `data-table.component.scss` use an opaque
  `background-color: rgb(47, 92, 138)` instead of the translucent
  `tokens.$report-header-blue`, so the header row renders the same solid navy everywhere,
  regardless of what's behind the cell (scrolled content, sticky/pinned columns, page
  background).
- `tokens.$report-header-blue` itself (`src/app/shared/styles/_tokens.scss`) is unchanged —
  it stays `rgba(47, 92, 138, 0.7411764706)`, still used as-is by
  `ReportHeaderBarComponent` and the table's `tfoot` total-row text color, where translucency
  either doesn't matter or is not the reported problem.

## Acceptance criteria

- The shared table's header row (including sticky/pinned columns) renders a consistent, opaque
  navy across Dealer Ledger and every other report using `DataTableComponent`, with no
  lighter/washed-out appearance from background blending.
- `ReportHeaderBarComponent`'s bar and the table's total-row text color are unaffected.

## Open decisions

- None — confirmed with the user that the issue was alpha blending, not a build/cache problem
  or a different color rendering on specific reports.
