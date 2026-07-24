import { Routes } from '@angular/router';
import { DealerLedgerStore } from './store/dealer-ledger.store';
import { DealerLedgerService } from './services/dealer-ledger.service';
import { DealerLedgerMockService } from './services/dealer-ledger-mock.service';

/**
 * Lazy-loaded route table for the Dealer Ledger feature.
 *
 * DealerLedgerStore/DealerLedgerService are provided on the parent (empty-path) route so
 * their state is shared across the list and detail pages but does not leak beyond this
 * feature (per the approved Signal Store Architecture Specification's provider-scope guidance).
 *
 * TODO: Add authGuard / roleGuard per the approved Routing Architecture Specification once
 * the RBAC permission keys for this feature are defined.
 */
export const DEALER_LEDGER_ROUTES: Routes = [
  {
    path: '',
    providers: [DealerLedgerStore, DealerLedgerService, DealerLedgerMockService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dealer-ledger-list/dealer-ledger-list.component').then(
            (m) => m.DealerLedgerListComponent,
          ),
      },
      {
        path: ':dealerCode',
        loadComponent: () =>
          import('./pages/dealer-ledger-detail/dealer-ledger-detail.component').then(
            (m) => m.DealerLedgerDetailComponent,
          ),
      },
      // TODO: add error-route children (404/Forbidden) once the shared error-state component exists
    ],
  },
];
