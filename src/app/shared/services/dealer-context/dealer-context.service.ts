import { Injectable, signal } from '@angular/core';
import { DealerContext } from './dealer-context.model';

/**
 * TODO: Replace with a real call to the platform's auth API once it exists — this is a
 * fixed mock standing in for the dealer identity/context that API will eventually return
 * (dealer name, dealer description, company name), per the Multi-Report Framework
 * Specification's assumption that dealer details are auth-API-sourced.
 */
const MOCK_DEALER_CONTEXT: DealerContext = {
  dealerCode: 'DLR-001',
  dealerName: 'Northgate Motors',
  dealerDescription: 'Northgate Motors — Authorized Dealer',
  companyCode: 'CO-10',
  companyName: 'Acme Motors Pvt. Ltd.',
};

/**
 * Provides the current dealer's identity/context to every report, so each report's
 * common search parameters (Dealer Code, Dealer Description, Company Code) can be
 * prefilled consistently rather than each report re-deriving them independently.
 *
 * Root-provided as a pragmatic stand-in for the not-yet-built SessionContext/auth layer
 * (Authentication Architecture Specification) — this service has no session lifecycle,
 * token handling, or RBAC concerns of its own; it exists solely to mock the one shape
 * (`DealerContext`) reports need until the real auth API is wired up.
 */
@Injectable({ providedIn: 'root' })
export class DealerContextService {
  private readonly _dealerContext = signal<DealerContext>(MOCK_DEALER_CONTEXT);

  readonly dealerContext = this._dealerContext.asReadonly();
}
