/**
 * Real response shape returned by `POST reports/WARRANTY_COST/data`, confirmed via direct
 * API testing. Re-confirmed 2026-09-17 08:14 AM: the backend's column schema changed from
 * claim/part/cost fields to `orderDate`/`quantity` —
 * column-schema-changed-to-order-date-quantity-17-09-2026-08_14_AM.md (supersedes the
 * earlier claim-details shape from api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md).
 * Each row only carries whatever fields the backend actually populated for it, so every
 * field is optional, mirroring Dealer Ledger's own response-row convention.
 */
export interface WarrantyCostApiResponseRow {
  dealerCode?: string;
  dealerName?: string;
  orderDate?: string;
  quantity?: number;
}

/**
 * One entry in the response's `effectiveColumns` — has both `isDefault` (Dealer Ledger's
 * existing flag) and a new `isVisible` flag not seen on Dealer Ledger's responses. Both
 * are `true` for every column observed so far; `isVisible: false`'s exact meaning (assumed:
 * "never show, not even in the picker") is unconfirmed until a real response demonstrates
 * it — api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md.
 */
export interface WarrantyCostEffectiveColumn {
  columnName: string;
  isDefault: boolean;
  isVisible: boolean;
}

export interface WarrantyCostApiResponsePaging {
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

/**
 * Real shape confirmed against a response with actual rows —
 * data-mapping-fixes-from-real-rows-17-09-2026-08_02_AM.md (an earlier, zero-row test
 * only ever observed `{}`; all three sums are present once rows exist).
 */
export interface WarrantyCostApiResponseTotals {
  laborCost?: number;
  partCost?: number;
  totalCost?: number;
}

export interface WarrantyCostApiResponse {
  reportCode: string;
  configVersion: string;
  effectiveColumns: WarrantyCostEffectiveColumn[];
  rows: WarrantyCostApiResponseRow[];
  totals: WarrantyCostApiResponseTotals;
  paging: WarrantyCostApiResponsePaging;
  meta: { generatedAt: string; dataAsOf: string; queryMs: number };
}
