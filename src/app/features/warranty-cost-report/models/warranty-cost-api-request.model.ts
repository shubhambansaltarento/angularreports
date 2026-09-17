/**
 * Exact request body contract required by `POST reports/WARRANTY_COST/data`, confirmed via
 * direct API testing — api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md.
 * `companyCode` is required by the backend even though it isn't shown as an editable field
 * on screen (per the reference SAP form) — it's silently defaulted from config and always
 * sent.
 */
export interface WarrantyCostApiRequestParameters {
  dealerCode?: string;
  companyCode: string;
  claimDate: { from: string; to: string };
}

export interface WarrantyCostApiRequestSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface WarrantyCostApiRequestPaging {
  page: number;
  pageSize: number;
}

export interface WarrantyCostApiRequest {
  parameters: WarrantyCostApiRequestParameters;
  paging: WarrantyCostApiRequestPaging;
  sort: WarrantyCostApiRequestSort[];
  configVersion: string;
}
