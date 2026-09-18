# Dealer Ledger — Spec: Shared `DATABRICKS_FETCH_LIMIT` Constant + Endpoint Rename

**Created:** 2026-09-18 11:40 IST

## Status

Implemented (client-side). **Blocked on backend**: the renamed endpoint does
not yet exist on the local backend — see Acceptance criteria.

## Purpose

Two follow-ups to
databricks-fetch-limit-fixed-at-5000-18-09-2026-11_34_AM.md:

1. `DATABRICKS_FETCH_LIMIT` was a private constant inside
   `dealer-ledger.service.ts`. Any future report calling its own
   Databricks-backed `fetchDatabricksdata`-style endpoint (e.g. Parts
   Packing List, if it later adds a `limit`) should use the exact same
   fixed cap — so it is promoted to a shared constant, reusable across
   every report's service.
2. Dealer Ledger's real data endpoint is renamed from `fetchDatabricksdata`
   to `fetchDealerLedgerFromBricks` (client-side only — see below).

## Requirements

1. New shared constant: `src/app/shared/constants/databricks-api.constants.ts`
   exports `DATABRICKS_FETCH_LIMIT = 5000`, documented as reusable by any
   report's Databricks-backed data endpoint.
2. `DealerLedgerService` imports this shared constant instead of its own
   private one.
3. `DealerLedgerService`'s `DEALER_LEDGER_DATABRICKS_URL` is renamed from
   `http://localhost:8080/dealer-ledger/fetchDatabricksdata` to
   `http://localhost:8080/dealer-ledger/fetchDealerLedgerFromBricks`.
4. `dealer-ledger.service.spec.ts` updated to assert against the renamed
   URL.

## Acceptance criteria

- `dealer-ledger.service.ts` sends every Databricks request to
  `.../fetchDealerLedgerFromBricks`, using `DATABRICKS_FETCH_LIMIT` imported
  from the new shared constants file.
- Full suite (`ng test`, 217/217) and `ng build` pass.
- **Confirmed via manual `curl` against the local backend at implementation
  time**: `.../fetchDealerLedgerFromBricks` returns `404` — the backend has
  not yet added this route (the old `.../fetchDatabricksdata` path still
  returns `200`). Until the backend adds the renamed route, the app's real
  call will 404 and `DealerLedgerService.getEntries()` will silently fall
  back to `DealerLedgerMockService` (existing error-handling behavior, not a
  new bug) — real Dealer Ledger data will not load from the live backend
  until this is resolved on the backend side.

## Open decisions

- Whether Parts Packing List's `fetchDatabricksdata` endpoint should also be
  renamed to a report-specific name (e.g. `fetchPartsPackingListFromBricks`)
  for naming consistency, and/or start sending
  `limit=DATABRICKS_FETCH_LIMIT` — not requested yet; left unchanged.
- Backend-side rename of `fetchDatabricksdata` -> `fetchDealerLedgerFromBricks`
  is outside this repo's scope — flagged as a blocker for real data to load
  until done.
