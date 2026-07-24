import { DealerLedgerFilters } from './dealer-ledger-filters.model';

/**
 * UI-facing filter state — wraps the raw filter criteria (`DealerLedgerFilters`) with
 * interaction-relevant flags, distinct from the criteria shape itself.
 *
 * TODO: Extend with per-field validation/error state once the Dynamic Form Engine
 * integration for Advanced Search (Enterprise Reporting Engine Specification §5.2/§7.2)
 * is implemented for this feature.
 */
export interface FilterState {
  filters: DealerLedgerFilters;
  isDirty: boolean;
  isApplied: boolean;
}
