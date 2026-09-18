# All Reports — Spec: Shared Databricks Fetch Limit Lowered to 2000

**Created:** 2026-09-18 16:03 IST

## Status

Implemented.

## Purpose

Lower the shared `DATABRICKS_FETCH_LIMIT` constant
(databricks-fetch-limit-shared-constant-and-endpoint-rename-18-09-2026-11_40_AM.md)
from `5000` to `2000`, per direct request. This constant is documented and
reused by any report's Databricks-backed data endpoint — currently only
Dealer Ledger actually sends a `limit` parameter (confirmed via grep across
`src/app`); Parts Packing List/Warranty Cost Report don't send one at all,
so this change only affects Dealer Ledger's real behavior today, but keeps
the shared constant ready for any future report that adopts the same
`limit` pattern.

## Requirements

1. `DATABRICKS_FETCH_LIMIT` in
   `shared/constants/databricks-api.constants.ts` changes from `5000` to
   `2000`.
2. No other change — `DealerLedgerService` already imports this constant,
   so no call-site change is needed.

## Acceptance criteria

- Every Dealer Ledger `fetchDatabricksdata`/`fetch-data-bricks-data`
  request sends `limit=2000`.
- `dealer-ledger.service.spec.ts` asserts `'2000'`.
- Full suite (`ng test`, 232/232) and `ng build` pass.

## Open decisions

None.
