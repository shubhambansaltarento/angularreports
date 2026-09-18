# Parts Packing List — Spec: Compact, Reordered Filter Layout

**Created:** 2026-09-18 12:08 IST

## Status

Proposed.

## Purpose

Restyle `PartsPackingListFilterComponent`'s layout to match the provided
reference mockup: a specific row order, small/compact inputs so the panel
doesn't crowd out the table below it, and every typed field usable as a
"type or select" dropdown (already the intent of `TypeaheadInputComponent`,
per parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md — this
spec is about layout/sizing, not introducing new dropdown behavior).

The current implementation
(parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md) already
has the right fields and the single small/secondary "Show Report" button,
but orders the rows differently: Invoice/Delivery Number, then Date Range,
then Case From/To, then Material From/To. The mockup instead orders Case
and Material before Date Range, and expects visibly smaller controls.

## Reference layout (per mockup)

- **Row 1 — Input Parameters**: Invoice Number (type-or-select) | Delivery
  Number (type-or-select), side by side.
- **Row 2 — Case**: From (type-or-select) | To (type-or-select).
- **Row 3 — Material**: From (type-or-select) | To (type-or-select).
- **Row 4 — Date Range**: From (native date input, calendar icon) | To
  (native date input, calendar icon) — the only row with a calendar-style
  control; Case/Material stay plain type-or-select text fields, not date
  pickers.
- Single small, secondary-styled "Show Report" button below all rows,
  matching single-show-report-button-replaces-embedded-submit-17-09-2026-04_31_PM.md's
  established convention (already correct in the current implementation —
  unaffected by this spec).
- Breadcrumb (`Reports / Parts Packing List`) and centered page title above
  the filter panel — already present, unaffected.

## Requirements

1. Reorder `PartsPackingListFilterComponent`'s template to: Invoice
   Number/Delivery Number -> Case From/To -> Material From/To -> Date
   Range From/To (currently Date Range is second; move it to last).
2. Reduce every field's visual footprint (label + input) so the whole
   panel reads as compact and doesn't push the table far down the page —
   smaller input height/padding and font-size than the current
   `form-control` default, consistently across every field (Invoice/
   Delivery/Case/Material typeahead inputs and the two native date
   inputs), similar in spirit to Dealer Ledger's own reduced-size
   `date-range-label-grey-show-report-button-17-09-2026-06_15_AM.md` sizing.
3. Every Invoice Number/Delivery Number/Case From/To/Material From/To
   field remains a `TypeaheadInputComponent` (type-or-select) — this spec
   does not change which fields are typeahead vs. plain, only their order
   and size.
4. Date Range From/To remain native `<input type="date">` fields (calendar
   icon, browser-native picker) — not converted to typeahead.
5. No change to the underlying `PartsPackingListFilters`
   model/`submit()`/`isSubmitDisabled()` behavior, the single Show Report
   button, or the page's hide-table-until-submit behavior — layout/sizing
   only.

## Acceptance criteria

- The rendered filter panel's row order matches the mockup exactly: Invoice/
  Delivery Number, then Case From/To, then Material From/To, then Date
  Range From/To.
- All five type-or-select fields (Invoice/Delivery/Case From/To/Material
  From/To) are visibly smaller than the current default `form-control`
  sizing, and consistent with each other.
- The Date Range row still shows the native browser date-picker calendar
  icon on both inputs.
- `parts-packing-list-filter.component.spec.ts` is updated for the new
  field order (existing querySelector-by-id assertions are unaffected by
  reordering, since ids are unchanged) and any new sizing class(es)
  introduced.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

- Exact compact sizing values (input height/padding/font-size) are not
  pixel-specified in the mockup — default assumption is to reuse Dealer
  Ledger's existing smaller-button/input sizing conventions
  (`date-range-label-grey-show-report-button-17-09-2026-06_15_AM.md`,
  `shorter-date-pickers-and-grey-show-report-bg-17-09-2026-06_18_AM.md`) rather
  than inventing new values, for visual consistency across reports.
- Whether Case/Material fields should be narrower in width than Invoice/
  Delivery Number (mockup shows them narrower) — default assumption is yes,
  matching the mockup's proportions, via Bootstrap column width classes.
