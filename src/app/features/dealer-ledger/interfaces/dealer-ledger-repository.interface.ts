import { Observable } from 'rxjs';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { DealerLedgerResponse } from '../models/dealer-ledger-response.model';
import { DealerLedgerRow } from '../models/dealer-ledger-row.model';

/**
 * Port contract for Dealer Ledger data access, per the Generic Repository / DataSourcePort
 * pattern (API Framework Specification §5.14, Enterprise Data Table Specification §5.2).
 *
 * Returns Observables (not Promises) so the mock backend (DealerLedgerMockService) and any
 * future HTTP-backed implementation share one contract shape without adapter glue.
 */
export interface DealerLedgerRepository {
  getById(id: string): Observable<DealerLedgerRow>;
  list(request: DealerLedgerRequest): Observable<DealerLedgerResponse>;
}

// TODO: export const DEALER_LEDGER_REPOSITORY_TOKEN = new InjectionToken<DealerLedgerRepository>('DealerLedgerRepository');
