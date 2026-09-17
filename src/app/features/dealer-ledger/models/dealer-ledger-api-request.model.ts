/**
 * Exact request body contract required by `POST reports/DEALER_LEDGER/data`
 * (data-api-request-contract-16-09-2026-02_48_PM.md, updated by backend-adds-checkbox-support-16-09-2026-05_24_PM.md)
 * — distinct from the app's internal `DealerLedgerRequest` (page/pageSize/sort/filters/
 * search), which is mapped onto this shape by `DealerLedgerService.getEntries()` before
 * the call is made.
 */
export interface DealerLedgerApiRequestParameters {
  /** Now a declared config parameter — sent inside `parameters`, per backend-adds-checkbox-support-16-09-2026-05_24_PM. */
  dealerCode?: string;
  companyCode: string;
  postingDate: { from: string; to: string };
  /**
   * The five "Include Details" checkboxes — the backend now accepts all five (confirmed
   * via direct API testing, backend-adds-checkbox-support-16-09-2026-05_24_PM), each revealing its own Ref No column when `true`
   * (per effective-columns-drive-table-headers-16-09-2026-03_59_PM's `effectiveColumns`-driven table columns). Always sent, never omitted.
   */
  withOeDetails: boolean;
  withSpDetails: boolean;
  withAcDetails: boolean;
  withEvDetails: boolean;
  withAcwshDetails: boolean;
}

export interface DealerLedgerApiRequestSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface DealerLedgerApiRequestPaging {
  page: number;
  pageSize: number;
}

export interface DealerLedgerApiRequest {
  parameters: DealerLedgerApiRequestParameters;
  paging: DealerLedgerApiRequestPaging;
  sort: DealerLedgerApiRequestSort[];
  configVersion: string;
}
