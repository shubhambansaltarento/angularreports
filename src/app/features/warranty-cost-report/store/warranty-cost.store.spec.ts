import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WarrantyCostStore } from './warranty-cost.store';
import { WarrantyCostService } from '../services/warranty-cost.service';

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

describe('WarrantyCostStore', () => {
  let getEntriesSpy: ReturnType<typeof vi.fn>;
  let store: WarrantyCostStore;

  beforeEach(() => {
    getEntriesSpy = vi.fn().mockReturnValue(of({ dealerGroups: [], grandTotal: EMPTY_SUMMARY }));

    TestBed.configureTestingModule({
      providers: [WarrantyCostStore, { provide: WarrantyCostService, useValue: { getEntries: getEntriesSpy } }],
    });

    store = TestBed.inject(WarrantyCostStore);
  });

  it('does not fetch and stays hidden before the first search', () => {
    expect(store.hasSearched()).toBe(false);
    expect(getEntriesSpy).not.toHaveBeenCalled();
  });

  it('search() calls the service and reveals the statement', () => {
    store.search({ dealerCode: '10015', dateFrom: '2026-08-01', dateTo: '2026-08-31' });

    expect(getEntriesSpy).toHaveBeenCalledWith({ dealerCode: '10015', dateFrom: '2026-08-01', dateTo: '2026-08-31' });
    expect(store.hasSearched()).toBe(true);
  });

  it('applies the returned statement', () => {
    const statement = { dealerGroups: [{ dealerCode: '10015', dealerName: 'X', rows: [], summary: EMPTY_SUMMARY }], grandTotal: EMPTY_SUMMARY };
    getEntriesSpy.mockReturnValue(of(statement));

    store.search({ dealerCode: '10015' });

    expect(store.statement()).toEqual(statement);
    expect(store.loading()).toBe(false);
  });

  it('sets an error message and clears loading when the fetch fails', () => {
    getEntriesSpy.mockReturnValue(throwError(() => new Error('boom')));

    store.search({ dealerCode: '10015' });

    expect(store.error()).toBe('Unable to load Warranty Cost Report entries. Please try again.');
    expect(store.loading()).toBe(false);
  });

  it('refresh() re-issues the last search filters', () => {
    store.search({ dealerCode: '10015', dateFrom: '2026-08-01' });
    getEntriesSpy.mockClear();

    store.refresh();

    expect(getEntriesSpy).toHaveBeenCalledWith({ dealerCode: '10015', dateFrom: '2026-08-01' });
  });

  it('dismissError() clears the error signal', () => {
    getEntriesSpy.mockReturnValue(throwError(() => new Error('boom')));
    store.search({ dealerCode: '10015' });
    expect(store.error()).toBeTruthy();

    store.dismissError();

    expect(store.error()).toBeNull();
  });
});
