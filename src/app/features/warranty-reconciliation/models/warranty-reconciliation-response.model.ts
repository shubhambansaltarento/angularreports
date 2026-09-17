import { WarrantyReconciliationEffectiveColumn } from './warranty-reconciliation-api-response.model';
import { WarrantyReconciliationRow } from './warranty-reconciliation-row.model';

/** Internal response shape, mirroring `WarrantyCostResponse` — no `summary`, since `totals` is always `{}`. */
export interface WarrantyReconciliationResponse {
  rows: WarrantyReconciliationRow[];
  totalCount: number;
  effectiveColumns?: WarrantyReconciliationEffectiveColumn[];
}
