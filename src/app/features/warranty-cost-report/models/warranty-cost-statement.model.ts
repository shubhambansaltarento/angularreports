import { WarrantyCostRow } from './warranty-cost-row.model';
import { WarrantyCostSummary } from './warranty-cost-summary.model';

/** One dealer's group within the statement — its identity row, line items, and per-dealer totals (the reference PDF's "DEALER: ..." row + its own totals row). */
export interface WarrantyCostDealerGroup {
  dealerCode: string;
  dealerName: string;
  rows: WarrantyCostRow[];
  summary: WarrantyCostSummary;
}

/** The full statement — one or more dealer groups plus the grand-total summary block. */
export interface WarrantyCostStatement {
  dealerGroups: WarrantyCostDealerGroup[];
  grandTotal: WarrantyCostSummary;
}
