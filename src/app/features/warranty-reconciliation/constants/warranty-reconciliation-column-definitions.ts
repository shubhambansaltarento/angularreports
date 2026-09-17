import { TableColumn } from '../../../shared/ui/data-table/models/table-column.model';
import { WarrantyReconciliationEffectiveColumn } from '../models/warranty-reconciliation-api-response.model';
import { WarrantyReconciliationRow } from '../models/warranty-reconciliation-row.model';

/**
 * Maps each backend column key (as it appears in the `/data` response's `effectiveColumns`)
 * onto the corresponding `WarrantyReconciliationRow` field and display column — confirmed
 * via direct API testing, mirroring `WARRANTY_COST_COLUMN_DEFINITIONS`.
 */
export const WARRANTY_RECONCILIATION_COLUMN_DEFINITIONS: Record<string, TableColumn<WarrantyReconciliationRow>> = {
  dealerCode: { key: 'dealerCode', header: 'Dealer Code', sortable: true },
  dealerName: { key: 'dealerName', header: 'Dealer Name', sortable: false },
  reconciliationDate: { key: 'reconciliationDate', header: 'Reconciliation Date', sortable: true },
};

/** Default column set/order used before any real `effectiveColumns` has been received. */
export const WARRANTY_RECONCILIATION_DEFAULT_COLUMNS: TableColumn<WarrantyReconciliationRow>[] = [
  'dealerCode',
  'dealerName',
  'reconciliationDate',
].map((backendKey) => WARRANTY_RECONCILIATION_COLUMN_DEFINITIONS[backendKey]);

/**
 * Maps the backend's `effectiveColumns` onto `TableColumn`s, mirroring
 * `toWarrantyCostColumns()`: an unrecognized `columnName` is skipped (logged, not thrown).
 */
export function toWarrantyReconciliationColumns(
  effectiveColumns: WarrantyReconciliationEffectiveColumn[],
): TableColumn<WarrantyReconciliationRow>[] {
  const columns: TableColumn<WarrantyReconciliationRow>[] = [];

  for (const { columnName, isDefault, isVisible } of effectiveColumns) {
    if (!isVisible) continue;

    const definition = WARRANTY_RECONCILIATION_COLUMN_DEFINITIONS[columnName];
    if (!definition) {
      console.warn(`[Warranty Reconciliation] Unrecognized column key in effectiveColumns: "${columnName}" — skipped.`);
      continue;
    }
    columns.push({ ...definition, hidden: !isDefault });
  }

  return columns;
}
