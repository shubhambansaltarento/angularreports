import { TestBed } from '@angular/core/testing';
import { DealerLedgerFilterComponent } from './dealer-ledger-filter.component';
import { DealerLedgerFilterValue } from '../../models/dealer-ledger-filter-panel.model';

describe('DealerLedgerFilterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealerLedgerFilterComponent],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(DealerLedgerFilterComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders no Dealer Code/Description fields of its own — that identity is shown by ReportDealerIdentityComponent above the page (dealer-identity-line-below-header-bar-21-09-2026-05_00_PM.md)', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-code')).toBeFalsy();
  });

  it('renders all five "include details" checkboxes and toggles selection count', () => {
    const fixture = createComponent();
    const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
      '.dealer-ledger-filter__checkbox input[type="checkbox"]',
    );
    expect(checkboxes.length).toBe(5);

    checkboxes[0].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('(1 selected)');
  });

  it('labels the checkbox group via role="group"/aria-labelledby, not fieldset/legend (include-details-left-align-16-09-2026-04_08_PM — avoids the legend/flex stacking bug)', () => {
    const fixture = createComponent();
    const group: HTMLElement = fixture.nativeElement.querySelector('.dealer-ledger-filter__checkbox-group');
    expect(group.tagName).not.toBe('FIELDSET');
    expect(group.getAttribute('role')).toBe('group');

    const labelledBy = group.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(fixture.nativeElement.querySelector(`#${labelledBy}`)?.textContent).toContain('Include Details');
  });

  it('renders no Search/Export/Reset/Submit action row of its own — Show Report lives on the page, Export/Reset in the table header', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('.dealer-ledger-filter__actions')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.dealer-ledger-filter__reset-row')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.dealer-ledger-filter__submit-row')).toBeFalsy();
  });

  it('defaults the Report Range to a 1-month window ending today', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const toIso = (d: Date) => d.toISOString().slice(0, 10);

    expect(dateTo.value).toBe(toIso(today));
    expect(dateFrom.value).toBe(toIso(oneMonthAgo));
  });

  it('does not emit searched when a field or checkbox changes — only Submit triggers it (submit-button-replaces-auto-search-16-09-2026-04_54_PM)', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.searched.subscribe(() => (emitted = true));

    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      '.dealer-ledger-filter__checkbox input[type="checkbox"]',
    );
    checkbox.click();
    fixture.detectChanges();

    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    dateFrom.value = '2024-01-01';
    dateFrom.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitted).toBe(false);
  });

  it('emits searched with the current checkbox selection only when submit() is called (the page\'s "Show Report" button)', () => {
    const fixture = createComponent();
    let emitted: DealerLedgerFilterValue | undefined;
    fixture.componentInstance.searched.subscribe((value: DealerLedgerFilterValue) => (emitted = value));

    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      '.dealer-ledger-filter__checkbox input[type="checkbox"]',
    );
    checkbox.click();
    fixture.detectChanges();

    expect(emitted).toBeUndefined();

    fixture.componentInstance.submit();

    expect(emitted).toBeTruthy();
    expect(emitted?.checkboxSelection).toEqual(['oe']);
  });

  it('reports submit as disabled and does not emit searched when the date range is invalid', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.searched.subscribe(() => (emitted = true));

    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');
    dateFrom.value = '2024-02-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2024-01-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.isSubmitDisabled()).toBe(true);

    fixture.componentInstance.submit();
    expect(emitted).toBe(false);
  });
});
