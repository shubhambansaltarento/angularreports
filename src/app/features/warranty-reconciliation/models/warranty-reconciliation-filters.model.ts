/**
 * Filter criteria for Warranty Reconciliation: Dealer Code, and a mandatory Reconciliation
 * Date range — no Company Code (silently defaulted). Unlike Dealer Ledger/Warranty Cost
 * Report's optional, defaulted date range, this one is required with no default value —
 * add-date-range-ui-17-09-2026-09_05_AM.md.
 */
export interface WarrantyReconciliationFilters {
  dealerCode?: string;
  dealerDescription?: string;
  dateFrom?: string; // ISO 8601 date — maps onto the API's `reconciliationDate.from`
  dateTo?: string; // ISO 8601 date — maps onto the API's `reconciliationDate.to`
}
