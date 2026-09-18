# Warranty Cost Report — Spec: Statement Table's Fixed Column Set

**Created:** 2026-09-18 15:26 IST

## Status

Implemented.

## Purpose

Corrects an earlier version of this spec (which mistakenly claimed the
existing 16-column table already matched what was wanted). Per direct
clarification, the statement's line-item table has a much narrower, fixed
column set — no admin/reference columns (CN Memo No., Doc Date, Order Num,
Order Date, Dlr Ref Num, Ref Date) at all; those are dropped from the
table entirely. Part Number and Description become two separate columns
(not one merged two-line cell).

## The only columns

In this exact order:

1. S.NO
2. PART NUMBER
3. DESCRIPTION
4. QUANTITY
5. NDP RATE
6. EXCISE
7. SALES TAX
8. LABOUR
9. OCTROI
10. SERVICE TAX
11. TOTAL COST

## Requirements

1. `WarrantyCostStatementComponent`'s table renders exactly these 11
   columns, in this order — CN Memo No./Doc Date/Order Num/Order Date/Dlr
   Ref Num/Ref Date are removed from the table entirely (not just hidden).
2. Part Number and Description render as two separate `<td>`s (no `<br>`
   merge), each its own column.
3. The green memo row (green-memo-row-between-header-and-dealer-row-18-09-2026-01_49_PM.md)
   and the totals row are updated to this 11-column width (`colspan`
   values adjusted accordingly).
4. `freight`/`demurrage`/`billing_doc`/`plant`/`cn_memo_no`/`doc_date`/
   `order_num`/`order_date`/`dlr_ref_num`/`ref_date` remain in
   `WarrantyCostRow`/the raw API row (no model change) — they're simply
   not rendered as table columns. The green memo row still needs
   `cnMemoNo`/`docDate`/`orderNum`/`orderDate`/`dlrRefNum`/`refDate`, so
   it keeps its own markup separate from the now-narrower line-item table
   header/rows.

## Acceptance criteria

- The rendered table has exactly these 11 `<th>`s, in this order, and no
  others — CN Memo No./Doc Date/Order Num/Order Date/Dlr Ref Num/Ref Date
  do not appear as table columns anywhere.
- Part Number and Description render in separate cells.
- The green memo row still shows CN Memo No./Doc Date/Order Num/Order
  Date/Dlr Ref Num/Ref Date (unchanged) — only the line-item table's own
  columns shrink.
- `warranty-cost-statement.component.spec.ts` updated for the new column
  count/order. Full suite (`ng test`) and `ng build` pass.

## Open decisions

None.
