import { Routes } from '@angular/router';
import { WarrantyReconciliationService } from './services/warranty-reconciliation.service';
import { WarrantyReconciliationStore } from './store/warranty-reconciliation.store';

/**
 * Lazy-loaded route table for the Warranty Reconciliation feature — mirrors Warranty Cost
 * Report's routing pattern, per api-integration-17-09-2026-08_37_AM.md.
 */
export const WARRANTY_RECONCILIATION_ROUTES: Routes = [
  {
    path: '',
    providers: [WarrantyReconciliationStore, WarrantyReconciliationService],
    loadComponent: () =>
      import('./pages/warranty-reconciliation-list/warranty-reconciliation-list.component').then(
        (m) => m.WarrantyReconciliationListComponent,
      ),
  },
];
