import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadcrumbComponent } from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import { DismissibleAlertComponent } from '../../../../shared/ui/dismissible-alert/dismissible-alert.component';
import { HtmlPdfViewerComponent } from '../../../../shared/ui/html-pdf-viewer/html-pdf-viewer.component';
import { WarrantyCostStatementComponent } from '../../components/warranty-cost-statement/warranty-cost-statement.component';
import { WarrantyCostReportFilterComponent } from '../../filters/warranty-cost-report-filter/warranty-cost-report-filter.component';
import { WarrantyCostConfig } from '../../models/warranty-cost-config.model';
import { WarrantyCostFilters } from '../../models/warranty-cost-filters.model';
import { WarrantyCostService } from '../../services/warranty-cost.service';
import { WarrantyCostStore } from '../../store/warranty-cost.store';

/**
 * Warranty Cost Report list page. Unlike every other report, this one has no table: its
 * real UI is a printed statement/bill, rendered by `WarrantyCostStatementComponent` inside
 * the shared `HtmlPdfViewerComponent` (zoom/rotate/print/download) —
 * html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md. Config is fetched once on entry
 * (`GET reports/WARRANTY_COST/config`) — it supplies the read-only Dealer Code/Description
 * and the silently-defaulted Company Code the data request needs.
 */
@Component({
  selector: 'app-warranty-cost-report-list',
  imports: [BreadcrumbComponent, WarrantyCostReportFilterComponent, WarrantyCostStatementComponent, HtmlPdfViewerComponent, DismissibleAlertComponent],
  templateUrl: './warranty-cost-report-list.component.html',
  styleUrl: './warranty-cost-report-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyCostReportListComponent {
  protected readonly title = 'Warranty Cost Report';
  protected readonly store = inject(WarrantyCostStore);
  private readonly warrantyCostService = inject(WarrantyCostService);
  protected readonly filter = viewChild.required(WarrantyCostReportFilterComponent);

  protected readonly config = signal<WarrantyCostConfig | null>(null);

  private lastFilters: WarrantyCostFilters | null = null;

  constructor() {
    this.warrantyCostService
      .getConfig()
      .pipe(takeUntilDestroyed())
      .subscribe((config) => this.config.set(config));
  }

  protected onSearch(filters: WarrantyCostFilters): void {
    this.lastFilters = filters;
    this.store.search(filters);
  }

  /** The page's single "Show Report" action — triggers the filter panel's own submit logic. */
  protected onShowReport(): void {
    this.filter().submit();
  }

  protected onRetry(): void {
    this.store.refresh();
  }

  protected get dateFrom(): string | null {
    return this.lastFilters?.dateFrom ?? null;
  }

  protected get dateTo(): string | null {
    return this.lastFilters?.dateTo ?? null;
  }
}
