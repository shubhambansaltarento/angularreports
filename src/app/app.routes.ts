import { Routes } from '@angular/router';
import { DEALER_LEDGER_FEATURE_PATH } from './features/dealer-ledger/constants/dealer-ledger.constants';
import { GOODS_ACKNOWLEDGEMENT_FEATURE_PATH } from './features/goods-acknowledgement/goods-acknowledgement.config';
import { PARTS_PACKING_LIST_REPORT_CONFIG } from './features/parts-packing-list/parts-packing-list.config';
import { PQM_REPORT_CONFIG } from './features/pqm/pqm.config';
import { VOR_PRINT_REPORT_CONFIG } from './features/vor-print/vor-print.config';
import { WARRANTY_COST_REPORT_CONFIG } from './features/warranty-cost-report/warranty-cost-report.config';
import { WARRANTY_LABOUR_TAX_INVOICE_REPORT_CONFIG } from './features/warranty-labour-tax-invoice/warranty-labour-tax-invoice.config';
import { WARRANTY_RECONCILIATION_REPORT_CONFIG } from './features/warranty-reconciliation/warranty-reconciliation.config';
import { ReportConfig } from './shared/models/report-config.model';

/**
 * Reports whose table/data source is not yet confirmed — each renders the shared
 * `ReportSearchOnlyPageComponent` (search parameters only, per the Multi-Report
 * Framework Specification §6/§13), with that report's own config supplying the page's
 * title/description via route `data` (bound by `withComponentInputBinding()`, app.config.ts).
 *
 * Warranty Cost Report is NOT in this list — it has its own dedicated page/route matching
 * its real SAP reference form, per
 * warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md (still no table:
 * its data source remains unconfirmed, per `WARRANTY_COST_REPORT_CONFIG.hasTable`).
 */
const SEARCH_ONLY_REPORT_CONFIGS: ReportConfig[] = [
  WARRANTY_LABOUR_TAX_INVOICE_REPORT_CONFIG,
  PARTS_PACKING_LIST_REPORT_CONFIG,
  VOR_PRINT_REPORT_CONFIG,
  PQM_REPORT_CONFIG,
];

export const routes: Routes = [
  // Home/catalog page — also the entry point when this app is opened directly rather
  // than deep-linked into a single report (e.g. via iframe embed, per the Multi-Report
  // Framework Specification's iframe-integration requirement).
  {
    path: '',
    loadComponent: () =>
      import('./features/reports-home/reports-home.component').then((m) => m.ReportsHomeComponent),
  },
  {
    path: DEALER_LEDGER_FEATURE_PATH,
    loadChildren: () =>
      import('./features/dealer-ledger/dealer-ledger.routes').then((m) => m.DEALER_LEDGER_ROUTES),
  },
  {
    path: GOODS_ACKNOWLEDGEMENT_FEATURE_PATH,
    loadChildren: () =>
      import('./features/goods-acknowledgement/goods-acknowledgement.routes').then(
        (m) => m.GOODS_ACKNOWLEDGEMENT_ROUTES,
      ),
  },
  {
    path: WARRANTY_COST_REPORT_CONFIG.route,
    loadChildren: () =>
      import('./features/warranty-cost-report/warranty-cost-report.routes').then(
        (m) => m.WARRANTY_COST_REPORT_ROUTES,
      ),
  },
  {
    path: WARRANTY_RECONCILIATION_REPORT_CONFIG.route,
    loadChildren: () =>
      import('./features/warranty-reconciliation/warranty-reconciliation.routes').then(
        (m) => m.WARRANTY_RECONCILIATION_ROUTES,
      ),
  },
  ...SEARCH_ONLY_REPORT_CONFIGS.map((config) => ({
    path: config.route,
    loadComponent: () =>
      import('./shared/ui/report-search-only-page/report-search-only-page.component').then(
        (m) => m.ReportSearchOnlyPageComponent,
      ),
    data: { title: config.title, description: config.description },
  })),
  // TODO: add remaining top-level routes (dashboard, administration, error routes, etc.)
  // per the approved Routing Architecture Specification.
];
