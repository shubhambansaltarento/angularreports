import { ReportConfig } from '../../shared/models/report-config.model';

export const PQM_REPORT_CONFIG: ReportConfig = {
  id: 'pqm',
  title: 'PQM',
  description: 'Product Quality Management report.',
  route: 'pqm',
  // Search parameters only for now — table columns are pending confirmed source data.
  hasTable: false,
};
