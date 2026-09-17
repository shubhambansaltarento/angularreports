/**
 * Table-row view model for a single Warranty Reconciliation entry, per the real column set
 * confirmed live: Dealer Code, Dealer Name, and Reconciliation Date.
 *
 * Extends `Record<string, unknown>` to satisfy the generic, reusable Data Table's `T`
 * constraint (see `shared/ui/data-table`), matching every other report's row model.
 */
export interface WarrantyReconciliationRow extends Record<string, unknown> {
  dealerCode: string;
  dealerName: string;
  /** ISO 8601 date (normalized from the API's `DD-MM-YYYY` string) — see `toIsoDate()`. */
  reconciliationDate: string;
}
