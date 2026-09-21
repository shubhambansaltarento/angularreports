import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { DismissibleAlertComponent } from '../../../../shared/ui/dismissible-alert/dismissible-alert.component';
import { LoadingIndicatorComponent } from '../../../../shared/ui/loading-indicator/loading-indicator.component';
import { ReportDealerIdentityComponent } from '../../../../shared/ui/report-dealer-identity/report-dealer-identity.component';
import { ReportHeaderBarComponent } from '../../../../shared/ui/report-header-bar/report-header-bar.component';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { ExportFormat } from '../../../../shared/services/export/models/export-format.model';
import { WarrantyReconciliationTableComponent } from '../../components/warranty-reconciliation-table/warranty-reconciliation-table.component';
import { WarrantyReconciliationFilterComponent } from '../../filters/warranty-reconciliation-filter/warranty-reconciliation-filter.component';
import { WarrantyReconciliationConfig } from '../../models/warranty-reconciliation-config.model';
import { WarrantyReconciliationFilters } from '../../models/warranty-reconciliation-filters.model';
import { WarrantyReconciliationService } from '../../services/warranty-reconciliation.service';
import { WarrantyReconciliationStore } from '../../store/warranty-reconciliation.store';

/** Maps the config API's backend format names onto the app's own `ExportFormat` values. */
const EXPORT_FORMAT_BY_BACKEND_NAME: Record<string, ExportFormat> = {
  CSV: 'csv',
  XLSX: 'excel',
  PRINT: 'print',
  PDF: 'pdf',
};

/**
 * Warranty Reconciliation list page — real API integration mirroring
 * `WarrantyCostReportListComponent`, per api-integration-17-09-2026-08_37_AM.md. Config is
 * fetched once on entry; no data fetch happens until the filter's Submit ("Show Report")
 * fires (`store.hasSearched()` gates the table, exactly like Warranty Cost Report).
 */
@Component({
  selector: 'app-warranty-reconciliation-list',
  imports: [ReportHeaderBarComponent, ReportDealerIdentityComponent, WarrantyReconciliationFilterComponent, WarrantyReconciliationTableComponent, DismissibleAlertComponent, LoadingIndicatorComponent],
  templateUrl: './warranty-reconciliation-list.component.html',
  styleUrl: './warranty-reconciliation-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyReconciliationListComponent {
  protected readonly title = 'Warranty Reconciliation';
  protected readonly store = inject(WarrantyReconciliationStore);
  private readonly warrantyReconciliationService = inject(WarrantyReconciliationService);
  private readonly dealerContext = inject(DealerContextService).dealerContext;

  protected readonly config = signal<WarrantyReconciliationConfig | null>(null);

  protected readonly dealerCode = computed(() => this.config()?.context.dealerCode ?? this.dealerContext().dealerCode);
  protected readonly dealerName = computed(() => this.config()?.context.dealerDescription ?? this.dealerContext().dealerDescription);

  /** Export formats from the config API, mapped onto `ExportFormat` — `null` until config loads (table shows every format meanwhile). */
  protected readonly exportFormats = computed<ExportFormat[] | null>(() => {
    const formats = this.config()?.export.formats;
    if (!formats) return null;
    return formats
      .map((format) => EXPORT_FORMAT_BY_BACKEND_NAME[format.toUpperCase()])
      .filter((format): format is ExportFormat => Boolean(format));
  });

  constructor() {
    this.warrantyReconciliationService
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
   * separate, slower hop) — built in from the start here, per
   * config-context-dealer-code-source-of-truth-17-09-2026-08_19_AM.md, rather than
   * retrofitted after a bug report.
   */
  private toFilters(value: CommonReportSearchFilters): WarrantyReconciliationFilters {
    const context = this.config()?.context;

    return {
      dealerCode: context?.dealerCode ?? value.dealerCode ?? undefined,
      dealerDescription: context?.dealerDescription ?? value.dealerDescription ?? undefined,
      dateFrom: value.dateFrom ?? undefined,
      dateTo: value.dateTo ?? undefined,
    };
  }
}
