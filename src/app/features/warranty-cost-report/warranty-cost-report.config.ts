import { ReportConfig } from '../../shared/models/report-config.model';

export const WARRANTY_COST_REPORT_CONFIG: ReportConfig = {
  id: 'warranty-cost-report',
  title: 'Warranty Cost Report',
  description: 'Cost breakdown of warranty claims by dealer.',
  route: 'warranty-cost-report',
  // Both /config and /data confirmed live against the real backend —
  // api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md.
  hasTable: true,
  apiIntegrated: true,
};
