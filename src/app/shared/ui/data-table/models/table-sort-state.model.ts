export type TableSortDirection = 'asc' | 'desc' | null;

/** Single-column sort state — the column currently sorted by, and its direction. */
export interface TableSortState {
  columnKey: string | null;
  direction: TableSortDirection;
}
