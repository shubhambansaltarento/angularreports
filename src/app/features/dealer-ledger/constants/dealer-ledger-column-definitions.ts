import { TableColumn } from '../../../shared/ui/data-table/models/table-column.model';
import { DealerLedgerEffectiveColumn } from '../models/dealer-ledger-api-response.model';
import { DealerLedgerRow } from '../models/dealer-ledger-row.model';

/**
 * Maps each backend column key (as it appears in the `/data` response's `effectiveColumns`
 * — effective-columns-drive-table-headers-16-09-2026-03_59_PM.md) onto the corresponding
 * `DealerLedgerRow` field and display column. Backend key names don't always match the row
 * model's own keys (e.g. `debit`/`credit`/`vehicleNarration` vs. `debitAmount`/
 * `creditAmount`/`narrationVehDescription`) — this is the single place that reconciles them.
 *
 * Extend this map as new backend column keys are observed in real responses (see Open
 * decisions in effective-columns-drive-table-headers-16-09-2026-03_59_PM) — an unmapped key is skipped, not guessed at.
 */
export const DEALER_LEDGER_COLUMN_DEFINITIONS: Record<string, TableColumn<DealerLedgerRow>> = {
  dealerCode: { key: 'dealerCode', header: 'Dealer Code', sortable: true },
  docType: { key: 'docType', header: 'Doc. Type', sortable: true },
  docReferenceNo: { key: 'docReferenceNo', header: 'Doc. Reference No.', sortable: true },
  docDate: { key: 'docDate', header: 'Doc. Date', sortable: true },
  postingDate: { key: 'docDate', header: 'Posting Date', sortable: true },
  assignment: { key: 'assignment', header: 'Assignment', sortable: true },
  cca: { key: 'cca', header: 'CCA', sortable: true },
  textDec: { key: 'textDec', header: 'Text Dec.', sortable: true },
  vehicleNarration: { key: 'narrationVehDescription', header: 'Narration Veh. Description', sortable: true },
  debit: { key: 'debitAmount', header: 'Debit Amount', sortable: true, align: 'end' },
  credit: { key: 'creditAmount', header: 'Credit Amount', sortable: true, align: 'end' },
  dealerName: { key: 'dealerName', header: 'Dealer Name', sortable: true },
  dealerAddress: { key: 'dealerAddress', header: 'Dealer Address', sortable: true },
  currency: { key: 'currency', header: 'Currency', sortable: true },
  text: { key: 'text', header: 'Text', sortable: true },
  qnt: { key: 'qnt', header: 'QNT.', sortable: true, align: 'end' },
  amt: { key: 'amt', header: 'Amt', sortable: true, align: 'end' },
  runningBalance: { key: 'amt', header: 'Balance', sortable: true, align: 'end' },
  // Revealed conditionally per "Include Details" checkbox — backend-adds-checkbox-support-16-09-2026-05_24_PM.md.
  oeRefNo: { key: 'oeRefNo', header: 'OE Ref No' },
  spRefNo: { key: 'spRefNo', header: 'SP Ref No' },
  acRefNo: { key: 'acRefNo', header: 'AC Ref No' },
  evRefNo: { key: 'evRefNo', header: 'EV Ref No' },
  acwshRefNo: { key: 'acwshRefNo', header: 'ACWSH Ref No' },
  cblRefNo: { key: 'cblRefNo', header: 'CBL Ref No' },
};

/** Default column set/order used before any real `effectiveColumns` has been received. */
export const DEALER_LEDGER_DEFAULT_COLUMNS: TableColumn<DealerLedgerRow>[] = [
  'dealerCode',
  'docType',
  'docReferenceNo',
  'docDate',
  'assignment',
  'cca',
  'textDec',
  'vehicleNarration',
  'debit',
  'credit',
  'dealerName',
  'dealerAddress',
  'currency',
  'text',
  'qnt',
  'amt',
].map((backendKey) => DEALER_LEDGER_COLUMN_DEFINITIONS[backendKey]);

/**
 * Maps the backend's `effectiveColumns` (ordered list of `{ columnName, isDefault }` —
 * effective-columns-shape-change-17-09-2026-05_41_AM.md) onto `TableColumn`s, skipping any
 * `columnName` not present in `DEALER_LEDGER_COLUMN_DEFINITIONS` (logged, not thrown — an
 * unrecognized new backend column must not break the table). `isDefault: false` columns are
 * still included — and thus selectable in the column picker — but start `hidden: true`
 * until the user opts in, via the shared table's existing hidden-column mechanism.
 */
export function toDealerLedgerColumns(effectiveColumns: DealerLedgerEffectiveColumn[]): TableColumn<DealerLedgerRow>[] {
  const columns: TableColumn<DealerLedgerRow>[] = [];

  for (const { columnName, isDefault } of effectiveColumns) {
    const definition = DEALER_LEDGER_COLUMN_DEFINITIONS[columnName];
    if (!definition) {
      console.warn(`[Dealer Ledger] Unrecognized column key in effectiveColumns: "${columnName}" — skipped.`);
      continue;
    }
    columns.push({ ...definition, hidden: !isDefault });
  }

  return columns;
}
