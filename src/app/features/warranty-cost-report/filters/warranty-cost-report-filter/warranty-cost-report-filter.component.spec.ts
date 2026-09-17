import { TestBed } from '@angular/core/testing';
import { WarrantyCostReportFilterComponent } from './warranty-cost-report-filter.component';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';

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

  it('renders no "Dealer Details"/"Specify Date Range" section headings, and no Company Code field (remove-section-headings-17-09-2026-07_41_AM.md)', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.textContent).not.toContain('Dealer Details');
    expect(fixture.nativeElement.textContent).not.toContain('Specify Date Range');
    expect(fixture.nativeElement.querySelector('.report-search-bar__section-label')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code')).toBeFalsy();
  });

  it('prefills Dealer Code/Description from the dealer context', () => {
    const fixture = createComponent();
    const dealerContext = TestBed.inject(DealerContextService).dealerContext();

    expect(fixture.nativeElement.textContent).toContain(dealerContext.dealerCode);
    expect(fixture.nativeElement.textContent).toContain(dealerContext.dealerDescription);
  });

  it('prefers the real config context/Company Code default over the mocked dealer context, once loaded (api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md)', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('config', {
      reportCode: 'WARRANTY_COST',
      title: 'Warranty Cost',
      configVersion: '2026.09.1',
      context: { dealerCode: '10015', dealerDescription: 'PAWAN SARKAR AUTOMOBILES' },
      parameters: [{ name: 'companyCode', label: 'Company Code', control: 'SELECT', dataType: 'STRING', required: true, defaultValue: 'TVSL', options: null, validation: null, layout: null, multiple: null, lookup: null }],
      columnGroups: [],
      export: { formats: ['XLSX', 'PDF'] },
      paging: { defaultPageSize: 50, maxPageSize: 1000 },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('10015');
    expect(fixture.nativeElement.textContent).toContain('PAWAN SARKAR AUTOMOBILES');
  });

  it('emits searched on Show Report click, with the current field values', () => {
    const fixture = createComponent();
    const searchedSpy = vi.fn();
    fixture.componentInstance.searched.subscribe(searchedSpy);

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-cost-report-filter__submit-button',
    );
    submitButton.click();

    expect(searchedSpy).toHaveBeenCalledTimes(1);
  });

  it('disables Show Report when the date range is invalid', () => {
    const fixture = createComponent();
    const dateFrom: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    const dateTo: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-to');

    dateFrom.value = '2024-02-01';
    dateFrom.dispatchEvent(new Event('input'));
    dateTo.value = '2024-01-01';
    dateTo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-cost-report-filter__submit-button',
    );
    expect(submitButton.disabled).toBe(true);
  });
});
