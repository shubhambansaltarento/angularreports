import { ReportConfig } from '../../shared/models/report-config.model';
import { DEALER_LEDGER_REPORT_CONFIG } from '../dealer-ledger/dealer-ledger.config';
import { GOODS_ACKNOWLEDGEMENT_REPORT_CONFIG } from '../goods-acknowledgement/goods-acknowledgement.config';
import { PARTS_PACKING_LIST_REPORT_CONFIG } from '../parts-packing-list/parts-packing-list.config';
import { PQM_REPORT_CONFIG } from '../pqm/pqm.config';
import { VOR_PRINT_REPORT_CONFIG } from '../vor-print/vor-print.config';
import { WARRANTY_COST_REPORT_CONFIG } from '../warranty-cost-report/warranty-cost-report.config';
import { WARRANTY_LABOUR_TAX_INVOICE_REPORT_CONFIG } from '../warranty-labour-tax-invoice/warranty-labour-tax-invoice.config';
import { WARRANTY_RECONCILIATION_REPORT_CONFIG } from '../warranty-reconciliation/warranty-reconciliation.config';

/**
 * The full report catalog — one entry per report, each sourced from that report's own
 * `<report>.config.ts` (per the Multi-Report Framework Specification's "config files for
 * each report" requirement). Consumed by the Reports Home page for navigation, and by
 * `app.routes.ts` for the search-only reports' route `data`.
 */
export const REPORTS_CATALOG: ReportConfig[] = [
  DEALER_LEDGER_REPORT_CONFIG,
  GOODS_ACKNOWLEDGEMENT_REPORT_CONFIG,
  WARRANTY_RECONCILIATION_REPORT_CONFIG,
  WARRANTY_LABOUR_TAX_INVOICE_REPORT_CONFIG,
  WARRANTY_COST_REPORT_CONFIG,
  PARTS_PACKING_LIST_REPORT_CONFIG,
  VOR_PRINT_REPORT_CONFIG,
  PQM_REPORT_CONFIG,
];
