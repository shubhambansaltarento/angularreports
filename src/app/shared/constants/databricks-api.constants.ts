/**
 * Shared constant for every report's real, Databricks-backed data endpoint (Dealer Ledger's
 * `fetchDealerLedgerFromBricks`, and any future report following the same pattern, e.g.
 * Parts Packing List's `fetchDatabricksdata`). These APIs are not paginated — one request
 * should return the full matching result set, which the table then paginates client-side
 * (api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md) — so every such call sends
 * the same fixed, high `limit`, independent of any report's own UI page size, per
 * databricks-fetch-limit-shared-constant-and-endpoint-rename-18-09-2026-*.md.
 */
export const DATABRICKS_FETCH_LIMIT = 5000;
