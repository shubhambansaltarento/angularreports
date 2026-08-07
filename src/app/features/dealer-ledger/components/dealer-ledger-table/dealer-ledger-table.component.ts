import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DataTableCellTemplateDirective } from '../../../../shared/ui/data-table/data-table-cell-template.directive';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';
import { TableColumn } from '../../../../shared/ui/data-table/models/table-column.model';
import { DEALER_LEDGER_DEFAULT_PAGE_SIZE } from '../../constants/dealer-ledger.constants';
import { DealerLedgerRow } from '../../models/dealer-ledger-row.model';

const DEALER_LEDGER_TABLE_COLUMNS: TableColumn<DealerLedgerRow>[] = [
  { key: 'dealerCode', header: 'Dealer Code', sortable: true },
  { key: 'docType', header: 'Doc. Type', sortable: true },
  { key: 'docReferenceNo', header: 'Doc. Reference No.', sortable: true },
  { key: 'docDate', header: 'Doc. Date', sortable: true },
  { key: 'assignment', header: 'Assignment', sortable: true },
  { key: 'cca', header: 'CCA', sortable: true },
  { key: 'textDec', header: 'Text Dec.', sortable: true },
  { key: 'narrationVehDescription', header: 'Narration Veh. Description', sortable: true },
  { key: 'debitAmount', header: 'Debit Amount', sortable: true, align: 'end' },
  { key: 'creditAmount', header: 'Credit Amount', sortable: true, align: 'end' },
  { key: 'dealerName', header: 'Dealer Name', sortable: true },
  { key: 'dealerAddress', header: 'Dealer Address', sortable: true },
  { key: 'currency', header: 'Currency', sortable: true },
  { key: 'text', header: 'Text', sortable: true },
  { key: 'qnt', header: 'QNT.', sortable: true, align: 'end' },
  { key: 'amt', header: 'Amt', sortable: true, align: 'end' },
];

/**
 * Presentational table for Dealer Ledger entries — composes the shared, completely
 * generic `DataTableComponent` (shared/ui/data-table) with Dealer-Ledger-specific column
 * definitions, cell formatting (currency/date), per-cell tooltips, and empty-state copy.
 * Owns no data-fetching logic itself; `rows`/`loading` are supplied by the list page from
 * `DealerLedgerStore`. Loading skeleton, error-free "no data" state, sorting, trackBy, and
 * OnPush/Signals change detection are all inherited from the shared table — nothing here
 * duplicates them.
 */
@Component({
  selector: 'app-dealer-ledger-table',
  imports: [DataTableComponent, DataTableCellTemplateDirective, CurrencyPipe, DatePipe],
  templateUrl: './dealer-ledger-table.component.html',
  styleUrl: './dealer-ledger-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerTableComponent {
  readonly rows = input<DealerLedgerRow[]>([]);
  readonly loading = input(false);

  protected readonly columns = DEALER_LEDGER_TABLE_COLUMNS;
  /** Matches the store's own page size — the store already returns one page of this size. */
  protected readonly initialPageSize = DEALER_LEDGER_DEFAULT_PAGE_SIZE;
}
