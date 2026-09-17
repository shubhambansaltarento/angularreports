import { ReportConfig } from '../../shared/models/report-config.model';

export const PARTS_PACKING_LIST_REPORT_CONFIG: ReportConfig = {
  id: 'parts-packing-list',
  title: 'Parts Packing List',
  description: 'Packing lists for outbound parts shipments.',
  route: 'parts-packing-list',
  // Search parameters only for now — table columns are pending confirmed source data.
  hasTable: false,
  apiIntegrated: false,
};
