/**
 * Aggregate totals across the full filtered result set (not just the current page) —
 * confirmed real shape, data-mapping-fixes-from-real-rows-17-09-2026-08_02_AM.md. No
 * derived field (e.g. a Dealer-Ledger-style closing balance) — these three sums have no
 * established combined meaning for Warranty Cost.
 */
export interface WarrantyCostSummary {
  totalLaborCost: number;
  totalPartCost: number;
  totalCost: number;
}
