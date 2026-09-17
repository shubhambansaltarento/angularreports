/**
 * Filter criteria for Warranty Cost Report: Dealer Code and a Claim Date range — no
 * Company Code (silently defaulted, not user-editable, per the reference SAP form) and no
 * report-specific parameters beyond the common ones Dealer Ledger also has.
 */
export interface WarrantyCostFilters {
  dealerCode?: string;
  dealerDescription?: string;
  dateFrom?: string; // ISO 8601 date — maps onto the API's `claimDate.from`
  dateTo?: string; // ISO 8601 date — maps onto the API's `claimDate.to`
}
