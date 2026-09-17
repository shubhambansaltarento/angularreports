import { ReportConfig } from '../../shared/models/report-config.model';

export const WARRANTY_LABOUR_TAX_INVOICE_REPORT_CONFIG: ReportConfig = {
  id: 'warranty-labour-tax-invoice',
  title: 'Warranty Labour Tax Invoice',
  description: 'Tax invoices raised for warranty labour charges.',
  route: 'warranty-labour-tax-invoice',
  // Search parameters only for now — table columns are pending confirmed source data.
  hasTable: false,
  apiIntegrated: false,
};
