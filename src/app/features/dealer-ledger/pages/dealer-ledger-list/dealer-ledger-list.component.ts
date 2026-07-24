import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DealerLedgerSummaryCardsComponent } from '../../components/dealer-ledger-summary-cards/dealer-ledger-summary-cards.component';
import { DealerLedgerTableComponent } from '../../components/dealer-ledger-table/dealer-ledger-table.component';
import { DealerLedgerToolbarComponent } from '../../components/dealer-ledger-toolbar/dealer-ledger-toolbar.component';
import { DealerLedgerFilterComponent } from '../../filters/dealer-ledger-filter/dealer-ledger-filter.component';
import { DealerLedgerFilterValue } from '../../models/dealer-ledger-filter-panel.model';
import { DealerLedgerFilters } from '../../models/dealer-ledger-filters.model';
import { DealerLedgerTransactionType } from '../../models/dealer-ledger-row.model';
import { DealerLedgerStore } from '../../store/dealer-ledger.store';

/**
 * Dealer Ledger list page — lazy-loaded route target.
 *
 * Layout: Header (toolbar) / Filters / Summary Cards / SAP Table (which owns its own
 * pagination footer). Flow: filters are submitted via the Filter Panel's Search event ->
 * mapped onto the domain `DealerLedgerFilters`/search term -> `DealerLedgerStore.search()`
 * calls the mock backend -> the store's data/summary/pagination signals populate -> the
 * table (and summary cards) re-render reactively. No export yet.
 *
 * On a failed fetch, the store's `error` signal drives an accessible error banner with a
 * Retry action (`store.refresh()` — re-issues the last request as-is, no state is lost).
 */
@Component({
  selector: 'app-dealer-ledger-list',
  imports: [
    DealerLedgerToolbarComponent,
    DealerLedgerFilterComponent,
    DealerLedgerSummaryCardsComponent,
    DealerLedgerTableComponent,
  ],
  templateUrl: './dealer-ledger-list.component.html',
  styleUrl: './dealer-ledger-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerListComponent {
  protected readonly store = inject(DealerLedgerStore);

  constructor() {
    this.store.load();
  }

  protected onSearch(value: DealerLedgerFilterValue): void {
    this.store.search(this.toFilters(value), value.dealerSearch ?? '');
  }

  protected onReset(): void {
    this.store.reset();
  }

  /** Retries the last fetch after an error, keeping whatever filters/sort/page were active. */
  protected onRetry(): void {
    this.store.refresh();
  }

  /**
   * Maps the Filter Panel's generic form value onto the domain filter shape. The panel's
   * checkbox group is configured in `single` mode here (see the list template) since
   * `DealerLedgerFilters.transactionType` is a single value, not a multi-select set.
   */
  private toFilters(value: DealerLedgerFilterValue): DealerLedgerFilters {
    return {
      dateFrom: value.dateFrom ?? undefined,
      dateTo: value.dateTo ?? undefined,
      transactionType: (value.checkboxSelection[0] as DealerLedgerTransactionType | undefined) ?? undefined,
    };
  }
}
