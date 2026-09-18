import { TestBed } from '@angular/core/testing';
import { PartsPackingListFilterComponent } from './parts-packing-list-filter.component';
import { PartsPackingListFilters } from '../../models/parts-packing-list-filters.model';

describe('PartsPackingListFilterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PartsPackingListFilterComponent] }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(PartsPackingListFilterComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders no submit button of its own — the page owns the single Process/"Show Report" button', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('button')).toBeFalsy();
  });

  it('defaults the Date Range to a 1-month window ending today', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#parts-packing-list-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#parts-packing-list-date-to');

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const toIso = (d: Date) => d.toISOString().slice(0, 10);

    expect(dateTo.value).toBe(toIso(today));
    expect(dateFrom.value).toBe(toIso(oneMonthAgo));
  });

  it('emits searched with every field on submit()', () => {
    const fixture = createComponent();
    let emitted: PartsPackingListFilters | undefined;
    fixture.componentInstance.searched.subscribe((value) => (emitted = value));

    const invoiceInput: HTMLInputElement = fixture.nativeElement.querySelector('#parts-packing-list-invoice-number');
    invoiceInput.value = 'INV-1';
    invoiceInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.componentInstance.submit();

    expect(emitted?.invoiceNumber).toBe('INV-1');
    expect(emitted?.dateFrom).toEqual(expect.any(String));
  });

  it('reports submit as disabled and does not emit when the Date Range is missing/invalid', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.searched.subscribe(() => (emitted = true));

    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#parts-packing-list-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#parts-packing-list-date-to');
    dateFrom.value = '2026-09-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2026-08-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.isSubmitDisabled()).toBe(true);

    fixture.componentInstance.submit();
    expect(emitted).toBe(false);
  });
});
