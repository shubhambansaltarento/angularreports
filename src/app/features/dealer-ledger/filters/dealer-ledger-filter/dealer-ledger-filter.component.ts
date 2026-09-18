import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { ReportSearchBarComponent } from '../../../../shared/ui/report-search-bar/report-search-bar.component';
import { defaultDateRange } from '../../../../shared/utils/default-date-range';
import { DealerLedgerConfig } from '../../models/dealer-ledger-config.model';
import { DealerLedgerFilterCheckboxOption, DealerLedgerFilterValue } from '../../models/dealer-ledger-filter-panel.model';

/** Dealer Ledger's own "include details" checkbox group (report-specific parameter, per §6). */
const CHECKBOX_OPTIONS: DealerLedgerFilterCheckboxOption[] = [
  { key: 'oe', label: 'With OE Details' },
  { key: 'sp', label: 'With SP Details' },
  { key: 'ac', label: 'With AC Details' },
  { key: 'ev', label: 'With EV Details' },
  { key: 'acwsh', label: 'With ACWSH Details' },
];

/**
 * Filter panel for the Dealer Ledger feature — composes the shared, platform-common
 * `ReportSearchBarComponent` (Dealer Code/Dealer Description/Company Code/Date Range)
 * with Dealer Ledger's own "include details" checkbox group. Presentational: does not
 * call any service/store itself (no API integration — that is the consuming page's
 * responsibility).
 *
 * Search only fires on an explicit Submit click (submit-button-replaces-auto-search-16-09-2026-04_54_PM.md)
 * — editing any of the six fields (Dealer Code/Description/Company Code/Date From/Date
 * To/checkboxes) never triggers an API call by itself. Export lives in the table's own
 * toolbar, and Reset is triggered by the table's header Reset control via `resetFilters()`.
 */
@Component({
  selector: 'app-dealer-ledger-filter',
  imports: [ReportSearchBarComponent],
  templateUrl: './dealer-ledger-filter.component.html',
  styleUrl: './dealer-ledger-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerFilterComponent {
  protected readonly checkboxOptions = CHECKBOX_OPTIONS;

  /** Real config API response (context/companyCode default), once loaded — map-config-response-to-ui-16-09-2026-02_41_PM.md. */
  readonly config = input<DealerLedgerConfig | null>(null);

  private readonly dealerContext = inject(DealerContextService).dealerContext;
  protected readonly searchBar = viewChild.required(ReportSearchBarComponent);

  private readonly checkboxSelection = signal<string[]>([]);

  /**
   * Prefills the common search fields — preferring the real config API's `context`/
   * Company Code default once loaded, falling back to `DealerContextService` (mocked
   * auth) before it arrives or if it fails — plus a default 1-month Report Range (default-one-month-date-range-16-09-2026-01_59_PM).
   */
  protected readonly initialValue = computed<CommonReportSearchFilters>(() => {
    const context = this.dealerContext();
    const config = this.config();
    const companyCodeDefault = config?.parameters.find((parameter) => parameter.name === 'companyCode')
      ?.defaultValue as string | undefined;

    return {
      dealerCode: config?.context.dealerCode ?? context.dealerCode,
      dealerDescription: config?.context.dealerDescription ?? context.dealerDescription,
      companyCode: companyCodeDefault ?? context.companyCode,
      ...defaultDateRange(),
    };
  });

  /** Drives the table header's Reset control disabled state — nothing to clear when no field/checkbox has a value. */
  readonly hasActiveFilters = computed(() => {
    const value = this.searchBar().value();
    return Boolean(
      value.dealerCode ||
        value.dealerDescription ||
        value.companyCode ||
        value.dateFrom ||
        value.dateTo ||
        this.checkboxSelection().length,
    );
  });

  protected readonly selectedCheckboxCount = computed(() => this.checkboxSelection().length);

  readonly searched = output<DealerLedgerFilterValue>();
  readonly reset = output<DealerLedgerFilterValue>();

  /**
   * Submits the current filter/checkbox values — the only trigger for a data API call
   * (submit-button-replaces-auto-search-16-09-2026-04_54_PM). Public: the page's own
   * "Show Report" button (dealer-ledger-list.component.html) triggers this directly —
   * the filter panel no longer renders its own submit button
   * (remove-embedded-submit-button-single-show-report-action-17-09-2026-*.md).
   */
  submit(): void {
    if (this.searchBar().isDateRangeInvalid()) return;
    this.searched.emit(this.currentValue());
  }

  /** Whether the current Date Range is invalid — drives the page's "Show Report" button disabled state. */
  isSubmitDisabled(): boolean {
    return this.searchBar().isDateRangeInvalid();
  }

  protected isChecked(optionKey: string): boolean {
    return this.checkboxSelection().includes(optionKey);
  }

  protected onCheckboxToggle(optionKey: string): void {
    this.checkboxSelection.update((current) =>
      current.includes(optionKey) ? current.filter((key) => key !== optionKey) : [...current, optionKey],
    );
  }

  /** Clears filters/checkboxes back to defaults (dealer context fields + the 1-month Report Range) — called by the table header's Reset control. */
  resetFilters(): void {
    this.searchBar().reset();
    this.searchBar().patch(defaultDateRange());
    this.checkboxSelection.set([]);
    this.reset.emit(this.currentValue());
  }

  private currentValue(): DealerLedgerFilterValue {
    return { ...this.searchBar().value(), checkboxSelection: this.checkboxSelection() };
  }
}
