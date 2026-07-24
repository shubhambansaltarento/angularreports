import { Routes } from '@angular/router';
import { DEALER_LEDGER_FEATURE_PATH } from './features/dealer-ledger/constants/dealer-ledger.constants';

export const routes: Routes = [
  // No dashboard/home page exists yet — Dealer Ledger is the only feature built so far,
  // so the root path redirects straight to it rather than dead-ending.
  { path: '', redirectTo: DEALER_LEDGER_FEATURE_PATH, pathMatch: 'full' },
  {
    path: DEALER_LEDGER_FEATURE_PATH,
    loadChildren: () =>
      import('./features/dealer-ledger/dealer-ledger.routes').then((m) => m.DEALER_LEDGER_ROUTES),
  },
  // TODO: add remaining top-level routes (dashboard, administration, error routes, etc.)
  // per the approved Routing Architecture Specification.
];
