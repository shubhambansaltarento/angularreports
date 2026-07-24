/**
 * Aggregated summary for the current Dealer Ledger result set, per the shared
 * Aggregation contract used identically by Table grouping and Pivot value fields
 * (Enterprise Reporting Engine Specification §5.10).
 *
 * TODO: Confirm which aggregations are actually required for this feature.
 */
export interface DealerLedgerSummary {
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  entryCount: number;
}
