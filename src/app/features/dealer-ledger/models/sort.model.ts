export type SortDirection = 'asc' | 'desc';

/**
 * A single sort descriptor. Sort state is always an ordered array (`Sort[]`), even for a
 * single-column sort, per the Enterprise Data Table Specification's multi-sort design
 * (sort is never modeled as one bare `{ columnKey, direction }` value outside an array).
 */
export interface Sort {
  columnKey: string;
  direction: SortDirection;
}
