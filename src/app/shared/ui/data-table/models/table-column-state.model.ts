/**
 * Per-column runtime state — everything about a column that the user can change at
 * runtime (hide/show, reorder, resize, pin) and that gets persisted to localStorage,
 * keyed by `tableId`. Array order (in `DataTableComponent`'s internal state) *is* the
 * column order — there is no separate index field to keep in sync.
 */
export interface TableColumnState {
  key: string;
  hidden: boolean;
  /**
   * True once the user has explicitly toggled this column's visibility via the picker —
   * column-hidden-default-not-applied-when-columns-change-after-init-17-09-2026-06_25_AM.md.
   * Lets a later `columns()` change (e.g. Dealer Ledger's `effectiveColumns` arriving
   * asynchronously after the table's fallback columns already initialized) re-sync
   * `hidden` from the column definition's own default for any column the user hasn't
   * manually overridden, without clobbering a deliberate user choice. Cleared (unset) by
   * "Restore Default".
   */
  hiddenIsExplicit?: boolean;
  /** CSS width (e.g. '180px'); null means "use the column definition's default". */
  width: string | null;
  pinned: 'start' | 'end' | null;
}
