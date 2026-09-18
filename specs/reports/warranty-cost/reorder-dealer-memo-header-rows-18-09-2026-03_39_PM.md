# Warranty Cost Report — Spec: Reorder Dealer/Memo/Header Rows; Memo as 2-Row Table

**Created:** 2026-09-18 15:39 IST

## Status

Implemented.

## Purpose

Two related changes, per direct clarification:

1. Row order at the top of each dealer's table becomes **purple (dealer
   row) → green (memo row) → blue (column headers)** — the column-header
   row now renders *below* the dealer/memo rows instead of above them.
   Confirmed intentional (not swapping only purple/green) via explicit
   follow-up.
2. The green memo row becomes a **2-row mini-table** (label row + value
   row) instead of one row with all six memo/order fields crammed
   together via `&nbsp;`-separated text.

Since the column-header row no longer sits structurally first, it can no
longer live in a semantic `<thead>` (browsers always pin `<thead>` above
`<tbody>` regardless of source order) — it's now a plain `<tr>` inside
`<tbody>`, styled via a class instead of the `thead th` selector.

## Requirements

1. Each dealer group's `<tbody>` renders, in order: the dealer-identity
   row (`.warranty-cost-statement__dealer-row`, purple) → the memo label
   row (`.warranty-cost-statement__memo-row--label`, green, bold) → the
   memo value row (`.warranty-cost-statement__memo-row`, green) → the
   column-header row (`.warranty-cost-statement__column-header`, blue,
   now a plain `<tr>`, not `<thead>`) → line-item rows → the totals row.
2. The memo label row shows "CN MEMO NO." / "DOC DATE" / "ORDER NUM" /
   "ORDER DATE" / "DLR REF NUM" / "REF DATE" as column labels (each
   `colspan="2"` except the last, `colspan="1"`, summing to 11 to match
   the table's column count); the memo value row shows the corresponding
   values from the group's first row, same `colspan`s.
3. `.warranty-cost-statement__column-header th` replaces the old
   `thead th` CSS selector (no more `<thead>` element in this table).

## Acceptance criteria

- Row order at the top of each dealer's table is exactly: dealer row,
  memo label row, memo value row, column-header row — confirmed via a
  spec asserting each row's class in sequence.
- The memo section renders as two distinct rows (label row bold, value
  row not bold), not one combined row.
- `warranty-cost-statement.component.spec.ts` updated for the new
  row order/structure. Full suite (`ng test`, 232/232) and `ng build`
  pass.

## Open decisions

None — directly confirmed with the user, including the unusual
"header below data" ordering, before implementing.
