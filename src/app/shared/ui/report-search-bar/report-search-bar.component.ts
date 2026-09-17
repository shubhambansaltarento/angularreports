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

  /**
   * When true, Dealer Code, Dealer Description, and Company Code render as read-only text
   * (sourced from `initialValue`) instead of editable inputs — Dealer Ledger's
   * presentation, per its filter-panel spec. The date range is unaffected.
   */
  readonly readonlyDealerFields = input(false);

  /**
   * When true, lays out fields as: Dealer Code/Dealer Description/Company Code together
   * on one row, then Date From/Date To together on a second row below — Dealer Ledger's
   * filter-panel layout, per its spec. When false, all fields share one row (default).
   */
  readonly stacked = input(false);

  /**
   * When false, Company Code is omitted entirely (not just hidden) — some reports' real
   * search forms have no Company Code field, per
   * warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md. Defaults to
   * `true` so every existing consumer (Dealer Ledger, Goods Acknowledgement, the
   * search-only reports) is unaffected.
   */
  readonly showCompanyCode = input(true);

  /**
   * Optional section headings shown above the identity-fields group and the date-range
   * control respectively (e.g. "Dealer Details"/"Specify Date Range", matching Warranty
   * Cost Report's real SAP form) — `null` (default) renders neither, preserving every
   * existing consumer's current no-heading appearance.
   * warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md.
   */
  readonly identitySectionLabel = input<string | null>(null);
  readonly dateSectionLabel = input<string | null>(null);

  /**
   * When false, the Date Range section is omitted entirely (not just hidden), and its
   * validity no longer gates the submit button — some reports' real search forms have no
   * date-range parameter at all, per
   * warranty-reconciliation/api-integration-17-09-2026-08_37_AM.md. Defaults to `true` so
   * every existing consumer (Dealer Ledger, Warranty Cost Report) is unaffected.
   */
  readonly showDateRange = input(true);

  /**
   * When true, both Date From and Date To must be chosen — with no default value — before
   * the date range is considered valid; a single bound (or none) counts as invalid. Some
   * reports' date-range parameter is mandatory with no default, unlike Dealer Ledger/
   * Warranty Cost Report's optional, defaulted range — warranty-reconciliation
   * add-date-range-ui-17-09-2026-09_05_AM.md. Defaults to `false` so every existing
   * consumer is unaffected.
   */
  readonly requireDateRange = input(false);

  /** Optional inclusive lower bound (ISO `yyyy-MM-dd`) — dates before it make the range invalid. `null` (default) means no lower bound. */
  readonly minDate = input<string | null>(null);

  /** Optional inclusive upper bound (ISO `yyyy-MM-dd`) — dates after it make the range invalid. `null` (default) means no upper bound. */
  readonly maxDate = input<string | null>(null);

  /** Optional maximum span, in days, between Date From and Date To. `null` (default) means no span limit. */
  readonly maxRangeDays = input<number | null>(null);

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

  /**
   * True when the date range fails any applicable check: Date From after Date To; either
   * bound missing when `requireDateRange` is set; either bound outside `minDate`/`maxDate`;
   * or the span between bounds exceeding `maxRangeDays`.
   */
  readonly isDateRangeInvalid = computed(() => {
    if (!this.showDateRange()) return false;
    const { dateFrom, dateTo } = this.formValue();

    if (this.requireDateRange() && (!dateFrom || !dateTo)) return true;
    if (dateFrom && dateTo && dateFrom > dateTo) return true;

    const minDate = this.minDate();
    const maxDate = this.maxDate();
    if (dateFrom && minDate && dateFrom < minDate) return true;
    if (dateFrom && maxDate && dateFrom > maxDate) return true;
    if (dateTo && minDate && dateTo < minDate) return true;
    if (dateTo && maxDate && dateTo > maxDate) return true;

    const maxRangeDays = this.maxRangeDays();
    if (dateFrom && dateTo && maxRangeDays != null) {
      const spanDays = (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24);
      if (spanDays > maxRangeDays) return true;
    }

    return false;
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

  /** Patches a subset of fields without touching the rest — e.g. re-applying a default date range after `reset()`. */
  patch(value: Partial<CommonReportSearchFilters>): void {
    this.form.patchValue(value);
  }
}
