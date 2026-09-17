import { WarrantyCostFilters } from './warranty-cost-filters.model';
import { Sort } from './sort.model';

/** Internal request shape for fetching Warranty Cost Report data, mirroring `DealerLedgerRequest`. */
export interface WarrantyCostRequest {
  page: number;
  pageSize: number;
  sort: Sort[];
  filters: WarrantyCostFilters;
}
