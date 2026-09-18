# Reports Home — Spec: Branded Icon Card Grid Redesign

**Created:** 2026-09-18 12:34 IST

## Status

Implemented.

## Purpose

Replace the current two-section (In Progress / To Be Picked) status-grouped
layout with a single flat grid of report cards, each with its own colored
circular icon, matching the provided "TVS Dealer Reports" mockup. Status
grouping (three-section-status-grouping-17-09-2026-09_10_AM.md,
group-implemented-reports-top-row-17-09-2026-09_07_AM.md) is dropped entirely —
every report renders as an equal card in one grid, in a fixed order.

## Reference design

- Centered header: "TVS" wordmark (bold italic, navy) + a running-horse
  mark (red) + "Dealer Reports" (bold, navy) — on a light grey page
  background.
- Below it, a grid of white, rounded-corner cards (3 per row on wide
  viewports), each with:
  - A colored circular icon on the left (a different color per report).
  - Bold report title.
  - Muted description text below the title.
- Order (per mockup): Dealer Ledger, Warranty Reconciliation, Warranty
  Cost Report, Parts Packing List, Goods Acknowledgement, Warranty Labour
  Tax Invoice, VOR Print, PQM.
- No "Search parameters only" badge, no section headings, no divider —
  every card looks identical regardless of `apiIntegrated`/`hasTable`.

## Requirements

1. `ReportsHomeComponent` drops `inProgressReports`/`toBePickedReports` in
   favor of a single ordered list (`REPORTS_CATALOG`, reordered to match
   the mockup) — no filtering/grouping by `apiIntegrated`.
2. A per-report icon + background color lookup (keyed by `ReportConfig.id`,
   not a new field on the shared `ReportConfig` model — kept local to this
   page, since icon/branding is presentational, not a cross-cutting report
   property):
   - Dealer Ledger: blue circle, pie-chart icon.
   - Warranty Reconciliation: light-blue circle, shield-check icon.
   - Warranty Cost Report: green circle, receipt/file icon.
   - Parts Packing List: coral circle, box/check icon.
   - Goods Acknowledgement: teal circle, document-check icon.
   - Warranty Labour Tax Invoice: purple circle, receipt icon.
   - VOR Print: slate circle, printer icon.
   - PQM: amber circle, badge/award icon.
3. Icons rendered via Bootstrap Icons (`bi bi-*` classes) — not previously
   wired into this project (`bootstrap-icons` added as a new dependency,
   its stylesheet imported in `src/styles.scss`; the export menu's existing
   `bi-*` classes in `data-table.component.ts` were already assuming this
   and are now correctly rendered as a side effect).
4. The header renders "TVS" + a horse mark + "Dealer Reports", centered,
   styled per the mockup's colors/weights (see Open decisions for the
   horse mark's actual asset).
5. Cards no longer render the "Search parameters only" badge or any
   status-derived styling difference between reports.

## Acceptance criteria

- The page shows one flat grid (3 cards per row on wide viewports) in the
  exact order listed above, each with a distinctly colored icon circle,
  bold title, and description — no section headings anywhere.
- The centered "TVS ... Dealer Reports" header renders above the grid.
- `reports-home.component.spec.ts` is updated: no more
  `inProgressReports`/`toBePickedReports`-based assertions; instead assert
  the flat, ordered list and that every card renders an icon.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

- No TVS horse-logo asset was provided — implemented as a horse emoji
  placeholder next to the "TVS" wordmark rather than a real brand asset;
  swap in the real SVG/PNG logo once available.
- Exact icon-per-report choices are approximated from the mockup's
  silhouettes (e.g. "box with checkmark" for Parts Packing List), not
  pixel-matched to a specific icon set beyond "closest available
  Bootstrap Icons glyph".
- Whether `REPORTS_CATALOG`'s order should be considered the canonical
  navigation order going forward (affecting anything else that might
  someday iterate it), or this page-specific ordering is temporary — no
  other consumer currently depends on catalog order, so this is a
  non-breaking reorder.
