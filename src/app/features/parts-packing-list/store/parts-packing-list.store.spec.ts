import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PartsPackingListStore } from './parts-packing-list.store';
import { PartsPackingListService } from '../services/parts-packing-list.service';

describe('PartsPackingListStore', () => {
  let getEntriesSpy: ReturnType<typeof vi.fn>;
  let store: PartsPackingListStore;

  beforeEach(() => {
    getEntriesSpy = vi.fn().mockReturnValue(of({ rows: [], totalCount: 0, columns: [] }));

    TestBed.configureTestingModule({
      providers: [PartsPackingListStore, { provide: PartsPackingListService, useValue: { getEntries: getEntriesSpy } }],
    });

    store = TestBed.inject(PartsPackingListStore);
  });

  it('does not fetch and stays hidden before the first search', () => {
    expect(store.hasSearched()).toBe(false);
    expect(getEntriesSpy).not.toHaveBeenCalled();
  });

  it('search() calls the service with the given dealerCode and filters, and reveals the table', () => {
    store.search('0000010015', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });

    expect(getEntriesSpy).toHaveBeenCalledWith('0000010015', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
    expect(store.hasSearched()).toBe(true);
  });

  it('applies the response rows and dynamically-derived columns', () => {
    getEntriesSpy.mockReturnValue(
      of({
        rows: [{ id: '0', part_number: 'TR600080' }],
        totalCount: 1,
        columns: [{ key: 'part_number', header: 'Part Number' }],
      }),
    );

    store.search('0000010015', {});

    expect(store.data()).toEqual([{ id: '0', part_number: 'TR600080' }]);
    expect(store.columns()).toEqual([{ key: 'part_number', header: 'Part Number' }]);
    expect(store.loading()).toBe(false);
  });

  it('sets an error message and clears loading when the fetch fails', () => {
    getEntriesSpy.mockReturnValue(throwError(() => new Error('boom')));

    store.search('0000010015', {});

    expect(store.error()).toBe('Unable to load Parts Packing List entries. Please try again.');
    expect(store.loading()).toBe(false);
  });

  it('refresh() re-issues the last search request', () => {
    store.search('0000010015', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
    getEntriesSpy.mockClear();

    store.refresh();

    expect(getEntriesSpy).toHaveBeenCalledWith('0000010015', { dateFrom: '2026-08-01', dateTo: '2026-09-01' });
  });

  it('refresh() does nothing before any search has happened', () => {
    store.refresh();
    expect(getEntriesSpy).not.toHaveBeenCalled();
  });
});
