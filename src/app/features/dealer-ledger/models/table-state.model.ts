import { DealerLedgerColumn } from './dealer-ledger-column.model';
import { Pagination } from './pagination.model';
import { Sort } from './sort.model';

/**
 * Full, persistable table configuration for the Dealer Ledger table — analogous to the
 * Enterprise Data Table Specification's `TableView` (§9): columns + sort + pagination as
 * one atomic unit, so switching/restoring a saved configuration is a single state
 * transition rather than incremental field-by-field patching.
 *
 * TODO: Wire into a `TableViewPreferencesPort`-equivalent once persistence is implemented.
 */
export interface TableState {
  columns: DealerLedgerColumn[];
  sort: Sort[];
  pagination: Pagination;
}
