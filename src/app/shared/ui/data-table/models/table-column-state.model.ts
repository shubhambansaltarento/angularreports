/**
 * Per-column runtime state — everything about a column that the user can change at
 * runtime (hide/show, reorder, resize, pin) and that gets persisted to localStorage,
 * keyed by `tableId`. Array order (in `DataTableComponent`'s internal state) *is* the
 * column order — there is no separate index field to keep in sync.
 */
export interface TableColumnState {
  key: string;
  hidden: boolean;
  /** CSS width (e.g. '180px'); null means "use the column definition's default". */
  width: string | null;
  pinned: 'start' | 'end' | null;
}
