import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DealerLedgerMockService } from './dealer-ledger-mock.service';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { DealerLedgerResponse } from '../models/dealer-ledger-response.model';

/**
 * Feature-level facade for the Dealer Ledger feature. Currently delegates to the mock
 * backend (DealerLedgerMockService).
 *
 * TODO: Replace the direct DealerLedgerMockService injection with an injected
 * DealerLedgerRepository DI token once a real HTTP-backed repository exists
 * (API Framework Specification §5.14) — this facade's own API will not need to change.
 */
@Injectable()
export class DealerLedgerService {
  private readonly repository = inject(DealerLedgerMockService);

  getEntries(request: DealerLedgerRequest): Observable<DealerLedgerResponse> {
    return this.repository.list(request);
  }
}
