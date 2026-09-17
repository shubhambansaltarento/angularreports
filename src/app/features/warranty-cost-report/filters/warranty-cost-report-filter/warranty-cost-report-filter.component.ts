import { ChangeDetectionStrategy, Component, computed, inject, input, output, viewChild } from '@angular/core';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { ReportSearchBarComponent } from '../../../../shared/ui/report-search-bar/report-search-bar.component';
import { defaultDateRange } from '../../../../shared/utils/default-date-range';
import { WARRANTY_COST_DEFAULT_COMPANY_CODE } from '../../constants/warranty-cost.constants';
import { WarrantyCostConfig } from '../../models/warranty-cost-config.model';

/**
 * Filter panel for Warranty Cost Report — composes the shared `ReportSearchBarComponent`
 * with the narrower field set the real SAP form has (Dealer Code/Dealer Description, no
 * Company Code — silently defaulted and always sent, per
 * api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md) — no section headings, per
 * remove-section-headings-17-09-2026-07_41_AM.md. Presentational: no service/store call of
 * its own; the consuming page owns the actual API call.
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

  /**
   * Prefills Dealer Code/Description — preferring the real config API's `context` once
   * loaded, falling back to `DealerContextService` before it arrives — plus the default
   * 1-month Report Range. `companyCode` is silently defaulted (not rendered), per
   * `showCompanyCode="false"` in the template.
   */
  protected readonly initialValue = computed<CommonReportSearchFilters>(() => {
    const context = this.dealerContext();
    const config = this.config();
    const companyCodeDefault = config?.parameters.find((parameter) => parameter.name === 'companyCode')
      ?.defaultValue as string | undefined;

    return {
      dealerCode: config?.context.dealerCode ?? context.dealerCode,
      dealerDescription: config?.context.dealerDescription ?? context.dealerDescription,
      companyCode: companyCodeDefault ?? WARRANTY_COST_DEFAULT_COMPANY_CODE,
      ...defaultDateRange(),
    };
  });

  readonly searched = output<CommonReportSearchFilters>();

  /** Submits the current field values — the only trigger for the data call. */
  protected onSubmit(): void {
    if (this.searchBar().isDateRangeInvalid()) return;
    this.searched.emit(this.searchBar().value());
  }
}
