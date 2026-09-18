import { TableColumn } from '../../../shared/ui/data-table/models/table-column.model';
import { PartsPackingListRow } from './parts-packing-list-row.model';

/**
 * Internal response shape — `columns` is derived once per fetch, from the first row's
 * keys (parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md), and carried
 * alongside the rows so the table never has to re-derive it itself.
 */
export interface PartsPackingListResponse {
  rows: PartsPackingListRow[];
  totalCount: number;
  columns: TableColumn<PartsPackingListRow>[];
}
