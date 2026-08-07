import { CommonReportSearchFilters } from '../../../shared/models/report-search-filters.model';

export type DealerLedgerFilterCheckboxMode = 'single' | 'multi';

export interface DealerLedgerFilterCheckboxOption {
  key: string;
  label: string;
}

/**
 * The Dealer Ledger Filter Panel's own form-value shape: the platform-common search
 * fields (rendered via the shared `ReportSearchBarComponent`) plus this report's own
 * "include details" checkbox-group selection (OE/SP/AC/EV/ACWSH keys). Mapping this
 * value onto the domain `DealerLedgerFilters` shape is the consuming page's
 * responsibility (see `DealerLedgerListComponent.toFilters`).
 */
export interface DealerLedgerFilterValue extends CommonReportSearchFilters {
  checkboxSelection: string[];
}
