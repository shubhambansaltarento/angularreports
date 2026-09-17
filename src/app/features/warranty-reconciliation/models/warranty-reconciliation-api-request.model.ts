/**
 * Exact request body contract required by `POST reports/WARRANTY_RECONCILLATION/data`,
 * confirmed via direct API testing — add-date-range-ui-17-09-2026-09_05_AM.md.
 * `reconciliationDate` is sent as a **nested** `{ from, to }` object — not flat
 * `dateFrom`/`dateTo` sibling keys like Dealer Ledger/Warranty Cost Report use.
 */
export interface WarrantyReconciliationApiRequestParameters {
  dealerCode?: string;
  companyCode: string;
  reconciliationDate: { from: string; to: string };
}

export interface WarrantyReconciliationApiRequestSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface WarrantyReconciliationApiRequestPaging {
  page: number;
  pageSize: number;
}

export interface WarrantyReconciliationApiRequest {
  parameters: WarrantyReconciliationApiRequestParameters;
  paging: WarrantyReconciliationApiRequestPaging;
  sort: WarrantyReconciliationApiRequestSort[];
  configVersion: string;
}
