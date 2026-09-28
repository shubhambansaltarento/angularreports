# Warranty Cost Report — Spec: Stack Memo and Item Header Rows Above Their Data

**Created:** 28-09-2026 11:15 AM IST

## Status

Implemented, using the assumptions in Open decisions (dealer row kept at the top; one memo value row per dealer).

## Purpose

Today each dealer's statement table in `warranty-cost-statement.component.html` pairs each header row with its own data, in this order (per `reorder-dealer-memo-header-rows-18-09-2026-03_39_PM.md`):

1. Dealer row (purple): `DEALER : 0000010015  PAVAN SEKHAR AUTOMOBILES`
2. Memo label row (green): CN MEMO NO. / DOC DATE / ORDER NUM / ORDER DATE / DLR REF NUM / REF DATE
3. Memo value row (green): 0091048544 / 12.09.2026 / 0064162944 / 08.09.2026 / HOS-44 / 08.09.2026
4. Item column-header row (blue): S.NO / PART NUMBER / … / TOTAL COST
5. Line-item rows
6. Totals row

The new layout puts **both header rows together at the top of the table, followed by the data**, still as one single table:

1. Dealer row (purple), unchanged (see Open decisions)
2. **Header row 1:** memo labels: CN MEMO NO. / DOC DATE / ORDER NUM / ORDER DATE / DLR REF NUM / REF DATE
3. **Header row 2:** item column headers: S.NO / PART NUMBER / DESCRIPTION / QUANTITY / NDP RATE / EXCISE / SALES TAX / LABOUR / OCTROI / SERVICE TAX / TOTAL COST
4. **Data for header row 1:** the memo value row: 0091048544 / 12.09.2026 / 0064162944 / 08.09.2026 / HOS-44 / 08.09.2026
5. **Data for header row 2:** the line-item rows, for example:
   - 1 / KE300120 / BATTERY CHARGER OFFBOARD 650 W / 1 / 10,114.18 / 0.00 / 0.00 / 0.00 / 0.00 / 0.00 / 10,114.18
   - 2 / KE300120 / BATTERY CHARGER OFFBOARD 650 W / 1 / 10,114.18 / 0.00 / 0.00 / 0.00 / 0.00 / 0.00 / 10,114.18
   - 3 / KE242080 / BATTERY PACK ASSY / 1 / 25,470.00 / 0.00 / 0.00 / 120.00 / 0.00 / 0.00 / 25,590.00
   - …
6. Totals row, unchanged

In short, the item column-header row moves up from below the memo value row to directly below the memo label row.

## Requirements

1. Each dealer group's `<tbody>` renders, in order:
   dealer row (`.warranty-cost-statement__dealer-row`) → memo label row (`.warranty-cost-statement__memo-row--label`) → item column-header row (`.warranty-cost-statement__column-header`) → memo value row (`.warranty-cost-statement__memo-row`) → line-item rows → totals row.
2. It stays one `<table>` per dealer group with 11 columns. The memo label and memo value rows keep their current `colspan`s (2/2/2/2/2/1 = 11) so they line up with each other.
3. Colours stay as they are: memo label and value rows green, column-header row blue, dealer row purple, totals row bold with a top border.
4. When a dealer group has no line items (`group.rows.length === 0`), the memo label and memo value rows are still left out, as today. Whether the item column-header row still shows for an empty group follows today's behaviour (it shows).
5. No data, model, store or service changes. This only reorders rows in the template (plus any spacing/border tweaks the SCSS needs for the new neighbours).
6. Print and Download (PDF) show the same row order as the on-screen statement.

## Acceptance criteria

- For the dealer in the screenshot (0000010015, PAVAN SEKHAR AUTOMOBILES), the table reads top to bottom: dealer row, CN MEMO NO.… header row, S.NO… header row, `0091048544 … 08.09.2026` memo value row, items 1–6, totals row (68,025.91 / 0.00 / 0.00 / 295.00 / 0.00 / 0.00 / 68,320.91).
- Line-item values, S.NO numbering, totals and the summary block below the table (PARTS VALUE, TOTAL VALUE, etc.) are unchanged.
- `warranty-cost-statement.component.spec.ts` checks the new row-class order for a dealer group.
- Full `ng test` and `ng build` pass.

## Open decisions

1. **Dealer row:** does the purple `DEALER : …` row stay above the two header rows, or should it be removed or moved? This spec assumes it stays at the top.
2. **More than one CN memo per dealer:** the memo value row today always shows the group's *first* row's memo fields (`group.rows[0]`), even if later items belong to a different CN memo. With the new layout, should each distinct CN memo get its own memo value row followed by its own items (headers still shown once at the top)? Or should there still be one memo value row per dealer? This spec assumes one memo value row per dealer (today's behaviour) unless told otherwise.
