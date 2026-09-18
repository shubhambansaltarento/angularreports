import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextInstanceId = 0;

/**
 * A "typed dropdown" text input: the user can either type a free value or pick one from a
 * suggestion list, via the native `<input list>`/`<datalist>` pair — no custom overlay/
 * positioning logic needed, and it degrades to a plain text input if `options` is empty.
 * `ControlValueAccessor` so it drops into `formControlName` like any other form control.
 *
 * `options` is presently a static/mock suggestion source per field (no lookup API has been
 * specified yet — parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md, Open
 * decisions); swapping in a real lookup later only changes what feeds this input.
 */
@Component({
  selector: 'app-typeahead-input',
  templateUrl: './typeahead-input.component.html',
  styleUrl: './typeahead-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TypeaheadInputComponent,
      multi: true,
    },
  ],
})
export class TypeaheadInputComponent implements ControlValueAccessor {
  readonly inputId = input<string>(`typeahead-input-${nextInstanceId++}`);
  readonly label = input<string | null>(null);
  readonly placeholder = input('');
  /** Suggestion values shown in the native datalist — the user may still type anything else. */
  readonly options = input<string[]>([]);
  /** Smaller label/input sizing — for panels where several fields must fit without crowding out content below (e.g. Parts Packing List). */
  readonly compact = input(false);

  protected readonly datalistId = `${this.inputId()}-options`;
  protected value = '';
  protected disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onInput(value: string): void {
    this.value = value;
    this.onChange(value || null);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
