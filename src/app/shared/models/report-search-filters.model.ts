/**
 * The common search parameters shared by every report on the platform (Multi-Report
 * Framework Specification §6): Dealer Code, Dealer Description, Company Code, and a
 * Date Range. Rendered by the shared `ReportSearchBarComponent` and reused as-is by
 * every report feature — report-specific parameters (e.g. Dealer Ledger's checkbox
 * group) are additive, defined by each report, never folded into this shape.
 */
export interface CommonReportSearchFilters {
  dealerCode: string | null;
  dealerDescription: string | null;
  companyCode: string | null;
  dateFrom: string | null; // ISO 8601 date
  dateTo: string | null; // ISO 8601 date
}
