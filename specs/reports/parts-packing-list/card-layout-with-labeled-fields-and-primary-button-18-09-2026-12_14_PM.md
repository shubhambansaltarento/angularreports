# Parts Packing List — Spec: Card Layout, Labeled Fields, Primary Show Report Button

**Created:** 2026-09-18 12:14 IST

## Status

Implemented.

## Purpose

Supersedes
parts-packing-list-filter-compact-row-layout-18-09-2026-12_08_PM.md's row
order/sizing with a full visual redesign, per a second, more detailed
reference mockup: a bordered/shadowed white card containing the title and
filter, breadcrumb above the card, each field its own fully-labeled control
(e.g. "Case From"/"Case To" as flat labels, not a "Case" section with
From/To sub-labels), placeholder text on the Input Parameters fields, and a
**blue primary** "Show Report" button (not grey/secondary, superseding
single-show-report-button-replaces-embedded-submit-17-09-2026-04_31_PM.md's
secondary styling for this report specifically).

## Reference layout (per second mockup)

- Breadcrumb (`Reports / Parts Packing List`) above the card, left-aligned,
  small/muted text.
- White card: border, rounded corners, subtle shadow, padding.
  - Bold, left-aligned page title ("Parts Packing List") at the top of the
    card (no longer a separate centered `<header>` block).
  - "Input Parameters" section label — bold, uppercase, muted color, with a
    bottom border — above Invoice Number/Delivery Number, each with its own
    label and placeholder text ("Enter invoice number"/"Enter delivery
    number").
  - "Filter Menu" section label (same style) above: Case From/Case To,
    Material From/Material To, Date From/Date To — each pair on its own
    row, two equal columns, each field with its own full label (not grouped
    under a shared "Case"/"Material"/"Date Range" heading).
  - Small **blue** ("Show Report") button at the bottom-left of the card.
- Table (when shown) renders below/outside the card, unchanged.

## Requirements

1. `PartsPackingListListComponent`'s template wraps the title + filter +
   Show Report button in a `.parts-packing-list-list__card` container
   (white background, `1px solid` border, `0.5rem` radius, subtle
   box-shadow, `1.5rem` padding); the breadcrumb stays outside/above it.
2. The page title becomes a left-aligned, bold `h1`
   (`.parts-packing-list-list__title`) directly inside the card — the
   previous centered `.parts-packing-list-list__header` block is removed.
3. The Show Report button's class changes from `btn-secondary` to
   `btn-primary` (still `btn btn-sm`) — this report's button is blue,
   unlike Dealer Ledger/Warranty reports' grey secondary button.
4. `PartsPackingListFilterComponent`'s template is flattened: each Case/
   Material/Date field gets its own full label ("Case From", "Case To",
   "Material From", "Material To", "Date From", "Date To") instead of a
   shared section label with "From"/"To" sub-labels. Invoice Number/
   Delivery Number gain placeholder text via `TypeaheadInputComponent`'s
   existing `placeholder` input.
5. Section labels ("Input Parameters"/"Filter Menu") are styled bold,
   uppercase, muted, with a bottom border — visually separating each
   section, matching the mockup's underlined look.
6. All fields remain two-per-row (`col-6`), all typeahead fields keep
   `[compact]="true"` from the prior layout spec; Date From/To remain
   native `<input type="date">` with `form-control-sm`.

## Acceptance criteria

- The page renders a bordered/shadowed card containing the title, both
  filter sections, and a small blue "Show Report" button; the breadcrumb
  is outside the card.
- Every Case/Material/Date field shows its own full label exactly as
  listed above (no shared "Case"/"Material"/"Date Range" group heading).
- Invoice Number/Delivery Number show placeholder text when empty.
- Full suite (`ng test`, 217/217) and `ng build` pass (no existing spec
  referenced the removed `.parts-packing-list-list__header` class or the
  old grouped-range markup, so no test updates were required beyond what
  this change itself touches).

## Open decisions

- Exact card border/shadow/radius values are approximated from the mockup
  (not pixel-measured) — acceptable per this report's existing pattern of
  approximating unspecified visual details (e.g.
  parts-packing-list-filter-compact-row-layout-18-09-2026-12_08_PM.md's sizing
  Open decision).
- Whether other reports (Dealer Ledger/Warranty) should eventually adopt
  this same card treatment for visual consistency — not requested; this
  spec scopes the change to Parts Packing List only.
