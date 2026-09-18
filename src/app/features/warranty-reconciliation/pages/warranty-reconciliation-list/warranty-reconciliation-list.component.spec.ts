import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { WarrantyReconciliationListComponent } from './warranty-reconciliation-list.component';
import { WarrantyReconciliationService } from '../../services/warranty-reconciliation.service';
import { WarrantyReconciliationStore } from '../../store/warranty-reconciliation.store';

describe('WarrantyReconciliationListComponent', () => {
  let searchSpy: ReturnType<typeof vi.fn>;
  let refreshSpy: ReturnType<typeof vi.fn>;
  let getConfigSpy: ReturnType<typeof vi.fn>;
  let storeStub: Partial<WarrantyReconciliationStore>;

  beforeEach(async () => {
    searchSpy = vi.fn();
    refreshSpy = vi.fn();
    getConfigSpy = vi.fn().mockReturnValue(of(null));

    storeStub = {
      loading: signal(false),
      hasSearched: signal(false),
      error: signal<string | null>(null),
      data: signal([]),
      effectiveColumns: signal(null) as unknown as WarrantyReconciliationStore['effectiveColumns'],
      search: searchSpy as unknown as WarrantyReconciliationStore['search'],
      refresh: refreshSpy as unknown as WarrantyReconciliationStore['refresh'],
    };

    await TestBed.configureTestingModule({
      imports: [WarrantyReconciliationListComponent],
      providers: [
        { provide: WarrantyReconciliationStore, useValue: storeStub },
        { provide: WarrantyReconciliationService, useValue: { getConfig: getConfigSpy } },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(WarrantyReconciliationListComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates without fetching any data — config is fetched, but no search happens automatically', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
    expect(getConfigSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('renders the centered header, breadcrumb, and filter', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Warranty Reconciliation');

    const breadcrumb: HTMLElement = fixture.nativeElement.querySelector('app-breadcrumb');
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.textContent).toContain('Warranty Reconciliation');

    expect(fixture.nativeElement.querySelector('app-warranty-reconciliation-filter')).toBeTruthy();
  });

  it('does not render the table before the first Submit, and renders it once store.hasSearched becomes true and there is at least one row', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('app-warranty-reconciliation-table')).toBeFalsy();

    (storeStub.hasSearched as ReturnType<typeof signal<boolean>>).set(true);
    (storeStub.data as ReturnType<typeof signal<unknown[]>>).set([{ id: '1' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-warranty-reconciliation-table')).toBeTruthy();
  });

  it('hides the table when the search returns zero rows, even after hasSearched is true', () => {
    const fixture = createComponent();
    (storeStub.hasSearched as ReturnType<typeof signal<boolean>>).set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-warranty-reconciliation-table')).toBeFalsy();
  });

  it('calls store.search with mapped filters when the filter panel emits searched', () => {
    const fixture = createComponent();

    fixture.componentInstance['onSearch']({
      dealerCode: 'DLR-1',
      dealerDescription: null,
      companyCode: 'TVSL',
      dateFrom: '2026-06-01',
      dateTo: '2026-07-31',
    });

    expect(searchSpy).toHaveBeenCalledTimes(1);
    const [filters] = searchSpy.mock.calls[0];
    expect(filters).toEqual({
      dealerCode: 'DLR-1',
      dealerDescription: undefined,
      dateFrom: '2026-06-01',
      dateTo: '2026-07-31',
    });
  });

  it('uses the loaded config context as the dealerCode/dealerDescription source of truth, even if the emitted form value is stale (config-context-dealer-code-source-of-truth-17-09-2026-08_19_AM.md)', () => {
    getConfigSpy.mockReturnValue(
      of({
        reportCode: 'WARRANTY_RECONCILLATION',
        title: 'Warranty Reconcillation',
        configVersion: '2026.09.1',
        context: { dealerCode: '10015', dealerDescription: 'PAWAN SARKAR AUTOMOBILES' },
        parameters: [],
        columnGroups: [],
        export: { formats: ['XLSX', 'PDF'] },
        paging: { defaultPageSize: 50, maxPageSize: 1000 },
      }),
    );
    const fixture = createComponent();

    // Simulates the race: the form/emitted value still shows the stale mock, but config
    // has already loaded the real dealer.
    fixture.componentInstance['onSearch']({
      dealerCode: 'DLR-001',
      dealerDescription: 'Northgate Motors — Authorized Dealer',
      companyCode: 'TVSL',
      dateFrom: '2026-06-01',
      dateTo: '2026-07-31',
    });

    expect(searchSpy).toHaveBeenCalledTimes(1);
    const [filters] = searchSpy.mock.calls[0];
    expect(filters.dealerCode).toBe('10015');
    expect(filters.dealerDescription).toBe('PAWAN SARKAR AUTOMOBILES');
    expect(filters.dateFrom).toBe('2026-06-01');
    expect(filters.dateTo).toBe('2026-07-31');
  });

  it('falls back to the emitted form value when config has not loaded yet', () => {
    const fixture = createComponent();

    fixture.componentInstance['onSearch']({
      dealerCode: 'DLR-001',
      dealerDescription: 'Northgate Motors — Authorized Dealer',
      companyCode: 'TVSL',
      dateFrom: '2026-06-01',
      dateTo: '2026-07-31',
    });

    const [filters] = searchSpy.mock.calls[0];
    expect(filters.dealerCode).toBe('DLR-001');
    expect(filters.dealerDescription).toBe('Northgate Motors — Authorized Dealer');
    expect(filters.dateFrom).toBe('2026-06-01');
    expect(filters.dateTo).toBe('2026-07-31');
  });

  it('updates the displayed Dealer Code/Description text once config resolves asynchronously AFTER the initial render — not just the /data request payload', () => {
    const configSubject = new Subject<unknown>();
    getConfigSpy.mockReturnValue(configSubject);
    const fixture = createComponent(); // first render: config still pending

    expect(fixture.nativeElement.textContent).toContain('DLR-001');

    configSubject.next({
      reportCode: 'WARRANTY_RECONCILLATION',
      title: 'Warranty Reconcillation',
      configVersion: '2026.09.1',
      context: { dealerCode: '10015', dealerDescription: 'PAWAN SARKAR AUTOMOBILES' },
      parameters: [],
      columnGroups: [],
      export: { formats: ['XLSX', 'PDF'] },
      paging: { defaultPageSize: 50, maxPageSize: 1000 },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('10015');
    expect(fixture.nativeElement.textContent).toContain('PAWAN SARKAR AUTOMOBILES');
    expect(fixture.nativeElement.textContent).not.toContain('DLR-001');
  });

  it('shows an error banner with a Retry action when store.error is set, and retry calls store.refresh', () => {
    (storeStub.error as ReturnType<typeof signal<string | null>>).set('Unable to load Warranty Reconciliation entries. Please try again.');
    const fixture = createComponent();

    expect(fixture.nativeElement.textContent).toContain('Unable to load Warranty Reconciliation entries.');
    const retryButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.warranty-reconciliation-list__error .__retry-btn',
    );
    retryButton.click();

    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });
});
