import { ChangeDetectionStrategy, Component, computed, inject, output, signal, viewChild } from '@angular/core';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { ReportSearchBarComponent } from '../../../../shared/ui/report-search-bar/report-search-bar.component';
import {
  DealerLedgerFilterCheckboxOption,
  DealerLedgerFilterValue,
} from '../../models/dealer-ledger-filter-panel.model';

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
 * with Dealer Ledger's own "include details" checkbox group. Presentational: emits a
 * strongly-typed event on Search/Reset/Export and does not call any service/store
 * itself — no API integration (that is the consuming page's responsibility).
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

  private readonly dealerContext = inject(DealerContextService).dealerContext;
  protected readonly searchBar = viewChild.required(ReportSearchBarComponent);

  private readonly checkboxSelection = signal<string[]>([]);

  /** Prefills the common search fields from the current dealer's context (mocked auth API). */
  protected readonly initialValue = computed<CommonReportSearchFilters>(() => {
    const context = this.dealerContext();
    return {
      dealerCode: context.dealerCode,
      dealerDescription: context.dealerDescription,
      companyCode: context.companyCode,
      dateFrom: null,
      dateTo: null,
    };
  });

  /** Drives the Reset button's disabled state — nothing to clear when no field/checkbox has a value. */
  protected readonly hasActiveFilters = computed(() => {
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
  readonly exported = output<DealerLedgerFilterValue>();

  protected isChecked(optionKey: string): boolean {
    return this.checkboxSelection().includes(optionKey);
  }

  protected onCheckboxToggle(optionKey: string): void {
    this.checkboxSelection.update((current) =>
      current.includes(optionKey) ? current.filter((key) => key !== optionKey) : [...current, optionKey],
    );
  }

  protected onSearch(): void {
    if (this.searchBar().isDateRangeInvalid()) return;
    this.searched.emit(this.currentValue());
  }

  protected onReset(): void {
    this.searchBar().reset();
    this.checkboxSelection.set([]);
    this.reset.emit(this.currentValue());
  }

  protected onExport(): void {
    this.exported.emit(this.currentValue());
  }

  private currentValue(): DealerLedgerFilterValue {
    return { ...this.searchBar().value(), checkboxSelection: this.checkboxSelection() };
  }
}
