import { DealerLedgerRow } from './dealer-ledger-row.model';
import { DealerLedgerSummary } from './dealer-ledger-summary.model';

/**
 * Response shape returned by the Dealer Ledger data source.
 *
 * TODO: Confirm the exact backend contract once the API is implemented; field names/shape
 * here follow the platform's `DataResult` convention (API Framework Specification §5.14).
 */
export interface DealerLedgerResponse {
  rows: DealerLedgerRow[];
  totalCount: number;
  summary: DealerLedgerSummary;
}
