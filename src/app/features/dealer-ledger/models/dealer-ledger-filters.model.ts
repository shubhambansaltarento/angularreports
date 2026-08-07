/**
 * Filter criteria for the Dealer Ledger feature: the common search parameters shared by
 * every report on the platform (Dealer Code, Dealer Description, Company Code, Date
 * Range — Multi-Report Framework Specification §6), plus Dealer Ledger's own
 * report-specific parameter — a group of "include details" checkboxes (OE/SP/AC/EV/
 * ACWSH) that scope which supplementary detail sets are included in the result.
 */
export interface DealerLedgerFilters {
  dealerCode?: string;
  dealerDescription?: string;
  companyCode?: string;
  dateFrom?: string; // ISO 8601 date
  dateTo?: string; // ISO 8601 date
  withOeDetails?: boolean;
  withSpDetails?: boolean;
  withAcDetails?: boolean;
  withEvDetails?: boolean;
  withAcwshDetails?: boolean;
}
