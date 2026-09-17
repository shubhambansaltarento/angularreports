import { TestBed } from '@angular/core/testing';
import { ReportSearchBarComponent } from './report-search-bar.component';

describe('ReportSearchBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSearchBarComponent],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ReportSearchBarComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('omits Company Code entirely when showCompanyCode is false, in both editable and read-only modes (warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md)', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('showCompanyCode', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code')).toBeFalsy();

    fixture.componentRef.setInput('readonlyDealerFields', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code')).toBeFalsy();
  });

  it('renders no section headings by default, and both when identitySectionLabel/dateSectionLabel are set', () => {
    const fixture = createComponent();
    let headings: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.report-search-bar__section-label');
    expect(headings.length).toBe(0);

    fixture.componentRef.setInput('identitySectionLabel', 'Dealer Details');
    fixture.componentRef.setInput('dateSectionLabel', 'Specify Date Range');
    fixture.detectChanges();

    headings = fixture.nativeElement.querySelectorAll('.report-search-bar__section-label');
    expect(Array.from(headings).map((heading) => heading.textContent?.trim())).toEqual([
      'Dealer Details',
      'Specify Date Range',
    ]);
  });

  it('renders all five common fields, initially empty', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.value()).toEqual({
      dealerCode: null,
      dealerDescription: null,
      companyCode: null,
      dateFrom: null,
      dateTo: null,
    });
  });

  it('patches the form from initialValue, and value() reflects typed input', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('initialValue', { dealerCode: 'DLR-1', companyCode: 'CO-1' });
    fixture.detectChanges();

    expect(fixture.componentInstance.value().dealerCode).toBe('DLR-1');
    expect(fixture.componentInstance.value().companyCode).toBe('CO-1');

    const descriptionInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '#report-search-bar-dealer-description',
    );
    descriptionInput.value = 'Some Dealer';
    descriptionInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value().dealerDescription).toBe('Some Dealer');
  });

  it('renders Date Range as a single, non-wrapping line with independently labeled From/To pickers (date-range-single-line-17-09-2026-06_10_AM.md)', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.textContent).toContain('Date Range');

    const fromLabel: HTMLLabelElement = fixture.nativeElement.querySelector('label[for="report-search-bar-date-from"]');
    const toLabel: HTMLLabelElement = fixture.nativeElement.querySelector('label[for="report-search-bar-date-to"]');
    expect(fromLabel.textContent?.trim()).toBe('From');
    expect(toLabel.textContent?.trim()).toBe('To');

    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');
    expect(dateFrom.type).toBe('date');
    expect(dateTo.type).toBe('date');

    const row: HTMLElement = fixture.nativeElement.querySelector('.report-search-bar__date-range');
    expect(getComputedStyle(row).flexWrap).toBe('nowrap');
  });

  it('flags an invalid date range and shows an inline error message', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');

    dateFrom.value = '2024-02-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2024-01-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.isDateRangeInvalid()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('"Date From" must not be after "Date To".');
  });

  it('does not flag a valid date range', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');

    dateFrom.value = '2024-01-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2024-02-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.isDateRangeInvalid()).toBe(false);
  });

  it('renders Dealer Code, Dealer Description, and Company Code as read-only text when readonlyDealerFields is set', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('initialValue', {
      dealerCode: 'DLR-1',
      dealerDescription: 'Some Dealer',
      companyCode: 'CO-1',
    });
    fixture.componentRef.setInput('readonlyDealerFields', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-code').tagName).not.toBe('INPUT');
    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-code').textContent.trim()).toBe('DLR-1');
    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-description').tagName).not.toBe('INPUT');
    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-description').textContent.trim()).toBe(
      'Some Dealer',
    );
    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code').tagName).not.toBe('INPUT');
    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code').textContent.trim()).toBe('CO-1');
  });

  it('renders read-only identity fields inside a single shared row/box, not three separate cards (header-center-align-single-row-identity-fields-17-09-2026-06_05_AM.md)', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('initialValue', {
      dealerCode: 'DLR-1',
      dealerDescription: 'Some Dealer',
      companyCode: 'CO-1',
    });
    fixture.componentRef.setInput('readonlyDealerFields', true);
    fixture.detectChanges();

    const groups = fixture.nativeElement.querySelectorAll('.report-search-bar__identity-group');
    expect(groups.length).toBe(1);

    const cols = groups[0].querySelectorAll('.report-search-bar__identity-col');
    expect(cols.length).toBe(3);
    for (const col of Array.from(cols)) {
      expect((col as HTMLElement).querySelector('.report-search-bar__card-label')).toBeTruthy();
      expect((col as HTMLElement).querySelector('.report-search-bar__card-value')).toBeTruthy();
    }
  });

  it('patch() updates a subset of fields without touching the rest', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('initialValue', { dealerCode: 'DLR-1', companyCode: 'CO-1' });
    fixture.detectChanges();

    fixture.componentInstance.patch({ dateFrom: '2026-08-16', dateTo: '2026-09-16' });
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual({
      dealerCode: 'DLR-1',
      dealerDescription: null,
      companyCode: 'CO-1',
      dateFrom: '2026-08-16',
      dateTo: '2026-09-16',
    });
  });

  it('omits the Date Range section entirely and never flags invalidity when showDateRange is false (warranty-reconciliation/api-integration-17-09-2026-08_37_AM.md)', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('showDateRange', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Date Range');
    expect(fixture.nativeElement.querySelector('#report-search-bar-date-from')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-date-to')).toBeFalsy();
    expect(fixture.componentInstance.isDateRangeInvalid()).toBe(false);
  });

  it('reset() clears all fields back to empty', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('initialValue', { dealerCode: 'DLR-1' });
    fixture.detectChanges();
    expect(fixture.componentInstance.value().dealerCode).toBe('DLR-1');

    fixture.componentInstance.reset();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual({
      dealerCode: null,
      dealerDescription: null,
      companyCode: null,
      dateFrom: null,
      dateTo: null,
    });
  });
});
