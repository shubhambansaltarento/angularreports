# Dealer Ledger — Spec: Real `fetchDatabricksdata` API + Manual Test Button

**Created:** 2026-09-17 16:13 IST

## Status

Implemented.

## Purpose

Replace `DealerLedgerService.getEntries()`'s data source with the real,
Databricks-backed backend endpoint (`GET /dealer-ledger/fetchDatabricksdata`),
and add a small, temporary manual-test button on the Dealer Ledger list page
so the integration can be exercised from the UI without going through the
full filter form.

## API contract

- `GET http://localhost:8080/dealer-ledger/fetchDatabricksdata?bukrs={companyCode}&kunnr={dealerCode}&fromDate={date}&limit={n}`
- Response: a flat JSON array of rows (no pagination/summary/effectiveColumns
  wrapper), with snake_case fields, e.g. `dealer_code`, `dealer_name`,
  `doc_date`, `debit_amount`, `credit_amount`, `running_balance`.
- Distinct from the earlier `POST {baseUrl}reports/DEALER_LEDGER/data`
  contract (api-integration-16-09-2026-02_28_PM.md) — this endpoint is a
  plain `GET` with query params, not routed through `ReportApiService`.

## Requirements

1. `DealerLedgerService.getEntries()` calls `fetchDatabricksdata` directly via
   `HttpClient`, mapping the internal `DealerLedgerRequest`'s filters onto
   query params: `companyCode` → `bukrs`, `dealerCode` → `kunnr`, `dateFrom` →
   `fromDate`, `pageSize` → `limit`.
2. A new model, `DealerLedgerDatabricksRow`, types the raw snake_case response
   row shape. The service maps each row onto the existing internal
   `DealerLedgerRow`/`DealerLedgerResponse` shapes — no other layer
   (store/table/page) is aware of the raw shape.
3. On failure, `getEntries()` falls back to `DealerLedgerMockService.list()`,
   same as the previous contract.
4. The Dealer Ledger list page (`dealer-ledger-list.component.ts`) exposes a
   small, clearly-labeled "Fetch DealerLedge Databricks" button, separate from
   the Filter Panel's Submit button, that calls `DealerLedgerStore.search()`
   with parameters derived the same way the filter panel derives its
   defaults:
   - `bukrs` (companyCode): the config's `companyCode` parameter default.
   - `kunnr` (dealerCode): the config's `context.dealerCode`, zero-padded to
     the real `kunnr`'s 10-digit SAP shape by prefixing `00000` (e.g. config
     dealer code `10015` → `0000010015`).
   - `fromDate`: the start of the default 1-month Report Range
     (`defaultDateRange().dateFrom`).
5. This button is a manual/dev testing aid, not a permanent product feature —
   it is styled small (`.dealer-ledger-list__databricks-test-btn`) and sits
   below the filter panel.

## Acceptance criteria

- Clicking "Fetch DealerLedge Databricks" issues a `GET` to
  `http://localhost:8080/dealer-ledger/fetchDatabricksdata` with `bukrs`/
  `kunnr`/`fromDate`/`limit` derived from config, visible in the Network tab,
  and the table renders the mapped rows.
- `dealer-ledger.service.spec.ts` verifies the query params sent, the
  row-mapping, distinct row ids, and the mock fallback on error — via
  `HttpTestingController`, not a `ReportApiService` spy.
- `dealer-ledger-list.component.spec.ts` verifies the button renders with the
  exact label, and that clicking it derives `bukrs`/`kunnr`/`fromDate`
  correctly from config (and falls back to empty/zero-padded values before
  config loads).
- Full suite (`ng test`) and `ng build` both pass.

## Open decisions

- Whether the manual-test button should be removed once the real filter
  panel's Submit button is confirmed to exercise the same endpoint
  end-to-end, or kept longer-term as a quick dev/QA shortcut — TBD.
