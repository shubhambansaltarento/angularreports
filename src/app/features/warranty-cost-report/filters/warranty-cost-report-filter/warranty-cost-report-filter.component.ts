import { ChangeDetectionStrategy, Component, computed, inject, input, output, viewChild } from '@angular/core';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { ReportSearchBarComponent } from '../../../../shared/ui/report-search-bar/report-search-bar.component';
import { defaultDateRange } from '../../../../shared/utils/default-date-range';
import { WarrantyCostConfig } from '../../models/warranty-cost-config.model';
import { WarrantyCostFilters } from '../../models/warranty-cost-filters.model';

/**
 * Filter panel for Warranty Cost Report — composes the shared `ReportSearchBarComponent`
 * with read-only, config-sourced Dealer Code/Dealer Description (no Company Code field —
 * silently defaulted from config, not user-editable, matching Warranty Reconciliation's
 * pattern) plus an editable Date Range. Presentational: no service/store call of its own.
 * Renders no submit button of its own — the page's single "Show Report" button calls the
 * public `submit()`/`isSubmitDisabled()` below.
 */
@Component({
  selector: 'app-warranty-cost-report-filter',
  imports: [ReportSearchBarComponent],
  templateUrl: './warranty-cost-report-filter.component.html',
  styleUrl: './warranty-cost-report-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyCostReportFilterComponent {
  /** Real config API response (context/Company Code default), once loaded. */
  readonly config = input<WarrantyCostConfig | null>(null);

  private readonly dealerContext = inject(DealerContextService).dealerContext;
  protected readonly searchBar = viewChild.required(ReportSearchBarComponent);

  /** Company Code default from config — silently applied, not rendered. */
  protected readonly companyCode = computed<string | undefined>(() => {
    const config = this.config();
    return (config?.parameters.find((parameter) => parameter.name === 'companyCode')?.defaultValue as string | undefined) ?? undefined;
  });

  /** Prefills Dealer Code/Description — preferring the real config API's `context` once loaded, falling back to `DealerContextService` — plus the default 1-month Report Range. */
  protected readonly initialValue = computed<CommonReportSearchFilters>(() => {
    const context = this.dealerContext();
    const config = this.config();

    return {
      dealerCode: config?.context.dealerCode ?? context.dealerCode,
      dealerDescription: config?.context.dealerDescription ?? context.dealerDescription,
      companyCode: this.companyCode() ?? null,
      ...defaultDateRange(),
    };
  });

  readonly searched = output<WarrantyCostFilters>();

  /** Submits the current field values — the page's "Show Report" button calls this. */
  submit(): void {
    if (this.searchBar().isDateRangeInvalid()) return;
    const value = this.searchBar().value();
    this.searched.emit({
      dealerCode: value.dealerCode ?? undefined,
      dealerDescription: value.dealerDescription ?? undefined,
      companyCode: this.companyCode(),
      dateFrom: value.dateFrom ?? undefined,
      dateTo: value.dateTo ?? undefined,
    });
  }

  isSubmitDisabled(): boolean {
    return this.searchBar().isDateRangeInvalid();
  }

  /** Clears the Date Range back to empty — called by the page's Reset button. */
  resetFilters(): void {
    this.searchBar().reset();
  }
}
