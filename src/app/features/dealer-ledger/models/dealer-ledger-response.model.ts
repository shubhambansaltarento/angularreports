import { DealerLedgerEffectiveColumn } from './dealer-ledger-api-response.model';
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
  /**
   * The backend's ordered list of applicable columns for this request, each with an
   * `isDefault` visibility flag — drives the table's column structure
   * (effective-columns-drive-table-headers-16-09-2026-03_59_PM.md,
   * effective-columns-shape-change-17-09-2026-05_41_AM.md). Optional: the mock backend has
   * no such concept, so the table falls back to its own hardcoded default column set when
   * this is absent.
   */
  effectiveColumns?: DealerLedgerEffectiveColumn[];
}
