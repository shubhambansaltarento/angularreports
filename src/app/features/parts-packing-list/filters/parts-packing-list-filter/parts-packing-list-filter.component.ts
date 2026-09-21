import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadInputComponent } from '../../../../shared/ui/typeahead-input/typeahead-input.component';
import { defaultDateRange } from '../../../../shared/utils/default-date-range';
import { PartsPackingListFilters } from '../../models/parts-packing-list-filters.model';

/**
 * Filter panel for Parts Packing List, matching the reference SAP UI: Input Parameters
 * (Invoice Number/Delivery Number) plus a Filter Menu (Date Range), each
 * field a "typed dropdown" (`TypeaheadInputComponent`) — parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md.
 * This report's field set does not overlap with the shared `ReportSearchBarComponent`
 * (no Dealer Code/Description/Company Code here), so it does not reuse it.
 *
 * Presentational only: no service/store call of its own. Follows the single "Show
 * Report"/Process button convention (single-show-report-button-replaces-embedded-submit-17-09-2026-04_31_PM.md)
 * — this component renders no submit button; the consuming page's own button calls the
 * public `submit()`/`isSubmitDisabled()` below.
 */
@Component({
  selector: 'app-parts-packing-list-filter',
  imports: [ReactiveFormsModule, TypeaheadInputComponent],
  templateUrl: './parts-packing-list-filter.component.html',
  styleUrl: './parts-packing-list-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartsPackingListFilterComponent {
  private readonly formBuilder = new FormBuilder();

  protected readonly form = this.formBuilder.group({
    invoiceNumber: this.formBuilder.control<string | null>(null),
    deliveryNumber: this.formBuilder.control<string | null>(null),
    dateFrom: this.formBuilder.control<string | null>(defaultDateRange().dateFrom),
    dateTo: this.formBuilder.control<string | null>(defaultDateRange().dateTo),
  });

  readonly searched = output<PartsPackingListFilters>();

  /** Submits the current filter values — the page's Process/"Show Report" button calls this. */
  submit(): void {
    if (this.isDateRangeInvalid()) return;
    const value = this.form.getRawValue();
    this.searched.emit({
      invoiceNumber: value.invoiceNumber ?? undefined,
      deliveryNumber: value.deliveryNumber ?? undefined,
      dateFrom: value.dateFrom ?? undefined,
      dateTo: value.dateTo ?? undefined,
    });
  }

  isSubmitDisabled(): boolean {
    return this.isDateRangeInvalid();
  }

  /** The Date Range is required (per the real config's `fromDate`/`toDate` both `required: true`) and must not be inverted. */
  private isDateRangeInvalid(): boolean {
    const { dateFrom, dateTo } = this.form.value;
    if (!dateFrom || !dateTo) return true;
    return dateFrom > dateTo;
  }
}
