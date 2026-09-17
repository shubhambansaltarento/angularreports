import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DealerLedgerListComponent } from './dealer-ledger-list.component';
import { DealerLedgerService } from '../../services/dealer-ledger.service';
import { DealerLedgerStore } from '../../store/dealer-ledger.store';

describe('DealerLedgerListComponent', () => {
  let loadSpy: ReturnType<typeof vi.fn>;
  let searchSpy: ReturnType<typeof vi.fn>;
  let resetSpy: ReturnType<typeof vi.fn>;
  let refreshSpy: ReturnType<typeof vi.fn>;
  let getConfigSpy: ReturnType<typeof vi.fn>;
  let storeStub: Partial<DealerLedgerStore>;

  beforeEach(async () => {
    loadSpy = vi.fn();
    searchSpy = vi.fn();
    resetSpy = vi.fn();
    refreshSpy = vi.fn();
    getConfigSpy = vi.fn().mockReturnValue(of(null));

    storeStub = {
      loading: signal(false),
      hasSearched: signal(false),
      error: signal<string | null>(null),
      data: signal([]),
      summary: signal(null),
      filteredCount: signal(0) as unknown as DealerLedgerStore['filteredCount'],
      effectiveColumns: signal(null) as unknown as DealerLedgerStore['effectiveColumns'],
      load: loadSpy as unknown as DealerLedgerStore['load'],
      search: searchSpy as unknown as DealerLedgerStore['search'],
      reset: resetSpy as unknown as DealerLedgerStore['reset'],
      refresh: refreshSpy as unknown as DealerLedgerStore['refresh'],
    };

    await TestBed.configureTestingModule({
      imports: [DealerLedgerListComponent],
      providers: [
        { provide: DealerLedgerStore, useValue: storeStub },
        { provide: DealerLedgerService, useValue: { getConfig: getConfigSpy } },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(DealerLedgerListComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders a breadcrumb below the toolbar, trailing with "Dealer Ledger" (breadcrumbs-and-dealer-ledger-style-headers-17-09-2026-07_17_AM.md)', () => {
    const fixture = createComponent();
    const breadcrumb: HTMLElement = fixture.nativeElement.querySelector('app-breadcrumb');
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.textContent).toContain('Dealer Ledger');
  });

  it('creates without fetching any data — config is fetched, but no search/load happens automatically', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
    expect(getConfigSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('still does not fetch data even once the config response resolves', () => {
    getConfigSpy.mockReturnValue(
      of({
        configVersion: '2026.08.1',
        context: { dealerCode: '1130', dealerDescription: 'PAWAN SARKAR AUTOMOBILES' },
        parameters: [{ name: 'companyCode', label: 'Company Code', defaultValue: 'TVSL' }],
        export: { formats: ['XLSX', 'PDF'] },
      }),
    );
    createComponent();

    expect(searchSpy).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('maps the config API response onto the filter panel and the table export formats', () => {
    getConfigSpy.mockReturnValue(
      of({
        context: { dealerCode: '1130', dealerDescription: 'PAWAN SARKAR AUTOMOBILES' },
        parameters: [{ name: 'companyCode', label: 'Company Code', defaultValue: 'TVSL' }],
        export: { formats: ['XLSX', 'PDF'] },
      }),
    );
    const fixture = createComponent();

    const dealerCodeText: HTMLElement = fixture.nativeElement.querySelector('#report-search-bar-dealer-code');
    expect(dealerCodeText.textContent?.trim()).toBe('1130');
    const companyCodeText: HTMLElement = fixture.nativeElement.querySelector('#report-search-bar-company-code');
    expect(companyCodeText.textContent?.trim()).toBe('TVSL');

    expect(fixture.componentInstance['exportFormats']()).toEqual(['excel', 'pdf']);
  });

  it('falls back to the dealer context and shows every export format when config has not loaded', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance['exportFormats']()).toBeNull();
  });

  it('calls store.search with mapped filters when the filter panel emits searched', () => {
    const fixture = createComponent();
    const filterComponent = fixture.nativeElement.querySelector('app-dealer-ledger-filter');
    expect(filterComponent).toBeTruthy();

    fixture.componentInstance['onSearch']({
      dealerCode: 'DLR-1',
      dealerDescription: null,
      companyCode: null,
      dateFrom: null,
      dateTo: null,
      checkboxSelection: ['oe', 'sp'],
    });

    // No automatic initial search happens anymore (no-data-until-submit-16-09-2026-05_01_PM) — this is the only call.
    expect(searchSpy).toHaveBeenCalledTimes(1);
    const [filters] = searchSpy.mock.calls[0];
    expect(filters.dealerCode).toBe('DLR-1');
    expect(filters.withOeDetails).toBe(true);
    expect(filters.withSpDetails).toBe(true);
    expect(filters.withAcDetails).toBe(false);
  });

  it('shows an error banner with a Retry action when store.error is set, and retry calls store.refresh', () => {
    (storeStub.error as ReturnType<typeof signal<string | null>>).set('Unable to load Dealer Ledger entries. Please try again.');
    const fixture = createComponent();

    expect(fixture.nativeElement.textContent).toContain('Unable to load Dealer Ledger entries.');
    const retryButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.dealer-ledger-list__error button',
    );
    retryButton.click();

    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('renders no error banner when store.error is null', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('.dealer-ledger-list__error')).toBeFalsy();
  });

  it('does not render the table at all before the first Submit (hide-table-until-submit-17-09-2026-12_01_AM)', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('app-dealer-ledger-table')).toBeFalsy();
  });

  it('renders the table once store.hasSearched becomes true', () => {
    const fixture = createComponent();
    (storeStub.hasSearched as ReturnType<typeof signal<boolean>>).set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-dealer-ledger-table')).toBeTruthy();
  });
});
