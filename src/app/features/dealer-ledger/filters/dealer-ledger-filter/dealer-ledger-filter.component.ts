import { toSignal } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { map } from 'rxjs/operators';
import {
  DealerLedgerFilterCheckboxMode,
  DealerLedgerFilterCheckboxOption,
  DealerLedgerFilterValue,
} from '../../models/dealer-ledger-filter-panel.model';

/** Default checkbox options — the Dealer Ledger's 5 transaction types. Overridable via input. */
const DEFAULT_CHECKBOX_OPTIONS: DealerLedgerFilterCheckboxOption[] = [
  { key: 'Invoice', label: 'Invoice' },
  { key: 'Payment', label: 'Payment' },
  { key: 'Credit Note', label: 'Credit Note' },
  { key: 'Debit Note', label: 'Debit Note' },
  { key: 'Adjustment', label: 'Adjustment' },
];

interface DealerLedgerFilterFormControls {
  dateFrom: FormControl<string | null>;
  dateTo: FormControl<string | null>;
  dealerSearch: FormControl<string | null>;
  checkboxSelection: FormControl<string[]>;
}

/** Cross-field validator: "Date From" must not be after "Date To" when both are set. */
function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const dateFrom = group.get('dateFrom')?.value as string | null;
    const dateTo = group.get('dateTo')?.value as string | null;

    return dateFrom && dateTo && dateFrom > dateTo ? { dateRangeInvalid: true } : null;
  };
}

/**
 * Configuration-driven filter panel for the Dealer Ledger feature.
 *
 * Presentational: emits strongly-typed events on Search/Reset/Export and does not call any
 * service/store itself — no API integration (that is the consuming page's responsibility
 * once the Dealer Ledger API is wired up).
 */
@Component({
  selector: 'app-dealer-ledger-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './dealer-ledger-filter.component.html',
  styleUrl: './dealer-ledger-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerFilterComponent {
  /** Configurable checkbox options — defaults to the 5 Dealer Ledger transaction types. */
  readonly checkboxOptions = input<DealerLedgerFilterCheckboxOption[]>(DEFAULT_CHECKBOX_OPTIONS);

  /** Configuration-driven selection behavior: 'single' (mutually exclusive) or 'multi'. */
  readonly checkboxMode = input<DealerLedgerFilterCheckboxMode>('multi');

  /** Label rendered above the checkbox group (fieldset legend). */
  readonly checkboxGroupLabel = input<string>('Transaction Type');

  /** Optional initial value to pre-populate the form (e.g. from a persisted filter state). */
  readonly initialValue = input<Partial<DealerLedgerFilterValue> | null>(null);

  /** Emits the current form value when the user clicks Search and the form is valid. */
  readonly searched = output<DealerLedgerFilterValue>();

  /** Emits the (now-cleared) form value when the user clicks Reset. */
  readonly reset = output<DealerLedgerFilterValue>();

  /** Emits the current form value when the user clicks Export. */
  readonly exported = output<DealerLedgerFilterValue>();

  protected readonly form = new FormGroup<DealerLedgerFilterFormControls>(
    {
      dateFrom: new FormControl<string | null>(null),
      dateTo: new FormControl<string | null>(null),
      dealerSearch: new FormControl<string | null>(null),
      checkboxSelection: new FormControl<string[]>([], { nonNullable: true }),
    },
    { validators: dateRangeValidator() },
  );

  // Mapped through getRawValue() on every change (rather than relying on valueChanges'
  // own emitted value) so the Signal always reflects the fully-typed DealerLedgerFilterValue
  // shape, regardless of Angular's Partial-value typing for potentially-disabled controls.
  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  private readonly submitAttempted = signal(false);

  /** True only once the user has attempted a Search while the date range is invalid — avoids showing the error on every keystroke. */
  protected readonly isDateRangeInvalid = computed(() => {
    this.formValue(); // establishes the reactive dependency so this recomputes on every value change
    return this.submitAttempted() && this.form.hasError('dateRangeInvalid');
  });

  /** Drives the Reset button's disabled state — nothing to clear when no field has a value. */
  protected readonly hasActiveFilters = computed(() => {
    const value = this.formValue();
    return Boolean(value.dateFrom || value.dateTo || value.dealerSearch || value.checkboxSelection.length);
  });

  /** Shown next to the checkbox group's legend so the current selection count is always visible. */
  protected readonly selectedCheckboxCount = computed(() => this.formValue().checkboxSelection.length);

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value) {
        this.form.patchValue(value);
      }
    });
  }

  protected isChecked(optionKey: string): boolean {
    return this.formValue().checkboxSelection.includes(optionKey);
  }

  protected onCheckboxToggle(optionKey: string): void {
    const control = this.form.controls.checkboxSelection;
    const current = control.value;
    const isSelected = current.includes(optionKey);

    if (this.checkboxMode() === 'single') {
      // Single-select mode: checking one option clears any other selection (radio-like
      // behavior implemented with checkbox controls, per configuration-driven requirement).
      control.setValue(isSelected ? [] : [optionKey]);
      return;
    }

    const next = isSelected ? current.filter((key) => key !== optionKey) : [...current, optionKey];
    control.setValue(next);
  }

  protected onSearch(): void {
    this.submitAttempted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.searched.emit(this.form.getRawValue());
  }

  protected onReset(): void {
    this.form.reset({ dateFrom: null, dateTo: null, dealerSearch: null, checkboxSelection: [] });
    this.submitAttempted.set(false);
    this.reset.emit(this.form.getRawValue());
  }

  protected onExport(): void {
    this.exported.emit(this.form.getRawValue());
  }
}
