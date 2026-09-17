import { WarrantyCostEffectiveColumn } from './warranty-cost-api-response.model';
import { WarrantyCostRow } from './warranty-cost-row.model';
import { WarrantyCostSummary } from './warranty-cost-summary.model';

/** Internal response shape, mirroring `DealerLedgerResponse`. */
export interface WarrantyCostResponse {
  rows: WarrantyCostRow[];
  totalCount: number;
  summary: WarrantyCostSummary;
  effectiveColumns?: WarrantyCostEffectiveColumn[];
}
