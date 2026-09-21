import { TestBed } from '@angular/core/testing';
import { WarrantyReconciliationFilterComponent } from './warranty-reconciliation-filter.component';

describe('WarrantyReconciliationFilterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarrantyReconciliationFilterComponent],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(WarrantyReconciliationFilterComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the Date Range field (mandatory reconciliationDate) and no Company Code field (add-date-range-ui-17-09-2026-09_05_AM.md)', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('#report-search-bar-date-from')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-date-to')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code')).toBeFalsy();
  });

  it('renders no Dealer Code/Description fields of its own — that identity is shown by ReportDealerIdentityComponent above the page (dealer-identity-line-below-header-bar-21-09-2026-05_00_PM.md)', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-code')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-description')).toBeFalsy();
  });

  it('enables Show Report by default — Reconciliation Date defaults to the last 1 month (default-one-month-date-range-17-09-2026-09_00_AM.md)', () => {
    const fixture = createComponent();

    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');
    expect(dateFrom.value).toBeTruthy();
    expect(dateTo.value).toBeTruthy();

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-reconciliation-filter__submit-button',
    );
    expect(submitButton.disabled).toBe(false);
  });

  it('disables Show Report when a bound is cleared', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    dateFrom.value = '';
    dateFrom.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-reconciliation-filter__submit-button',
    );
    expect(submitButton.disabled).toBe(true);
  });

  it('disables Show Report when the range exceeds 366 days', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');

    dateFrom.value = '2020-04-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2022-04-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-reconciliation-filter__submit-button',
    );
    expect(submitButton.disabled).toBe(true);
  });

  it('disables Show Report when the selected date is before minDate (2020-04-01)', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');

    dateFrom.value = '2019-01-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2019-06-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-reconciliation-filter__submit-button',
    );
    expect(submitButton.disabled).toBe(true);
  });

  it('emits searched on Show Report click, with the current field values, once both bounds are chosen', () => {
    const fixture = createComponent();
    const searchedSpy = vi.fn();
    fixture.componentInstance.searched.subscribe(searchedSpy);

    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');
    dateFrom.value = '2026-06-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2026-07-31';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-reconciliation-filter__submit-button',
    );
    expect(submitButton.disabled).toBe(false);
    submitButton.click();

    expect(searchedSpy).toHaveBeenCalledTimes(1);
    const [value] = searchedSpy.mock.calls[0];
    expect(value.dateFrom).toBe('2026-06-01');
    expect(value.dateTo).toBe('2026-07-31');
  });
});
