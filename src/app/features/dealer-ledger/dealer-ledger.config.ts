import { ReportConfig } from '../../shared/models/report-config.model';
import { DEALER_LEDGER_FEATURE_PATH } from './constants/dealer-ledger.constants';

export const DEALER_LEDGER_REPORT_CONFIG: ReportConfig = {
  id: 'dealer-ledger',
  title: 'Dealer Ledger',
  description: 'Dealer-wise ledger entries with running balances across documents.',
  route: DEALER_LEDGER_FEATURE_PATH,
  hasTable: true,
  apiIntegrated: true,
};
