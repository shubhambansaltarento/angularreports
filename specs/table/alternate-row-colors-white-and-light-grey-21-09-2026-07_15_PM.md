# Shared Data Table — Spec: Alternate Row Colors, White and Light Grey

**Created:** 21-09-2026 07:15 PM IST

## Status

Implemented.

## Purpose

Every report's table body should read as a clean, bordered striped table — alternating row
backgrounds so long rows of data stay easy to scan, matching the legacy SAP-BO reference look
(`legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md`).

## Requirement

In the shared `DataTableComponent` (`src/app/shared/ui/data-table/data-table.component.scss`),
body rows alternate:

- Odd rows (1st, 3rd, 5th, …): white (the table's own background, no override needed).
- Even rows (2nd, 4th, 6th, …): light grey, `#f5f7fa` — via
  `.data-table__table tr[cdk-row]:nth-child(even)`.
- Hovered rows: a slightly darker `#eef2f7`, regardless of stripe — via
  `.data-table__table tr[cdk-row]:hover`.

This applies identically to every report using the shared table (Dealer Ledger, Goods
Acknowledgement, Warranty Reconciliation, Parts Packing List) — there is no per-report
override.

## Acceptance criteria

- Every table's body rows visibly alternate white/light-grey, top to bottom.
- Hovering any row shows a distinct, slightly darker highlight without breaking the
  underlying stripe pattern once the pointer moves away.
- No report overrides this striping with its own row colors.
