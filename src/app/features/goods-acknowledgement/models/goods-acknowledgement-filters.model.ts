/**
 * Filter criteria for Goods Acknowledgement: the common search parameters shared by
 * every report (Dealer Code, Dealer Description, Company Code, Date Range), plus this
 * report's own two "scope" checkboxes — Vehicle and Spares.
 */
export interface GoodsAcknowledgementFilters {
  dealerCode?: string;
  dealerDescription?: string;
  companyCode?: string;
  dateFrom?: string; // ISO 8601 date
  dateTo?: string; // ISO 8601 date
  vehicle?: boolean;
  spares?: boolean;
}
