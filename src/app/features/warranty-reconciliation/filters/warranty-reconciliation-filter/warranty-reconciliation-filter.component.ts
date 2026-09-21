import { ChangeDetectionStrategy, Component, computed, inject, input, output, viewChild } from '@angular/core';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { ReportSearchBarComponent } from '../../../../shared/ui/report-search-bar/report-search-bar.component';
import { defaultDateRange } from '../../../../shared/utils/default-date-range';
import { WARRANTY_RECONCILIATION_DEFAULT_COMPANY_CODE } from '../../constants/warranty-reconciliation.constants';
import { WarrantyReconciliationConfig } from '../../models/warranty-reconciliation-config.model';

const RECONCILIATION_DATE_MIN = '2020-04-01';
const RECONCILIATION_DATE_MAX_RANGE_DAYS = 366;

/** ISO (yyyy-MM-dd) form, matching the `<input type="date">` value shape. */
function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Filter panel for Warranty Reconciliation — composes the shared `ReportSearchBarComponent`
 * with Dealer Code/Dealer Description (read-only, config-sourced) and no Company Code, but
 * now WITH a mandatory Reconciliation Date range — the backend added a `reconciliationDate`
 * `DATE_RANGE` parameter (`required: true`, `minDate: 2020-04-01`, `maxDate: $TODAY`,
 * `maxRangeDays: 366`, `requireBothBounds: true`), confirmed live —
 * add-date-range-ui-17-09-2026-09_05_AM.md. Unlike Dealer Ledger/Warranty Cost Report, there
 * is no default range: Submit stays disabled until both bounds are chosen and valid.
 * Presentational: no service/store call of its own; the consuming page owns the actual API
 * call.
 */
@Component({
  selector: 'app-warranty-reconciliation-filter',
  imports: [ReportSearchBarComponent],
  templateUrl: './warranty-reconciliation-filter.component.html',
  styleUrl: './warranty-reconciliation-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyReconciliationFilterComponent {
  /** Real config API response (context/Company Code default), once loaded. */
  readonly config = input<WarrantyReconciliationConfig | null>(null);

  private readonly dealerContext = inject(DealerContextService).dealerContext;
  protected readonly searchBar = viewChild.required(ReportSearchBarComponent);

  /** Inclusive upper bound for the Reconciliation Date range — today, per `maxDate: "$TODAY"`. */
  protected readonly maxDate = todayIsoDate();
  protected readonly minDate = RECONCILIATION_DATE_MIN;
  protected readonly maxRangeDays = RECONCILIATION_DATE_MAX_RANGE_DAYS;

  /**
   * Prefills Dealer Code/Description — preferring the real config API's `context` once
   * loaded, falling back to `DealerContextService` before it arrives. `companyCode` is
   * silently defaulted (not rendered), per `showCompanyCode="false"` in the template.
   * Reconciliation Date defaults to the last 1 month (up to today), matching Dealer
   * Ledger's/Warranty Cost Report's own default range, so Submit works immediately on load
   * despite the range being mandatory — default-one-month-date-range-17-09-2026-09_00_AM.md.
   */
  protected readonly initialValue = computed<CommonReportSearchFilters>(() => {
    const context = this.dealerContext();
    const config = this.config();
    const companyCodeDefault = config?.parameters.find((parameter) => parameter.name === 'companyCode')
      ?.defaultValue as string | undefined;

    return {
      dealerCode: config?.context.dealerCode ?? context.dealerCode,
      dealerDescription: config?.context.dealerDescription ?? context.dealerDescription,
      companyCode: companyCodeDefault ?? WARRANTY_RECONCILIATION_DEFAULT_COMPANY_CODE,
      ...defaultDateRange(),
    };
  });

  readonly searched = output<CommonReportSearchFilters>();
  readonly reset = output<void>();

  /** Submits the current field values — blocked while the Reconciliation Date range is missing/invalid. */
  protected onSubmit(): void {
    if (this.searchBar().isDateRangeInvalid()) return;
    this.searched.emit(this.searchBar().value());
  }

  /** Clears the Reconciliation Date range back to empty — called by the table header's Reset control. */
  resetFilters(): void {
    this.searchBar().reset();
    this.reset.emit();
  }
}
