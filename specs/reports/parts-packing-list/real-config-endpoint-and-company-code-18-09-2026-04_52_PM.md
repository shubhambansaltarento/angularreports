# Parts Packing List — Spec: Real Config Endpoint + Company Code

**Created:** 2026-09-18 16:52 IST

## Status

Implemented (config side). **Blocked on backend**: the data endpoint is
currently returning `404` — see Acceptance criteria.

## Purpose

Corrects the same mistake made for Warranty Cost Report
(config-api-exists-and-dealer-code-is-zero-padded-18-09-2026-01_15_PM.md):
`parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md` assumed
no generic config endpoint existed for this report, based on testing the
wrong path (`GET /parts-packing-list/config`, a thinner shape with no
`context`/Company Code). The real, richer config is the same generic,
report-keyed endpoint every other report uses:
`GET {baseUrl}reports/PARTS_PACKING_LIST/config` — confirmed live,
returning `context.dealerCode: "10015"` /`context.dealerDescription`, and
a `companyCode` parameter with `defaultValue: "TSL"`, plus a `packingDate`
`DATE_RANGE` parameter.

## Requirements

1. `PartsPackingListService.getConfig()` now calls
   `ReportApiService.getConfig(PARTS_PACKING_LIST_REPORT_KEY)` instead of
   a direct `HttpClient` GET to the plain `/parts-packing-list/config`
   path.
2. `PartsPackingListConfig` gains a `context` field
   (`dealerCode`/`dealerDescription`), matching every other report's
   config shape.
3. `PartsPackingListService.getEntries()` gains a `companyCode` parameter,
   sent in the `fetch-data-bricks-data` POST body alongside `dealerCode`
   (now zero-padded with the same `00000` prefix as Dealer Ledger's
   `kunnr`/Warranty Cost's `dealerCode`) /`fromDate`/`toDate`.
4. `PartsPackingListStore.search()`/its internal `SearchRequest` gain a
   `companyCode` parameter, threaded through to the service call.
5. `PartsPackingListListComponent` fetches config on entry (as before) and
   now derives both `dealerCode` (from `config.context.dealerCode`,
   falling back to `DealerContextService`) and `companyCode` (from
   `config.parameters`' `companyCode` default) when calling
   `store.search()` — this report's own UI still shows neither field
   (unchanged from the original spec).

## Acceptance criteria

- The page fetches `GET reports/PARTS_PACKING_LIST/config` on entry.
- Every `fetch-data-bricks-data` request sends `dealerCode` zero-padded
  and `companyCode` from config.
- `parts-packing-list.service.spec.ts`/`parts-packing-list.store.spec.ts`
  updated for the new signatures. Full suite (`ng test`, 232/232) and
  `ng build` pass.
- **Confirmed via manual `curl` at implementation time**: the data
  endpoint itself (`POST /parts-packing-list/fetch-data-bricks-data`),
  both with the previously-working plain body and with the new padded
  `dealerCode`/`companyCode` body, currently returns `404` — a change on
  the backend side unrelated to this client-side fix (the config endpoint
  and other reports' data endpoints are unaffected and still return
  `200`). Real data will not load for this report until the backend
  restores this route; the app still falls back gracefully (existing
  error-handling shows the alert banner).

## Open decisions

- Whether the data endpoint's real request body actually expects the
  zero-padded `dealerCode`/`companyCode` shape (matching its sibling
  reports) cannot be confirmed until the `404` is resolved — implemented
  by inference from the established pattern across Dealer Ledger/Warranty
  Cost, to be re-verified once the endpoint is live again.
