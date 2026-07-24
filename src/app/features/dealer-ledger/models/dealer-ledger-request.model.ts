import { DealerLedgerFilters } from './dealer-ledger-filters.model';
import { Sort } from './sort.model';

/**
 * Request shape for fetching Dealer Ledger data — shape-compatible with the platform's
 * `DataSourcePort`/`DataRequest` contract (API Framework Specification §5.14, Enterprise
 * Data Table Specification §5.2), scoped to this feature.
 *
 * TODO: Wire into `DealerLedgerRepository.list()` once the Data layer/API is implemented.
 */
export interface DealerLedgerRequest {
  page: number;
  pageSize: number;
  sort: Sort[];
  filters: DealerLedgerFilters;
  search?: string;
}
