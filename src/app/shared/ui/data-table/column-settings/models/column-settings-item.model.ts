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
}
