# Parts Packing List — Spec: Remove Section Labels, Narrower Card, Default Button Color

**Created:** 2026-09-18 12:19 IST

## Status

Proposed.

## Purpose

Three follow-up corrections to
card-layout-with-labeled-fields-and-primary-button-18-09-2026-12_14_PM.md:

1. The "Input Parameters"/"Filter Menu" section labels are unwanted —
   remove them entirely (not just restyle).
2. The card currently stretches the full available width, which reads as
   too wide for a form with only 8 fields — narrow it.
3. The Show Report button's blue `btn-primary` styling from the previous
   spec is reverted back to the platform's default button color (i.e. the
   secondary/grey styling every other report's Show Report button already
   uses, per single-show-report-button-replaces-embedded-submit-17-09-2026-04_31_PM.md).

## Requirements

1. `PartsPackingListFilterComponent`'s template no longer renders the
   "Input Parameters" or "Filter Menu" `<h2>` section labels (and their
   `.parts-packing-list-filter__section-label` styling, now unused, is
   removed) — all eight fields render directly, still in the established
   order (Invoice Number/Delivery Number, Case From/To, Material From/To,
   Date From/To).
2. `.parts-packing-list-list__card` gets a `max-width` (e.g. `~600px`, not
   full-bleed) so the form reads as a compact panel rather than stretching
   the page width — matching the density already established for its
   individual fields (parts-packing-list-filter-compact-row-layout-18-09-2026-12_08_PM.md).
3. The Show Report button's class reverts from `btn-primary` back to
   `btn-secondary` (still `btn btn-sm`), matching every other report's
   Show Report button color.

## Acceptance criteria

- Neither "Input Parameters" nor "Filter Menu" text appears anywhere on
  the page.
- The card is visibly narrower than full page width.
- The Show Report button renders in the platform's default/grey button
  color, not blue.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

- Exact `max-width` value for the card is not pixel-specified — default
  assumption is a value that comfortably fits two `col-6` fields per row
  without excess whitespace (~600–650px), consistent with this report's
  existing pattern of approximating unspecified visual details.
