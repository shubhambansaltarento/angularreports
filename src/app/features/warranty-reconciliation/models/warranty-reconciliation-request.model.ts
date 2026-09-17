import { WarrantyReconciliationFilters } from './warranty-reconciliation-filters.model';
import { Sort } from './sort.model';

/** Internal request shape for fetching Warranty Reconciliation data, mirroring `WarrantyCostRequest`. */
export interface WarrantyReconciliationRequest {
  page: number;
  pageSize: number;
  sort: Sort[];
  filters: WarrantyReconciliationFilters;
}
