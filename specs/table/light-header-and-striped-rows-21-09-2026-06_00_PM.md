# Shared Data Table — Spec: Light Header Row, White/Grey Striped Body Rows

**Created:** 21-09-2026 06:00 PM IST

## Status

Implemented.

## Purpose

Reference screenshot (P902 - Alternate Part Details) shows the target table look for every
report using the shared `DataTableComponent` (Dealer Ledger, Goods Acknowledgement, Warranty
Reconciliation, Parts Packing List — confirmed as the full set of tables in the app, per the
"are we using common table in all reports?" discussion): a light steel-blue header row with
dark (not white) header text in normal case (not uppercase), and body rows alternating
white/light-grey, bordered.

This replaces the dark navy, white/uppercase header introduced by
`legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md` and made opaque by
`opaque-table-header-blue-21-09-2026-04_30_PM.md`.

## Requirement

1. `data-table.component.scss`: `--data-table-header-color` default changes from the opaque
   navy `rgb(47, 92, 138)` to a light steel blue, `#a9c6e8` — the same light blue already used
   by Warranty Cost Report's own statement table header
   (`warranty-cost-statement.component.scss`'s `.warranty-cost-statement__column-header th`),
   so the app has one light-header blue instead of two.
2. `.data-table__table th` header text changes from white to dark (`#212529`, matching body
   text) and drops `text-transform: uppercase`/`letter-spacing` — normal-case header labels,
   matching the reference screenshot ("Si No", "Part No", not "SI NO", "PART NO").
3. Body row striping (`tr[cdk-row]:nth-child(even)` light grey, odd rows white) is unchanged
   from the existing implementation — already matches the reference.
4. Parts Packing List's own override
   (`parts-packing-list-table.component.scss`'s `--data-table-header-color:
   rgba(47, 92, 138, 0.7411764706)`, from `parts-packing-list-table-header-color-21-09-2026-05_30_PM.md`)
   is removed — that spec's distinct-color request is superseded by this one applying the same
   light header to every report's table, Parts Packing List included.
5. `tfoot` total-row text color (`tokens.$report-header-blue`, still the translucent
   `rgba(47, 92, 138, 0.7411764706)`) is unchanged — it's a text color on a white row, not a
   header background, so it still reads clearly and isn't part of this ask.

## Acceptance criteria

- Every report's table (Dealer Ledger, Goods Acknowledgement, Warranty Reconciliation, Parts
  Packing List) renders a light steel-blue (`#a9c6e8`) header row with dark, normal-case text.
- Body rows still alternate white/light-grey.
- No report has a distinct header color anymore — all tables share the same look.
