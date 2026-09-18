# Dealer Ledger + Parts Packing List — Spec: Both Databricks Endpoints Renamed to `fetch-data-bricks-data`

**Created:** 2026-09-18 11:52 IST

## Status

Implemented.

## Purpose

The backend has standardized both of its Databricks-backed data endpoints
onto one consistent kebab-case path segment, `fetch-data-bricks-data`,
superseding the previous per-report names (Dealer Ledger's
`fetchDatabricksdata`, briefly renamed client-side to the never-shipped
`fetchDealerLedgerFromBricks` in
databricks-fetch-limit-shared-constant-and-endpoint-rename-18-09-2026-11_40_AM.md
and left unresolved pending backend confirmation; Parts Packing List's
`fetchDatabricksdata`). Confirmed live via manual `curl` against the local
backend at implementation time.

Currently only two Databricks-backed endpoints exist in the codebase:

- Dealer Ledger: `GET /dealer-ledger/fetch-data-bricks-data`
- Parts Packing List: `GET /parts-packing-list/config` and
  `POST /parts-packing-list/fetch-data-bricks-data`

## API contract (confirmed live)

- Dealer Ledger:
  ```
  curl "http://localhost:8080/dealer-ledger/fetch-data-bricks-data?bukrs=TSL&kunnr=0000010015&fromDate=2026-08-18&limit=100"
  ```
- Parts Packing List:
  ```
  curl -X POST "http://localhost:8080/parts-packing-list/fetch-data-bricks-data" \
    -H "Content-Type: application/json" \
    -d '{"dealerCode":"1","fromDate":"2026-01-01","toDate":"2026-01-31"}'
  ```
- Request/response shapes (query params, JSON body, row fields) are
  otherwise unchanged from their previously-confirmed contracts — only the
  final path segment changes.

## Requirements

1. `DealerLedgerService`'s `DEALER_LEDGER_DATABRICKS_URL` becomes
   `http://localhost:8080/dealer-ledger/fetch-data-bricks-data` (superseding
   both the original `fetchDatabricksdata` and the never-live
   `fetchDealerLedgerFromBricks`).
2. `PartsPackingListService`'s `PARTS_PACKING_LIST_DATA_URL` becomes
   `http://localhost:8080/parts-packing-list/fetch-data-bricks-data`
   (`PARTS_PACKING_LIST_CONFIG_URL` is unchanged — the config endpoint's
   path was not renamed).
3. Both services' specs (`dealer-ledger.service.spec.ts`,
   `parts-packing-list.service.spec.ts`) are updated to assert against the
   new URLs.

## Acceptance criteria

- Every real Dealer Ledger data call hits
  `.../dealer-ledger/fetch-data-bricks-data`.
- Every real Parts Packing List data call hits
  `.../parts-packing-list/fetch-data-bricks-data`; its config call is
  unaffected (`.../parts-packing-list/config`).
- Both endpoints confirmed live (`200`) via `curl` before/at implementation
  time.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

None — this supersedes the unresolved rename in
databricks-fetch-limit-shared-constant-and-endpoint-rename-18-09-2026-11_40_AM.md;
that spec's "blocked on backend" note is now resolved by this one.
