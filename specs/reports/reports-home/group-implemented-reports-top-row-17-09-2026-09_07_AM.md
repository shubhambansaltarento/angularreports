# Reports Home — Group Implemented Reports in a Top Row, Separated from Not-Yet-Implemented Reports

**Created:** 2026-09-17 09:07 AM

## Status

Proposed.

## Purpose

Reports Home (`ReportsHomeComponent`) currently renders every report
in `REPORTS_CATALOG` as one flat grid, in whatever order they happen
to be listed in `reports.registry.ts` — Dealer Ledger, Goods
Acknowledgement, Warranty Reconciliation, Warranty Labour Tax Invoice,
Warranty Cost Report, Parts Packing List, VOR Print, PQM. Fully
implemented reports (real `/config`+`/data` API integration, own
dedicated page) are mixed in with reports that are still just the
generic search-only placeholder (`hasTable: false`).

The ask: put the fully-implemented reports — Dealer Ledger, Warranty
Cost Report, Warranty Reconciliation — in their own row at the top,
with a visual separation, then all remaining ("to be implemented")
reports below.

This is naturally derivable from data already on `ReportConfig`
(`hasTable: true` for a fully-built report, `false` for the
placeholder search-only ones — the exact flag `reports-home.component.html`
already uses to render the "Search parameters only" badge) — no new
per-report flag is needed, and no report needs to be named/hardcoded
in the component.

## Scope

- `ReportsHomeComponent`: split `REPORTS_CATALOG` into two groups via
  `computed()`: `implementedReports` (`hasTable === true`) and
  `pendingReports` (`hasTable === false`) — order within each group
  preserved from `REPORTS_CATALOG`'s existing order.
- `reports-home.component.html`: render two sections instead of one
  flat grid — a heading (e.g. "Available Reports") + grid for
  `implementedReports`, then a visual separator (`<hr>` or spacing +
  heading, e.g. "Coming Soon" / "Other Reports") + grid for
  `pendingReports`. Reuse the exact same card markup/classes for both
  — this is a grouping/ordering change, not a new visual card design.
- Out of scope: reordering `REPORTS_CATALOG` itself — the registry's
  order still reflects each report's "natural"/catalog order; the
  grouping is a presentation-layer concern in the component, not a
  data-reordering concern in the registry.
- Out of scope: renaming/removing the existing "Search parameters
  only" badge — it still applies to `pendingReports` cards exactly as
  today; the new section heading is in addition to that badge, not a
  replacement for it.

## Requirements

1. Dealer Ledger, Warranty Cost Report, and Warranty Reconciliation
   (the only three reports with `hasTable: true` today) render in one
   row/section at the top of the page.
2. All other reports (currently: Goods Acknowledgement, Warranty
   Labour Tax Invoice, Parts Packing List, VOR Print, PQM) render
   below, visually separated (heading and/or divider) from the top
   section.
3. If a currently-pending report is later fully implemented (its
   config's `hasTable` flips to `true`), it automatically moves to the
   top section on its own — no `ReportsHomeComponent`/registry change
   required beyond that report's own config update.
4. No change to routing, card content, or the "Search parameters
   only" badge logic.

## Acceptance criteria

- Reports Home shows exactly 3 cards (Dealer Ledger, Warranty Cost
  Report, Warranty Reconciliation) in the first section, in that
  registry order.
- The remaining 5 cards render in a second, visually distinct section
  below.
- `reports-home.component.spec.ts` updated: asserts the implemented
  section contains exactly the `hasTable: true` reports and the
  pending section contains the rest, rather than asserting a single
  flat list.

## Open decisions

- None — purely a presentation grouping derived from an existing flag.
