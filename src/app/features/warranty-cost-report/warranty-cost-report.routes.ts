import { Routes } from '@angular/router';
import { WarrantyCostService } from './services/warranty-cost.service';
import { WarrantyCostStore } from './store/warranty-cost.store';

/**
 * Lazy-loaded route table for the Warranty Cost Report feature — mirrors Dealer Ledger's
 * routing pattern, per
 * api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md.
 */
export const WARRANTY_COST_REPORT_ROUTES: Routes = [
  {
    path: '',
    providers: [WarrantyCostStore, WarrantyCostService],
    loadComponent: () =>
      import('./pages/warranty-cost-report-list/warranty-cost-report-list.component').then(
        (m) => m.WarrantyCostReportListComponent,
      ),
  },
];
