export type DealerLedgerFilterCheckboxMode = 'single' | 'multi';

export interface DealerLedgerFilterCheckboxOption {
  key: string;
  label: string;
}

/**
 * The Dealer Ledger Filter Panel's own form-value shape.
 *
 * Deliberately decoupled from `DealerLedgerFilters`/`DealerLedgerRequest`: this component
 * is a generic, configuration-driven filter shell (its checkbox options/mode are supplied
 * via input, not hardcoded to a specific domain field). Mapping this value onto the
 * domain's `DealerLedgerFilters`/`DealerLedgerRequest` shape is the consuming page's
 * responsibility once the API is wired up — this component has no API integration itself.
 */
export interface DealerLedgerFilterValue {
  dateFrom: string | null;
  dateTo: string | null;
  dealerSearch: string | null;
  checkboxSelection: string[];
}
