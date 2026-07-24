import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DataTableCellTemplateDirective } from '../../../../shared/ui/data-table/data-table-cell-template.directive';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';
import { TableColumn } from '../../../../shared/ui/data-table/models/table-column.model';
import { DEALER_LEDGER_DEFAULT_PAGE_SIZE } from '../../constants/dealer-ledger.constants';
import { DealerLedgerRow } from '../../models/dealer-ledger-row.model';

const DEALER_LEDGER_TABLE_COLUMNS: TableColumn<DealerLedgerRow>[] = [
  { key: 'dealerCode', header: 'Dealer Code', sortable: true },
  { key: 'dealerName', header: 'Dealer Name', sortable: true },
  { key: 'invoiceNumber', header: 'Invoice Number', sortable: true },
  { key: 'invoiceDate', header: 'Invoice Date', sortable: true },
  { key: 'transactionType', header: 'Transaction Type', sortable: true },
  { key: 'debit', header: 'Debit', sortable: true, align: 'end' },
  { key: 'credit', header: 'Credit', sortable: true, align: 'end' },
  { key: 'balance', header: 'Balance', sortable: true, align: 'end' },
  { key: 'branch', header: 'Branch', sortable: true },
  { key: 'state', header: 'State', sortable: true },
  { key: 'city', header: 'City', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
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
