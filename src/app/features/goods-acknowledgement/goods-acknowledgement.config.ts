import { ReportConfig } from '../../shared/models/report-config.model';

export const GOODS_ACKNOWLEDGEMENT_FEATURE_PATH = 'goods-acknowledgement';

export const GOODS_ACKNOWLEDGEMENT_REPORT_CONFIG: ReportConfig = {
  id: 'goods-acknowledgement',
  title: 'Goods Acknowledgement',
  description: 'Acknowledge received vehicle/spares shipments against invoices.',
  route: GOODS_ACKNOWLEDGEMENT_FEATURE_PATH,
  // No data source is wired up yet — the table's columns are defined, but no mock/real
  // rows are populated, per explicit instruction not to fabricate data for this report
  // until its source data is confirmed.
  hasTable: true,
};
