import { TestBed } from '@angular/core/testing';
import { WarrantyCostReportFilterComponent } from './warranty-cost-report-filter.component';

describe('WarrantyCostReportFilterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarrantyCostReportFilterComponent],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(WarrantyCostReportFilterComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders no Company Code field and no submit button of its own — the page owns "Show Report"', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('button')).toBeFalsy();
  });

  it('renders no Dealer Code/Description fields of its own — that identity is shown by ReportDealerIdentityComponent above the page (dealer-identity-line-below-header-bar-21-09-2026-05_00_PM.md)', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-code')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-description')).toBeFalsy();
  });

  it('emits searched with the config companyCode on submit()', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('config', {
      reportCode: 'WARRANTY_COST',
      title: 'Warranty Cost',
      configVersion: '2026.09.1',
      context: { dealerCode: '10015', dealerDescription: 'PAWAN SARKAR AUTOMOBILES' },
      parameters: [{ name: 'companyCode', label: 'Company Code', defaultValue: 'TSL' }],
    });
    fixture.detectChanges();

    const searchedSpy = vi.fn();
    fixture.componentInstance.searched.subscribe(searchedSpy);

    fixture.componentInstance.submit();

    expect(searchedSpy).toHaveBeenCalledTimes(1);
    const [filters] = searchedSpy.mock.calls[0];
    expect(filters.companyCode).toBe('TSL');
    expect(filters.dealerCode).toBe('10015');
  });

  it('reports submit as disabled and does not emit when the date range is invalid', () => {
    const fixture = createComponent();
    const searchedSpy = vi.fn();
    fixture.componentInstance.searched.subscribe(searchedSpy);

    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');
    dateFrom.value = '2024-02-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2024-01-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.isSubmitDisabled()).toBe(true);

    fixture.componentInstance.submit();
    expect(searchedSpy).not.toHaveBeenCalled();
  });
});
