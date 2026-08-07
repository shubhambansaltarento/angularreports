import { ReportConfig } from '../../shared/models/report-config.model';

export const WARRANTY_RECONCILIATION_REPORT_CONFIG: ReportConfig = {
  id: 'warranty-reconciliation',
  title: 'Warranty Reconciliation',
  description: 'Reconcile warranty claims against dealer records.',
  route: 'warranty-reconciliation',
  // Search parameters only for now — table columns are pending confirmed source data.
  hasTable: false,
};
