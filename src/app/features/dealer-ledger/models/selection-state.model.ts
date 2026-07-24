/**
 * Row-selection state for the Dealer Ledger table, per the Enterprise Data Table
 * Specification's bulk "select all matching filter" model (§7.4/§9): selection is never
 * represented as a single flat ID list once "select all matching" is possible — it needs
 * an explicit mode plus an exclusion set for since-deselected rows.
 */
export interface SelectionState {
  selectedIds: string[];
  allMatchingFilter: boolean;
  excludedIds: string[];
}
