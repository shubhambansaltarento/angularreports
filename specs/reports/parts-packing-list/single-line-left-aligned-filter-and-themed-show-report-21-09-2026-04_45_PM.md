# Parts Packing List — Spec: Single-Line, Left-Aligned Filter Form and Themed "Show Report" Button

**Created:** 21-09-2026 04:45 PM IST

## Status

Implemented.

## Purpose

Parts Packing List's filter form previously stacked Invoice Number/Delivery Number on one
Bootstrap grid row and Date From/Date To on a second, inside a card that was horizontally
centered on the page (`margin: 0 auto`) with a `max-width: 620px` — a layout that didn't match
this report's blue header-bar theme (introduced by
`legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md`) and put the whole form/card out of
the left-aligned reading order the rest of the app uses. The "Show Report" button was a plain
grey `btn-secondary`, unrelated to the report blue used elsewhere.

## Requirement

1. `parts-packing-list-filter.component.html/.scss`: all four fields (Invoice Number, Delivery
   Number, Date From, Date To) render as siblings in a single flex row
   (`.parts-packing-list-filter { display: flex; flex-wrap: wrap; gap: 1rem }`), each a
   fixed-width (`200px`) label-above-input column, instead of two stacked two-column Bootstrap
   grid rows.
2. `parts-packing-list-list.component.html/.scss`: the card wrapping the filter and the "Show
   Report" button is no longer horizontally centered — `margin: 0 auto`/`max-width: 620px` are
   removed, and the card itself becomes a flex row (`align-items: flex-end`) so the button sits
   on the same line as the filter fields, left-aligned under the header bar like every other
   report.
3. "Show Report" button (`.parts-packing-list-list__show-report-btn`) drops `btn-secondary` and
   uses the report blue (`rgb(47, 92, 138)`, matching the opaque table-header color from
   `opaque-table-header-blue-21-09-2026-04_30_PM.md`) as its background/border, white text, and
   a slightly darker blue on hover.

## Acceptance criteria

- Invoice Number, Delivery Number, Date From, Date To, and the "Show Report" button all appear
  on one horizontal line at desktop widths (wrapping only when the viewport is too narrow).
- The filter form and its fields are left-aligned under the report's blue header bar, not
  centered on the page.
- "Show Report" renders in the report's blue theme color, not grey.

## Open decisions

- None.
