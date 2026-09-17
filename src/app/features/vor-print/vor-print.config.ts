import { ReportConfig } from '../../shared/models/report-config.model';

export const VOR_PRINT_REPORT_CONFIG: ReportConfig = {
  id: 'vor-print',
  title: 'VOR Print',
  description: 'Vehicle Off Road (VOR) print report.',
  route: 'vor-print',
  // Search parameters only for now — table columns are pending confirmed source data.
  hasTable: false,
  apiIntegrated: false,
};
