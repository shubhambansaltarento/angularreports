# Warranty Cost Report — Spec: Green Memo Row Between Header and Dealer Row

**Created:** 2026-09-18 13:49 IST

## Status

Implemented.

## Purpose

Supersedes the reverted per-block `rowspan` grouping
(merge-shared-memo-columns-with-grey-shading-18-09-2026-01_45_PM.md, reverted per
user feedback — that approach grouped memo values per consecutive-row
block, which was not what was wanted). The actual requirement, per direct
clarification: `cn_memo_no`/`doc_date`/`order_num`/`order_date`/
`dlr_ref_num`/`ref_date` are identical across every row in a dealer
group's result set — so render them once more, as an **additional** green
row inserted between the blue header row and the pink dealer-identity row,
taken from the group's first row (any row works, since all rows share the
same values). This is purely additive: the existing white line-item rows
are **not** changed in any way — they keep showing their own
`cnMemoNo`/`docDate`/`orderNum`/`orderDate`/`dlrRefNum`/`refDate` values
exactly as before. (An earlier version of this change also blanked those
columns out of the line-item rows — that was wrong and was reverted per
follow-up feedback: the green row is an extra row, not a replacement for
anything in the existing rows.)

## Requirements

1. `WarrantyCostStatementComponent`'s table renders a new
   `.warranty-cost-statement__memo-row` row immediately after `<thead>`
   and immediately before the existing `.warranty-cost-statement__dealer-row`
   — showing `group.rows[0].cnMemoNo`/`docDate`/`orderNum`/`orderDate`/
   `dlrRefNum`/`refDate` in those six column positions (SL NO's column
   blank, the remaining Part Number-onward columns blank via `colspan`).
2. Every line-item row is completely unchanged from before this spec —
   still rendering its own `cnMemoNo`/`docDate`/`orderNum`/`orderDate`/
   `dlrRefNum`/`refDate` per row, exactly as originally implemented.
3. The green row is styled with a green background
   (`.warranty-cost-statement__memo-row`), visually distinct from the blue
   header, pink dealer row, and yellow summary block.
4. No change to `WarrantyCostRow`/`WarrantyCostDealerGroup`/`WarrantyCostSummary`
   models, or to `WarrantyCostService`'s grouping/summarizing logic — this
   is a pure, additive rendering change in
   `WarrantyCostStatementComponent`'s template.

## Acceptance criteria

- Every dealer group's table shows exactly one green row, positioned
  between the header and the dealer-identity row, with the six memo/order
  values.
- Every line-item row renders identically to before this spec, including
  still showing its own memo/order values.
- `warranty-cost-statement.component.spec.ts` asserts the green row's
  position/content, and confirms line-item rows still contain their own
  memo/order values (unchanged).
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

None.
