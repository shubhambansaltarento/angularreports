import { DealerLedgerStatus, DealerLedgerTransactionType } from './dealer-ledger-row.model';

/**
 * Column-level filter criteria for the Dealer Ledger feature — distinct from the
 * request-level global `search` term (Enterprise Data Table Specification §7.2's
 * "Column Filters" vs. "Global Search" distinction; global search lives on
 * `DealerLedgerRequest`, not here).
 */
export interface DealerLedgerFilters {
  dealerCode?: string;
  branch?: string;
  state?: string;
  city?: string;
  status?: DealerLedgerStatus;
  transactionType?: DealerLedgerTransactionType;
  dateFrom?: string; // ISO 8601 date
  dateTo?: string; // ISO 8601 date
}
