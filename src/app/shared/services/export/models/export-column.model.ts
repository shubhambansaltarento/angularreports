/**
 * A single column to include in an export — deliberately the minimal shape ExportService
 * needs (key + header), decoupled from any richer column model (e.g. the Data Table's own
 * `TableColumn<T>`) so this stays reusable outside the Data Table too.
 */
export interface ExportColumn<T> {
  key: Extract<keyof T, string>;
  header: string;
}
