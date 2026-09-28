/**
 * A single row rendered by `DataTableColumnSettingsComponent` — the minimal projection of
 * a column's identity/state this panel needs (header text for display/search, current
 * hidden/pinned state). Array order is display order, same convention as `TableColumnState`.
 */
export interface ColumnSettingsItem {
  key: string;
  header: string;
  hidden: boolean;
  pinned: 'start' | 'end' | null;
  /**
   * Locked in place — can't be moved, hidden or pinned, and nothing can move past it
   * (the Data Table's first/last columns) — lock-first-and-last-columns-28-09-2026-01_35_PM.md.
   */
  locked?: boolean;
}
