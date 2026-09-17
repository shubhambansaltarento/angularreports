/**
 * Per-report configuration/catalog entry — per the Multi-Report Framework
 * Specification, each report supplies exactly one of these alongside its own
 * feature folder. Consumed by the Reports Home page (listing/navigation) and, for
 * reports with no table/data source wired up yet, by the route table directly
 * (`ReportSearchOnlyPageComponent` binds its `title`/`description` inputs from a
 * route's `data`, sourced from this config).
 */
export interface ReportConfig {
  /** Stable identifier — also used as the route path segment. */
  id: string;
  title: string;
  description: string;
  /** Root path for this report's route, relative to the app root (e.g. 'dealer-ledger'). */
  route: string;
  /** False until the report's table/data source has been built against confirmed source data. */
  hasTable: boolean;
  /**
   * True only once the report is wired to a real, confirmed-live `/config`+`/data` API
   * (not just scaffolded with a table/columns). Drives Reports Home's "Available Reports"
   * vs. "Reports in Progress" grouping — three-section-status-grouping-17-09-2026-09_10_AM.md.
   */
  apiIntegrated: boolean;
}
