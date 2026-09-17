# Dealer Ledger — Spec 5: Match the Redesigned Table's Visual Language

**Created:** 2026-09-16 13:52 IST

## Status

Proposed. Companion to `specs/table/spec-table-visual-redesign.md` and
`specs/reports/dealer-ledger/remove-actions-row-16-09-2026-01_52_PM.md`.

## Purpose

`specs/table/spec-table-visual-redesign.md` gives the shared `DataTableComponent`
a gradient toolbar, pill-shaped inputs/buttons, and rounded numbered
pagination. Today the rest of the Dealer Ledger page — toolbar header, filter
panel, checkboxes, summary cards — still uses the old plain styling
(`dealer-ledger-toolbar.component.scss`, `dealer-ledger-filter.component.scss`,
`dealer-ledger-summary-cards.component.scss`), so the page reads as two
different design languages stitched together once the table is restyled.
This spec brings the rest of the Dealer Ledger page's presentation in line
with the table's new look.

## Scope

- `dealer-ledger-toolbar.component` (page header/title + entry count).
- `dealer-ledger-filter.component` (Dealer Code/Description/Company
  Code/Date Range/Include Details, post-Spec 4's removed action row).
- `dealer-ledger-summary-cards.component`.
- Out of scope: the table itself (already covered by
  `specs/table/spec-table-visual-redesign.md`), and any change to
  functional behavior (covered separately by Spec 4).

## Requirements

1. Shared visual tokens (colors, radii, spacing) used by the table's
   gradient/pill treatment are reused here rather than re-invented — e.g.
   the same gradient, the same pill/circle radius (`999px`/`50%`), the same
   muted text colors — so the two areas of the page read as one system.
2. `Include Details` checkboxes render inside a card/panel styled
   consistently with the table's rounded, soft-bordered visual language
   (rather than the current plain `1px solid #d0d0d0` fieldset box).
3. The retained Reset control (per Spec 4) is styled as a pill/icon button
   matching the table toolbar's button treatment.
4. The page toolbar (`dealer-ledger-toolbar`) adopts the same rounded,
   card-like treatment as the table's toolbar bar (it does not have to reuse
   the gradient itself, since it is not an action bar — but spacing, radius,
   and type treatment should feel like the same design system).
5. Read-only Dealer Code/Description text (per Spec 1) and the remaining
   editable fields (Company Code, Date Range) keep clear visual affordance
   distinguishing "read-only" vs. "editable", using the same input styling
   language as the table's own pill search input where applicable.

## Acceptance criteria

- Toolbar, filter panel, and summary cards visually read as part of the same
  design system as the redesigned table (consistent radii, spacing, color
  palette) rather than a mix of old plain-CSS and new pill/gradient styling.
- No functional regression to any of these components' existing behavior
  (prefill, checkbox toggling, reset, summary display).
- Existing DOM-structure-dependent specs for these components continue to
  pass, updated only for intentional class/markup changes made by this
  restyle.

## Open decisions

- Whether the filter panel/toolbar adopt the gradient background directly
  (visually "one continuous bar" with the table) or a lighter/neutral
  variant of the same palette (avoiding an all-gradient page) — TBD, pending
  visual review once Spec 4's layout change lands.
- Final resolution of the shared color/spacing tokens as reusable
  CSS custom properties (vs. duplicating literal values per component, as
  today) — TBD, tracked against the open styling/theming-layer decision in
  `specs/design/design.md`.
