# Parts Packing List — Spec: Filter Fields Properly Aligned in One Line

**Created:** 23-09-2026 02:00 PM IST

## Status

Implemented.

## Purpose

The single-line filter row (Invoice Number, Delivery Number, Date From, Date To, Show Report —
`single-line-left-aligned-filter-and-themed-show-report-21-09-2026-04_45_PM.md`) had a subtle
misalignment: Invoice Number/Delivery Number's inputs sat at a slightly different vertical
position than Date From/Date To's inputs, since they use different components with different
label-to-input spacing.

## Root cause

- `TypeaheadInputComponent` (used by Invoice Number/Delivery Number, `[compact]="true"`) has
  its own internal `gap: 0.125rem` between label and input.
- `parts-packing-list-filter.component.scss`'s `.parts-packing-list-filter__field` wrapper —
  which directly contains the plain `<label>`/`<input>` pair for Date From/Date To — had
  `gap: 0.25rem`.

Each field column therefore ended up a different overall height, so the four inputs (and the
"Show Report" button aligned to the row's bottom edge) didn't sit in a clean single line.

## Requirement

`.parts-packing-list-filter__field`'s gap changes from `0.25rem` to `0.125rem`, matching
`TypeaheadInputComponent`'s compact gap exactly — since this wrapper only applies its own gap
to Date From/Date To (the Invoice/Delivery Number fields have a single child,
`<app-typeahead-input>`, so the wrapper's `gap` is a no-op for them; their spacing comes
entirely from the typeahead component's own internal layout).

## Acceptance criteria

- Invoice Number, Delivery Number, Date From, Date To, and Show Report all sit on one visually
  even line — labels at the same height, inputs' top/bottom edges aligned across all four
  fields, and the button aligned with the inputs' bottom edge.
