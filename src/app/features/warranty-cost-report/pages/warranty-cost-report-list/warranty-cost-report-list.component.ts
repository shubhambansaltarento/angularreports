import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadcrumbComponent } from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { ExportFormat } from '../../../../shared/services/export/models/export-format.model';
import { WarrantyCostTableComponent } from '../../components/warranty-cost-table/warranty-cost-table.component';
import { WarrantyCostReportFilterComponent } from '../../filters/warranty-cost-report-filter/warranty-cost-report-filter.component';
import { WarrantyCostConfig } from '../../models/warranty-cost-config.model';
import { WarrantyCostFilters } from '../../models/warranty-cost-filters.model';
import { WarrantyCostService } from '../../services/warranty-cost.service';
import { WarrantyCostStore } from '../../store/warranty-cost.store';

/** Maps the config API's backend format names onto the app's own `ExportFormat` values. */
const EXPORT_FORMAT_BY_BACKEND_NAME: Record<string, ExportFormat> = {
  CSV: 'csv',
  XLSX: 'excel',
  PRINT: 'print',
  PDF: 'pdf',
};

/**
 * Warranty Cost Report list page — real API integration mirroring
 * `DealerLedgerListComponent`, per
 * api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md. Config is fetched once on
 * entry; no data fetch happens until the filter's Submit ("Show Report") fires
 * (`store.hasSearched()` gates the table, exactly like Dealer Ledger).
 */
@Component({
  selector: 'app-warranty-cost-report-list',
  imports: [BreadcrumbComponent, WarrantyCostReportFilterComponent, WarrantyCostTableComponent],
  templateUrl: './warranty-cost-report-list.component.html',
  styleUrl: './warranty-cost-report-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyCostReportListComponent {
  protected readonly title = 'Warranty Cost Report';
  protected readonly store = inject(WarrantyCostStore);
  private readonly warrantyCostService = inject(WarrantyCostService);

  protected readonly config = signal<WarrantyCostConfig | null>(null);

  /** Export formats from the config API, mapped onto `ExportFormat` — `null` until config loads (table shows every format meanwhile). */
  protected readonly exportFormats = computed<ExportFormat[] | null>(() => {
    const formats = this.config()?.export.formats;
    if (!formats) return null;
    return formats
      .map((format) => EXPORT_FORMAT_BY_BACKEND_NAME[format.toUpperCase()])
      .filter((format): format is ExportFormat => Boolean(format));
  });

  constructor() {
    this.warrantyCostService
      .getConfig()
      .pipe(takeUntilDestroyed())
      .subscribe((config) => this.config.set(config));
  }

  protected onSearch(value: CommonReportSearchFilters): void {
    this.store.search(this.toFilters(value));
  }

  /**
   * Dealer Code/Description are read-only, config-sourced display fields (never
   * user-editable) — sourced here directly from `this.config()?.context`, not from the
   * emitted form value, so the `/data` request can't lag behind a real config response
   * that's already loaded by the time Submit fires (the form's own display relay is a
   * separate, slower hop) —
   * config-context-dealer-code-source-of-truth-17-09-2026-08_19_AM.md.
   */
  private toFilters(value: CommonReportSearchFilters): WarrantyCostFilters {
    const context = this.config()?.context;

    return {
      dealerCode: context?.dealerCode ?? value.dealerCode ?? undefined,
      dealerDescription: context?.dealerDescription ?? value.dealerDescription ?? undefined,
      dateFrom: value.dateFrom ?? undefined,
      dateTo: value.dateTo ?? undefined,
    };
  }
}
