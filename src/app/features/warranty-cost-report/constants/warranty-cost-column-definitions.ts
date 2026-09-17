import { TableColumn } from '../../../shared/ui/data-table/models/table-column.model';
import { WarrantyCostEffectiveColumn } from '../models/warranty-cost-api-response.model';
import { WarrantyCostRow } from '../models/warranty-cost-row.model';

/**
 * Maps each backend column key (as it appears in the `/data` response's `effectiveColumns`)
 * onto the corresponding `WarrantyCostRow` field and display column — confirmed via direct
 * API testing. Re-confirmed 2026-09-17 08:14 AM against the real, current schema —
 * column-schema-changed-to-order-date-quantity-17-09-2026-08_14_AM.md.
 */
export const WARRANTY_COST_COLUMN_DEFINITIONS: Record<string, TableColumn<WarrantyCostRow>> = {
  dealerCode: { key: 'dealerCode', header: 'Dealer Code', sortable: true },
  dealerName: { key: 'dealerName', header: 'Dealer Name', sortable: false },
  orderDate: { key: 'orderDate', header: 'Order Date', sortable: true },
  quantity: { key: 'quantity', header: 'Quantity', sortable: false, align: 'end' },
};

/** Default column set/order used before any real `effectiveColumns` has been received. */
export const WARRANTY_COST_DEFAULT_COLUMNS: TableColumn<WarrantyCostRow>[] = [
  'dealerCode',
  'dealerName',
  'orderDate',
  'quantity',
].map((backendKey) => WARRANTY_COST_COLUMN_DEFINITIONS[backendKey]);

/**
 * Maps the backend's `effectiveColumns` onto `TableColumn`s, mirroring
 * `toDealerLedgerColumns()`: an unrecognized `columnName` is skipped (logged, not thrown).
 *
 * `isVisible: false` is treated as "never show this column at all, not even in the column
 * picker" (excluded entirely) — distinct from `isDefault: false`, which still shows the
 * column in the picker but starts it hidden until the user opts in. This interpretation is
 * unconfirmed against a real response where `isVisible: false` actually occurs (every
 * column observed so far has both flags `true`).
 */
export function toWarrantyCostColumns(effectiveColumns: WarrantyCostEffectiveColumn[]): TableColumn<WarrantyCostRow>[] {
  const columns: TableColumn<WarrantyCostRow>[] = [];

  for (const { columnName, isDefault, isVisible } of effectiveColumns) {
    if (!isVisible) continue;

    const definition = WARRANTY_COST_COLUMN_DEFINITIONS[columnName];
    if (!definition) {
      console.warn(`[Warranty Cost Report] Unrecognized column key in effectiveColumns: "${columnName}" — skipped.`);
      continue;
    }
    columns.push({ ...definition, hidden: !isDefault });
  }

  return columns;
}
