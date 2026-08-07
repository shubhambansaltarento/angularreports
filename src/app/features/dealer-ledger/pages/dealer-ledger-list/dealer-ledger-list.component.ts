import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DealerLedgerSummaryCardsComponent } from '../../components/dealer-ledger-summary-cards/dealer-ledger-summary-cards.component';
import { DealerLedgerTableComponent } from '../../components/dealer-ledger-table/dealer-ledger-table.component';
import { DealerLedgerToolbarComponent } from '../../components/dealer-ledger-toolbar/dealer-ledger-toolbar.component';
import { DealerLedgerFilterComponent } from '../../filters/dealer-ledger-filter/dealer-ledger-filter.component';
import { DealerLedgerFilterValue } from '../../models/dealer-ledger-filter-panel.model';
import { DealerLedgerFilters } from '../../models/dealer-ledger-filters.model';
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

  /** All search parameters are now structured filter fields (Dealer Code/Description/Company Code/Date Range/checkbox group) — no separate free-text search term. */
  protected onSearch(value: DealerLedgerFilterValue): void {
    this.store.search(this.toFilters(value));
  }

  protected onReset(): void {
    this.store.reset();
  }

  /** Retries the last fetch after an error, keeping whatever filters/sort/page were active. */
  protected onRetry(): void {
    this.store.refresh();
  }

  /** Maps the Filter Panel's common-plus-checkbox-group form value onto the domain filter shape. */
  private toFilters(value: DealerLedgerFilterValue): DealerLedgerFilters {
    const selected = new Set(value.checkboxSelection);
    return {
      dealerCode: value.dealerCode ?? undefined,
      dealerDescription: value.dealerDescription ?? undefined,
      companyCode: value.companyCode ?? undefined,
      dateFrom: value.dateFrom ?? undefined,
      dateTo: value.dateTo ?? undefined,
      withOeDetails: selected.has('oe'),
      withSpDetails: selected.has('sp'),
      withAcDetails: selected.has('ac'),
      withEvDetails: selected.has('ev'),
      withAcwshDetails: selected.has('acwsh'),
    };
  }
}
