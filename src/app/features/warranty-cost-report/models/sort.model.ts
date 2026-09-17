export type SortDirection = 'asc' | 'desc';

/**
 * A single sort descriptor. Sort state is always an ordered array (`Sort[]`), even for a
 * single-column sort, matching Dealer Ledger's own `sort.model.ts` convention.
 */
export interface Sort {
  columnKey: string;
  direction: SortDirection;
}
