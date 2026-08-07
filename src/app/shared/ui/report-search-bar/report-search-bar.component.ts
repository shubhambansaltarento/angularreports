import { toSignal } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { CommonReportSearchFilters } from '../../models/report-search-filters.model';

interface ReportSearchBarFormControls {
  dealerCode: FormControl<string | null>;
  dealerDescription: FormControl<string | null>;
  companyCode: FormControl<string | null>;
  dateFrom: FormControl<string | null>;
  dateTo: FormControl<string | null>;
}

const EMPTY_VALUE: CommonReportSearchFilters = {
  dealerCode: null,
  dealerDescription: null,
  companyCode: null,
  dateFrom: null,
  dateTo: null,
};

/**
 * The common search-parameter shell reused by every report on the platform — Dealer
 * Code, Dealer Description, Company Code, and a Date Range (Multi-Report Framework
 * Specification §6/§3.3). Purely presentational and domain-agnostic, like
 * `shared/ui/data-table`: it holds no fetch/store logic and defines no action buttons
 * of its own, since button labels/behavior genuinely differ per report (Search/Reset/
 * Export for Dealer Ledger, Display/Update/Clear for Goods Acknowledgement). A
 * consuming report reads this component's `value()` (typically via a `viewChild`
 * reference) when its own action button is clicked, and calls `reset()` for its own
 * Clear/Reset action.
 */
@Component({
  selector: 'app-report-search-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './report-search-bar.component.html',
  styleUrl: './report-search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSearchBarComponent {
  /** Prefill — typically the current dealer's context (DealerContextService) mapped onto this shape. */
  readonly initialValue = input<Partial<CommonReportSearchFilters> | null>(null);

  protected readonly form = new FormGroup<ReportSearchBarFormControls>({
    dealerCode: new FormControl<string | null>(null),
    dealerDescription: new FormControl<string | null>(null),
    companyCode: new FormControl<string | null>(null),
    dateFrom: new FormControl<string | null>(null),
    dateTo: new FormControl<string | null>(null),
  });

  // Mapped through getRawValue() on every change (rather than the emitted valueChanges
  // value) so the Signal always reflects the fully-typed CommonReportSearchFilters shape,
  // matching the established convention from DealerLedgerFilterComponent.
  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  /** Current value of the four common search fields — read by the consuming report's own action. */
  readonly value = computed<CommonReportSearchFilters>(() => this.formValue());

  /** True once both dates are set and Date From is after Date To. */
  readonly isDateRangeInvalid = computed(() => {
    const { dateFrom, dateTo } = this.formValue();
    return Boolean(dateFrom && dateTo && dateFrom > dateTo);
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value) {
        this.form.patchValue(value);
      }
    });
  }

  /** Clears all four fields back to empty — called by the consuming report's own Reset/Clear action. */
  reset(): void {
    this.form.reset(EMPTY_VALUE);
  }
}
