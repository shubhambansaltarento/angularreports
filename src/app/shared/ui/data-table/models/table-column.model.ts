/**
 * Generic column definition for the enterprise Data Table.
 *
 * This model — and the Data Table component it configures — is intentionally decoupled
 * from any specific feature/domain (e.g. Dealer Ledger). `T` is the row shape supplied by
 * whichever report/feature consumes the table.
 */
export interface TableColumn<T> {
  /** Property key on the row object this column renders/sorts/searches by default. */
  key: Extract<keyof T, string>;
  /** Column header text. */
  header: string;
  /** Whether clicking the header cycles asc/desc/none sort for this column. */
  sortable?: boolean;
  /** Initial hidden state — the user's persisted choice (if any) overrides this on load. */
  hidden?: boolean;
  /** Optional fixed column width (any valid CSS width value). */
  width?: string;
  /** Optional text alignment for the column's cells. */
  align?: 'start' | 'center' | 'end';
  /** Initial pin state — 'start'/'end' render the column sticky at that edge of the table. */
  pinned?: 'start' | 'end' | null;
}
