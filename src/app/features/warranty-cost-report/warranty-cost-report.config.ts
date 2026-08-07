import { ReportConfig } from '../../shared/models/report-config.model';

export const WARRANTY_COST_REPORT_CONFIG: ReportConfig = {
  id: 'warranty-cost-report',
  title: 'Warranty Cost Report',
  description: 'Cost breakdown of warranty claims by dealer.',
  route: 'warranty-cost-report',
  // Search parameters only for now — table columns are pending confirmed source data.
  hasTable: false,
};
