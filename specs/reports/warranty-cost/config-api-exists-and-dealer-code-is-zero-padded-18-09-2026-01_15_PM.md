# Warranty Cost Report — Spec: Config API Exists; `dealerCode` Is Zero-Padded

**Created:** 2026-09-18 13:15 IST

## Status

Implemented.

## Purpose

Corrects two mistaken findings from
html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md:

1. That spec claimed `GET /warranty-cost/config` returning `404` meant "no
   config endpoint exists for this report". That was testing the wrong
   path — the real config endpoint is the same generic, report-keyed one
   every other report uses: `GET {baseUrl}reports/WARRANTY_COST/config`
   (confirmed live, via `ReportApiService`), returning
   `context.dealerCode`/`context.dealerDescription` and a `companyCode`
   parameter with `defaultValue: "TSL"`.
2. That spec also claimed the data endpoint's `dealerCode` request field
   is sent **unpadded** (e.g. `"10015"`). Retesting found the opposite:
   `fetch-data-bricks-data` returns real rows only when `dealerCode` is
   zero-padded to the 10-digit shape (`"0000010015"`) — identical to
   Dealer Ledger's `kunnr` convention. The original "unpadded works" belief
   came from an earlier test that (unnoticed) also used the padded value.

## Requirements

1. `WarrantyCostService.getConfig()` is (re-)added, calling
   `ReportApiService.getConfig(WARRANTY_COST_REPORT_KEY)` — same pattern as
   Dealer Ledger/Warranty Reconciliation.
2. `WarrantyCostService.getEntries()` zero-pads `dealerCode` with the same
   `00000` prefix Dealer Ledger uses, and now also sends `companyCode` in
   the `fetch-data-bricks-data` request body (confirmed the backend
   accepts/expects it alongside `dealerCode`/`fromDate`/`toDate`).
3. `WarrantyCostFilters` gains a `companyCode` field.
4. `WarrantyCostReportFilterComponent` becomes config-aware again: Dealer
   Code/Description render read-only (`readonlyDealerFields`), sourced
   from `config.context`, falling back to `DealerContextService`; Company
   Code is silently defaulted from `config.parameters` (never rendered,
   `showCompanyCode="false"`) and included in the emitted `searched` value.
5. `WarrantyCostReportListComponent` fetches config once on entry (same
   `takeUntilDestroyed()` pattern as every other report) and passes it to
   the filter panel.

## Acceptance criteria

- The page fetches `GET reports/WARRANTY_COST/config` on entry.
- Every `fetch-data-bricks-data` request sends `dealerCode` zero-padded
  (`config.context.dealerCode` prefixed with `00000`) and `companyCode`
  from config's `companyCode` parameter default.
- Confirmed live via `curl`: config returns `context.dealerCode: "10015"`;
  the data endpoint returns real rows for `dealerCode: "0000010015"`,
  `companyCode: "TSL"`.
- `warranty-cost.service.spec.ts`/`warranty-cost-report-filter.component.spec.ts`/
  `warranty-cost-report-list.component.spec.ts` updated accordingly; full
  suite (`ng test`, 225/225) and `ng build` pass.

## Open decisions

None — this is a factual correction of two earlier, disproven assumptions,
not a new design decision.
