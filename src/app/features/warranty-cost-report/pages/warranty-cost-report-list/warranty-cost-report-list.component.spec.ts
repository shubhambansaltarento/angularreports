import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WarrantyCostReportListComponent } from './warranty-cost-report-list.component';
import { WarrantyCostService } from '../../services/warranty-cost.service';
import { WarrantyCostStore } from '../../store/warranty-cost.store';

const EMPTY_SUMMARY = {
  totalNdpRate: 0,
  totalExcise: 0,
  totalSalesTax: 0,
  totalLabour: 0,
  totalOctroi: 0,
  totalServiceTax: 0,
  totalCost: 0,
  partsValue: 0,
  totalFreight: 0,
  totalDemurrage: 0,
  totalValue: 0,
};

describe('WarrantyCostReportListComponent', () => {
  let searchSpy: ReturnType<typeof vi.fn>;
  let refreshSpy: ReturnType<typeof vi.fn>;
  let getConfigSpy: ReturnType<typeof vi.fn>;
  let storeStub: Partial<WarrantyCostStore>;

  beforeEach(async () => {
    searchSpy = vi.fn();
    refreshSpy = vi.fn();
    getConfigSpy = vi.fn().mockReturnValue(of(null));

    storeStub = {
      loading: signal(false),
      hasSearched: signal(false),
      error: signal<string | null>(null),
      statement: signal(null) as unknown as WarrantyCostStore['statement'],
      search: searchSpy as unknown as WarrantyCostStore['search'],
      refresh: refreshSpy as unknown as WarrantyCostStore['refresh'],
      dismissError: vi.fn() as unknown as WarrantyCostStore['dismissError'],
    };

    await TestBed.configureTestingModule({
      imports: [WarrantyCostReportListComponent],
      providers: [
        { provide: WarrantyCostStore, useValue: storeStub },
        { provide: WarrantyCostService, useValue: { getConfig: getConfigSpy } },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(WarrantyCostReportListComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the header bar and filter, with no automatic search on load', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('app-report-header-bar').textContent).toContain('Warranty Cost Report');
    expect(fixture.nativeElement.querySelector('app-warranty-cost-report-filter')).toBeTruthy();
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('does not render the viewer/statement before the first Show Report click', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('app-html-pdf-viewer')).toBeFalsy();
  });

  it('shows the loading indicator (and no viewer) while store.loading() is true', () => {
    const fixture = createComponent();
    (storeStub.hasSearched as ReturnType<typeof signal<boolean>>).set(true);
    (storeStub.loading as ReturnType<typeof signal<boolean>>).set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-loading-indicator')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-html-pdf-viewer')).toBeFalsy();
  });

  it('renders the statement inside the shared viewer once hasSearched is true and dealerGroups is non-empty', () => {
    const fixture = createComponent();
    (storeStub.hasSearched as ReturnType<typeof signal<boolean>>).set(true);
    (storeStub.statement as ReturnType<typeof signal<unknown>>).set({
      dealerGroups: [{ dealerCode: '1', dealerName: 'X', rows: [], summary: EMPTY_SUMMARY }],
      grandTotal: EMPTY_SUMMARY,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-html-pdf-viewer')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-warranty-cost-statement')).toBeTruthy();
  });

  it('hides the viewer when the statement has zero dealer groups, even after hasSearched is true', () => {
    const fixture = createComponent();
    (storeStub.hasSearched as ReturnType<typeof signal<boolean>>).set(true);
    (storeStub.statement as ReturnType<typeof signal<unknown>>).set({ dealerGroups: [], grandTotal: EMPTY_SUMMARY });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-html-pdf-viewer')).toBeFalsy();
  });

  it('renders a small "Show Report" button, themed with the report blue, that delegates to the filter panel\'s submit()', () => {
    const fixture = createComponent();
    const submitSpy = vi.spyOn(fixture.componentInstance['filter'](), 'submit');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.warranty-cost-report-list__show-report-btn');
    expect(button.textContent?.trim()).toBe('Show Report');
    expect(button.classList).toContain('btn-sm');
    expect(button.classList).not.toContain('btn-secondary');

    button.click();
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('calls store.search with the filter panel\'s emitted values', () => {
    const fixture = createComponent();

    fixture.componentInstance['onSearch']({ dealerCode: '10015', dateFrom: '2026-08-01', dateTo: '2026-08-31' });

    expect(searchSpy).toHaveBeenCalledWith({ dealerCode: '10015', dateFrom: '2026-08-01', dateTo: '2026-08-31' });
  });

  it('shows an error banner with a Retry action when store.error is set, and retry calls store.refresh', () => {
    (storeStub.error as ReturnType<typeof signal<string | null>>).set('Unable to load Warranty Cost Report entries. Please try again.');
    const fixture = createComponent();

    expect(fixture.nativeElement.textContent).toContain('Unable to load Warranty Cost Report entries.');
    const retryButton: HTMLButtonElement = fixture.nativeElement.querySelector('.warranty-cost-report-list__error .__retry-btn');
    retryButton.click();

    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });
});
