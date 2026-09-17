# Table — Generalize the Export Filename Pattern to Every Report, Not Just Dealer Ledger

**Created:** 2026-09-17 06:46 AM

## Status

Implemented — shared function at
`shared/services/export/utils/report-export-filename.ts`; the
Dealer-Ledger-specific wrapper file was deleted (Open decision
resolved as: no wrapper, `DealerLedgerTableComponent` calls
`buildReportExportFilename(DEALER_LEDGER_REPORT_KEY, this.dealerName())`
directly).

## Purpose

`export-panel-redesign-and-dealer-ledger-filename-17-09-2026-06_35_AM.md`
built the `DEALER_LEDGER_{dealer name}_{timestamp}-report` filename
pattern as Dealer-Ledger-specific code
(`buildDealerLedgerExportFilename()`, hardcoding
`DEALER_LEDGER_REPORT_KEY`). The Reports Home screen
(`reports-home.component`) lists eight reports total — Dealer Ledger,
Goods Acknowledgement, Warranty Reconciliation, Warranty Labour Tax
Invoice, Warranty Cost Report, Parts Packing List, VOR Print, PQM —
each with its own report key. Per this request, every report's export
filename should use the same pattern with **its own** report-key
prefix (e.g. `WARRANTY_COST_...` for Warranty Cost Report), not just
Dealer Ledger's.

## Current implementation

- `buildDealerLedgerExportFilename()` (`dealer-ledger-export-filename.ts`)
  is hardcoded to `DEALER_LEDGER_REPORT_KEY` — it has no report-key
  parameter, so it cannot be reused as-is by any other report.
- `DealerLedgerTableComponent.exportFilename` (`dealer-ledger-table.component.ts`)
  calls this Dealer-Ledger-specific function directly.
- Six of the seven other reports (Warranty Reconciliation, Warranty
  Labour Tax Invoice, Warranty Cost Report, Parts Packing List, VOR
  Print, PQM — each has only a `*.config.ts` under
  `src/app/features/`) are genuine "Search parameters only"
  placeholders with no table/export UI at all yet, matching the
  screenshot's badges.
- **Goods Acknowledgement is not a placeholder** — it already has a
  real `GoodsAcknowledgementListComponent` using the shared
  `DataTableComponent` with export, per
  `goods-acknowledgement-list.component.html:26`. Its
  `GOODS_ACKNOWLEDGEMENT_REPORT_CONFIG` (`goods-acknowledgement.config.ts`)
  notes "no data source is wired up yet" (no mock/real rows), but the
  table/export UI itself is live — it currently gets the shared
  table's plain `tableId()`-based filename, with no report-key
  constant/generic-filename call of its own. This is a second real,
  if data-less, consumer worth being aware of, though wiring it to the
  new shared function is out of scope here (see Scope) since it has no
  confirmed report-key constant or context field to use yet.
- `DataTableComponent.exportFilename` (the shared table's own input,
  from the prior spec) is already generic — it's only the
  *construction* of that string that's Dealer-Ledger-specific today.

## Scope

- Move the filename-building logic out of
  `features/dealer-ledger/utils/dealer-ledger-export-filename.ts` into
  a shared, report-agnostic location (e.g.
  `shared/services/export/utils/report-export-filename.ts` or similar)
  as `buildReportExportFilename(reportKey: string, contextName: string | null, now?: Date): string`
  — identical logic, just parameterized by `reportKey` instead of a
  hardcoded constant.
- `DealerLedgerTableComponent` calls the shared function with
  `DEALER_LEDGER_REPORT_KEY` (unchanged output for Dealer Ledger
  itself — this is a refactor, not a behavior change for the one
  report that currently works end-to-end).
- Document (in code comments, and this spec) that any future report's
  table component should call the same shared function with its own
  report-key constant and whatever "name" field is analogous to
  Dealer Ledger's dealer name (or `null` if the report has no such
  single identifying entity) — no other report has an implementation
  to update today, so this is establishing the pattern for later use,
  not retrofitting eight report components that don't exist yet.
- Out of scope: building out any of the seven placeholder reports
  themselves (Goods Acknowledgement, Warranty Reconciliation, etc.) —
  not requested here; only the shared filename-building utility is
  generalized so it's ready when they are built.

## Requirements

1. A shared, report-agnostic `buildReportExportFilename(reportKey, contextName, now?)`
   function exists, producing
   `{REPORT_KEY}_{contextName?}_{dd-mm-yyyy-h:mm-a.m./p.m.}-report`
   (contextName segment omitted when absent, per the existing Dealer
   Ledger behavior).
2. Dealer Ledger's export filename is unchanged in output — it now
   calls the shared function with `DEALER_LEDGER_REPORT_KEY` instead of
   duplicating the logic.
3. The shared function has no Dealer-Ledger-specific naming/imports
   left in it (no `DEALER_LEDGER_REPORT_KEY` reference inside the
   shared utility itself — that constant stays a Dealer-Ledger-owned
   import at the call site).
4. No functional change to any currently-working export flow.

## Acceptance criteria

- A unit test on the shared function confirms
  `buildReportExportFilename('WARRANTY_COST', 'Some Dealer', <fixed date>)`
  produces `WARRANTY_COST_Some Dealer_{timestamp}-report` — proving the
  report-key is no longer hardcoded to Dealer Ledger.
- Dealer Ledger's existing `dealer-ledger-export-filename.spec.ts`
  assertions (or their equivalents, moved/adapted) continue to pass
  unchanged in output for `DEALER_LEDGER_REPORT_KEY`.
- `dealer-ledger-table.component.spec.ts`'s existing export-filename
  test continues to pass unchanged.

## Open decisions

- Exact shared-location path/module name for the generalized function
  — default assumption:
  `src/app/shared/services/export/utils/report-export-filename.ts`,
  alongside the existing `shared/services/export/` folder (models,
  `ExportService`) rather than under any one report's `features/`
  folder, since it's now genuinely report-agnostic.
- Whether to delete `dealer-ledger-export-filename.ts` entirely (Dealer
  Ledger becomes a thin call to the shared function plus its own
  report-key constant) or keep a thin Dealer-Ledger-specific wrapper
  function for readability at call sites — default assumption: delete
  it, and have `DealerLedgerTableComponent` call
  `buildReportExportFilename(DEALER_LEDGER_REPORT_KEY, this.dealerName())`
  directly, since a one-line wrapper adds no value once the underlying
  logic is shared.
