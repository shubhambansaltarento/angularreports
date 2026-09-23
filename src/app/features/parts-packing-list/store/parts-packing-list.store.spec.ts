import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PartsPackingListStore } from './parts-packing-list.store';
import { PartsPackingListService } from '../services/parts-packing-list.service';

describe('PartsPackingListStore', () => {
  let getEntriesSpy: ReturnType<typeof vi.fn>;
  let filterRowsSpy: ReturnType<typeof vi.fn>;
  let store: PartsPackingListStore;

  beforeEach(() => {
    getEntriesSpy = vi.fn().mockReturnValue(of({ rows: [], totalCount: 0, columns: [] }));
    filterRowsSpy = vi.fn((rows: unknown[]) => rows);

    TestBed.configureTestingModule({
      providers: [
        PartsPackingListStore,
        { provide: PartsPackingListService, useValue: { getEntries: getEntriesSpy, filterRows: filterRowsSpy } },
      ],
    });

    store = TestBed.inject(PartsPackingListStore);
  });

  it('does not fetch and stays hidden before the first search', () => {
    expect(store.hasSearched()).toBe(false);
    expect(getEntriesSpy).not.toHaveBeenCalled();
  });

  it('search() calls the service with the given dealerCode/companyCode/dateFrom/dateTo, and reveals the table', () => {
    store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });

    expect(getEntriesSpy).toHaveBeenCalledWith('10015', 'TSL', '2026-08-01', '2026-09-01');
    expect(store.hasSearched()).toBe(true);
  });

  it('applies the response rows (filtered via the service) and dynamically-derived columns', () => {
    getEntriesSpy.mockReturnValue(
      of({
        rows: [{ id: '0', part_number: 'TR600080' }],
        totalCount: 1,
        columns: [{ key: 'part_number', header: 'Part Number' }],
      }),
    );

    store.search('10015', 'TSL', {});

    expect(filterRowsSpy).toHaveBeenCalledWith([{ id: '0', part_number: 'TR600080' }], {});
    expect(store.data()).toEqual([{ id: '0', part_number: 'TR600080' }]);
    expect(store.columns()).toEqual([{ key: 'part_number', header: 'Part Number' }]);
    expect(store.loading()).toBe(false);
  });

  it('sets an error message and clears loading when the fetch fails', () => {
    getEntriesSpy.mockReturnValue(throwError(() => new Error('boom')));

    store.search('10015', 'TSL', {});

    expect(store.error()).toBe('Unable to load Parts Packing List entries. Please try again.');
    expect(store.loading()).toBe(false);
  });

  it('refresh() re-issues the last search request', () => {
    store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
    getEntriesSpy.mockClear();

    store.refresh();

    expect(getEntriesSpy).toHaveBeenCalledWith('10015', 'TSL', '2026-08-01', '2026-09-01');
  });

  it('refresh() does nothing before any search has happened', () => {
    store.refresh();
    expect(getEntriesSpy).not.toHaveBeenCalled();
  });

  describe('skipping re-fetch when only Invoice/Delivery Number changes (skip-refetch-when-date-range-unchanged-23-09-2026-11_00_AM.md)', () => {
    beforeEach(() => {
      getEntriesSpy.mockReturnValue(
        of({
          rows: [
            { id: '0', invoice_number: 'A' },
            { id: '1', invoice_number: 'B' },
          ],
          totalCount: 2,
          columns: [{ key: 'invoice_number', header: 'Invoice Number' }],
        }),
      );
    });

    it('does not re-fetch when dealerCode/companyCode/dateFrom/dateTo are unchanged from the last successful fetch', () => {
      store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01', invoiceNumber: 'A' });
      getEntriesSpy.mockClear();
      filterRowsSpy.mockClear();

      store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01', invoiceNumber: 'B' });

      expect(getEntriesSpy).not.toHaveBeenCalled();
      expect(filterRowsSpy).toHaveBeenCalledWith(
        [
          { id: '0', invoice_number: 'A' },
          { id: '1', invoice_number: 'B' },
        ],
        { dateFrom: '2026-08-01', dateTo: '2026-09-01', invoiceNumber: 'B' },
      );
      expect(store.hasSearched()).toBe(true);
    });

    it('re-fetches when the Date Range changes', () => {
      store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
      getEntriesSpy.mockClear();

      store.search('10015', 'TSL', { dateFrom: '2026-08-02', dateTo: '2026-09-01' });

      expect(getEntriesSpy).toHaveBeenCalledWith('10015', 'TSL', '2026-08-02', '2026-09-01');
    });

    it('re-fetches when dealerCode/companyCode changes even with the same Date Range', () => {
      store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
      getEntriesSpy.mockClear();

      store.search('10020', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });

      expect(getEntriesSpy).toHaveBeenCalledWith('10020', 'TSL', '2026-08-01', '2026-09-01');
    });

    it('reset() clears the cache, so the next search always re-fetches', () => {
      store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
      store.reset();
      getEntriesSpy.mockClear();

      store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });

      expect(getEntriesSpy).toHaveBeenCalledWith('10015', 'TSL', '2026-08-01', '2026-09-01');
    });

    it('refresh() always re-fetches, bypassing the cache', () => {
      store.search('10015', 'TSL', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
      getEntriesSpy.mockClear();

      store.refresh();

      expect(getEntriesSpy).toHaveBeenCalledWith('10015', 'TSL', '2026-08-01', '2026-09-01');
    });
  });
});
