/** Filter criteria for Warranty Cost Report — Dealer Code and a Date Range, sent verbatim as the API's request body. */
export interface WarrantyCostFilters {
  dealerCode?: string;
  dealerDescription?: string;
  companyCode?: string;
  dateFrom?: string; // ISO 8601 date — maps onto the API's `fromDate`
  dateTo?: string; // ISO 8601 date — maps onto the API's `toDate`
}
