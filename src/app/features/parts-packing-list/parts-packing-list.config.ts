import { ReportConfig } from '../../shared/models/report-config.model';

export const PARTS_PACKING_LIST_REPORT_CONFIG: ReportConfig = {
  id: 'parts-packing-list',
  title: 'Parts Packing List',
  description: 'Packing lists for outbound parts shipments.',
  route: 'parts-packing-list',
  // Both /config and /data confirmed live against the real backend, with dynamically
  // derived columns — parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md.
  hasTable: true,
  apiIntegrated: true,
};
