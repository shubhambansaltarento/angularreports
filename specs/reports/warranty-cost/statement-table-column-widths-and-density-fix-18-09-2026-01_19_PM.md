# Warranty Cost Report — Spec: Statement Table Column Widths/Density Fix

**Created:** 2026-09-18 13:19 IST

## Status

Implemented.

## Purpose

The statement rendered correctly structurally (letterhead, headers, dealer
row, totals) but the "PART NUMBER / DESCRIPTION" column was too narrow,
causing every description to wrap across 3-4 lines and inflating row
height dramatically compared to the reference PDF's compact, dense rows —
confirmed via a rendered screenshot.

## Requirements

1. `.warranty-cost-statement__table` uses `table-layout: fixed` with
   explicit per-column width percentages, giving the Part Number/
   Description column (22%) far more room than the narrow admin columns
   (3-8% each), so most descriptions fit on one line instead of wrapping.
2. The statement's overall width increases from `1100px` to `1400px` to
   accommodate the wider description column without further starving the
   other columns.
3. Font size reduced slightly (`0.75rem` -> `0.6875rem`) and cell padding
   tightened, with an explicit `line-height: 1.3`, matching the reference
   document's denser look.

## Acceptance criteria

- Rendered rows are visibly more compact — most line items render on 1-2
  lines instead of 4+.
- Table structure/data (columns, dealer grouping, totals, summary block)
  unchanged — this is a pure layout/density fix.
- Full suite (`ng test`, 225/225) and `ng build` pass (no test asserts on
  pixel widths, so no spec changes were needed).

## Open decisions

- Exact per-column percentages are approximated from the reference PDF's
  proportions, not pixel-measured.
