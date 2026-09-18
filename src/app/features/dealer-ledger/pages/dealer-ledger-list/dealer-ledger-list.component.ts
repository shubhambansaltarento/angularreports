import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadcrumbComponent } from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import { DismissibleAlertComponent } from '../../../../shared/ui/dismissible-alert/dismissible-alert.component';
import { LoadingIndicatorComponent } from '../../../../shared/ui/loading-indicator/loading-indicator.component';
import { DealerLedgerTableComponent } from '../../components/dealer-ledger-table/dealer-ledger-table.component';
import { DealerLedgerToolbarComponent } from '../../components/dealer-ledger-toolbar/dealer-ledger-toolbar.component';
import { DealerLedgerFilterComponent } from '../../filters/dealer-ledger-filter/dealer-ledger-filter.component';
import { DealerLedgerConfig } from '../../models/dealer-ledger-config.model';
import { DealerLedgerFilterValue } from '../../models/dealer-ledger-filter-panel.model';
import { DealerLedgerFilters } from '../../models/dealer-ledger-filters.model';
import { DealerLedgerService } from '../../services/dealer-ledger.service';
import { DealerLedgerStore } from '../../store/dealer-ledger.store';
import { ExportFormat } from '../../../../shared/services/export/models/export-format.model';

/** Maps the config API's backend format names onto the app's own `ExportFormat` values. */
const EXPORT_FORMAT_BY_BACKEND_NAME: Record<string, ExportFormat> = {
  CSV: 'csv',
  XLSX: 'excel',
  PRINT: 'print',
  PDF: 'pdf',
};

/**
 * Dealer Ledger list page — lazy-loaded route target.
 *
 * Layout: Header (toolbar) / Filters / SAP Table (which owns its own pagination footer,
 * search box, and export menu) — no Summary Cards section
 * (doc-date-dd-mm-yyyy-format-17-09-2026-12_00_AM.md). Flow: the Filter Panel's Submit button (submit-button-replaces-auto-search-16-09-2026-04_54_PM)
 * emits a Search event -> mapped onto the domain `DealerLedgerFilters` ->
 * `DealerLedgerStore.search()` calls the backend -> the store's data/pagination signals
 * populate -> the table re-renders reactively. Export and Reset both live in the table's
 * own header toolbar; Reset clears the Filter Panel via `filter().resetFilters()`.
 *
 * On a failed fetch, the store's `error` signal drives an accessible error banner with a
 * Retry action (`store.refresh()` — re-issues the last request as-is, no state is lost).
 *
 * The data API is not paginated (api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md) — one
 * request per filter/search change returns the full matching result set, and the table
 * paginates/sorts it entirely client-side via its own default behavior. No page/sort event
 * is wired back to the store.
 *
 * The report's config is fetched once here, on entry (config-call-on-entry-16-09-2026-02_32_PM.md) —
 * separately from data fetches, and not re-fetched on Search/Reset/sort/page. No data
 * fetch happens automatically: the table shows its empty state until the user clicks
 * Submit in the Filter Panel (submit-button-replaces-auto-search-16-09-2026-04_54_PM/no-data-until-submit-16-09-2026-05_01_PM.md). The
 * six fields are still config-prefilled, so clicking Submit unchanged fetches the same
 * result an automatic initial fetch would have.
 */
@Component({
  selector: 'app-dealer-ledger-list',
  imports: [DealerLedgerToolbarComponent, BreadcrumbComponent, DealerLedgerFilterComponent, DealerLedgerTableComponent, DismissibleAlertComponent, LoadingIndicatorComponent],
  templateUrl: './dealer-ledger-list.component.html',
  styleUrl: './dealer-ledger-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerListComponent {
  protected readonly store = inject(DealerLedgerStore);
  private readonly dealerLedgerService = inject(DealerLedgerService);
  protected readonly filter = viewChild.required(DealerLedgerFilterComponent);
  private readonly table = viewChild.required(DealerLedgerTableComponent);

  protected readonly config = signal<DealerLedgerConfig | null>(null);

  /** Export formats from the config API, mapped onto `ExportFormat` — `null` until config loads (table shows every format meanwhile). */
  protected readonly exportFormats = computed<ExportFormat[] | null>(() => {
    const formats = this.config()?.export.formats;
    if (!formats) return null;
    return formats
      .map((format) => EXPORT_FORMAT_BY_BACKEND_NAME[format.toUpperCase()])
      .filter((format): format is ExportFormat => Boolean(format));
  });

  constructor() {
    this.dealerLedgerService
      .getConfig()
      .pipe(takeUntilDestroyed())
      .subscribe((config) => this.config.set(config));
  }

  /** All search parameters are now structured filter fields (Dealer Code/Description/Company Code/Date Range/checkbox group) — no separate free-text search term. */
  protected onSearch(value: DealerLedgerFilterValue): void {
    this.store.search(this.toFilters(value));
  }

  /** Triggered by the table header's Reset control — clears the filter panel, which in turn emits `reset`. */
  protected onTableReset(): void {
    this.table().resetPagination();
    this.filter().resetFilters();
  }

  protected onReset(): void {
    this.store.reset();
  }

  /** The page's single "Show Report" action — triggers the filter panel's own submit logic (validates the Date Range, then emits `searched`). */
  protected onShowReport(): void {
    this.filter().submit();
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
