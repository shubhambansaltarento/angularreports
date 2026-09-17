import { ReportConfig } from '../../shared/models/report-config.model';

export const WARRANTY_RECONCILIATION_REPORT_CONFIG: ReportConfig = {
  id: 'warranty-reconciliation',
  title: 'Warranty Reconciliation',
  description: 'Reconcile warranty claims against dealer records.',
  route: 'warranty-reconciliation',
  // Both /config and /data confirmed live against the real backend (double-L
  // WARRANTY_RECONCILLATION report key) — dealer-ledger-style-page-17-09-2026-08_37_AM.md.
  hasTable: true,
  apiIntegrated: true,
};
