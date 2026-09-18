# Dealer Ledger — Spec: Databricks Fetch `limit` Fixed at 5000

**Created:** 2026-09-18 11:34 IST

## Status

Implemented.

## Purpose

`DealerLedgerService.toDatabricksParams()` sent `limit=request.pageSize` to
the real `fetchDatabricksdata` endpoint — tying the API's row cap to the
table's own client-side page size (`DEALER_LEDGER_DEFAULT_PAGE_SIZE = 10`).
Since this API is not paginated (one request should return the full
matching result set, which the table then paginates client-side, per
api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md), a `limit=10`
was silently truncating results to 10 rows regardless of how many actually
matched the filters.

## Requirements

1. `DealerLedgerService` sends a fixed `limit=5000` (`DATABRICKS_FETCH_LIMIT`
   constant) on every `fetchDatabricksdata` call, independent of the table's
   page size.
2. This is the only endpoint in the app that currently sends a `limit`
   parameter — Parts Packing List's `fetchDatabricksdata` (POST body) and
   Warranty Cost/Warranty Reconciliation (generic `paging.pageSize`) are
   unaffected; grepped the codebase to confirm no other `'limit'` usage
   exists before scoping this change to Dealer Ledger only.

## Acceptance criteria

- Every `GET fetchDatabricksdata` request includes `limit=5000`, regardless
  of the table's current page size setting.
- `dealer-ledger.service.spec.ts` asserts `limit` is `'5000'`.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

None — straightforward decoupling of an API-level fetch cap from an
unrelated UI setting it was accidentally wired to.
