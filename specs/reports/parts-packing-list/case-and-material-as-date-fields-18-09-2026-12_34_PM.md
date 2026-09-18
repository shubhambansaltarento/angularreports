# Parts Packing List — Spec: Case/Material From/To as Calendar Fields

**Created:** 2026-09-18 12:34 IST

## Status

Implemented.

## Purpose

Case From/To and Material From/To were typeahead text inputs
(`TypeaheadInputComponent`). They should instead be native calendar
(date-picker) fields, matching the Date From/Date To fields' existing
`<input type="date">` treatment — not free-typed/typeahead text.

## Requirements

1. `PartsPackingListFilterComponent`'s `caseFrom`/`caseTo`/`materialFrom`/
   `materialTo` form controls render as native `<input type="date">`
   (`form-control form-control-sm`, matching Date From/To's existing
   markup) instead of `<app-typeahead-input>`.
2. `PartsPackingListFilters`' `caseFrom`/`caseTo`/`materialFrom`/
   `materialTo` fields keep their existing `string | undefined` type (ISO
   date strings, `yyyy-MM-dd`, same shape as `dateFrom`/`dateTo`) — no
   model change needed, only the control type in the template.
3. `PartsPackingListService`'s client-side range filtering
   (`applyClientFilters`/`inRange`) continues to compare these as plain
   strings against `case_number`/`part_number` — unaffected by this
   change (string comparison works the same whether the string came from
   a date picker or free text).
4. Invoice Number/Delivery Number remain typeahead (type-or-select) text
   fields — unaffected by this spec.

## Acceptance criteria

- Case From/To and Material From/To render as native date inputs with the
  browser's calendar icon, identical in style to Date From/To.
- `parts-packing-list-filter.component.spec.ts` is updated for the new
  control type.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

None.
