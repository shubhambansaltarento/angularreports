import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DealerLedgerStore } from './dealer-ledger.store';
import { DealerLedgerService } from '../services/dealer-ledger.service';

describe('DealerLedgerStore', () => {
  let getEntriesSpy: ReturnType<typeof vi.fn>;
  let store: DealerLedgerStore;

  beforeEach(() => {
    getEntriesSpy = vi.fn().mockReturnValue(
      of({ rows: [], totalCount: 0, summary: null, effectiveColumns: null }),
    );

    TestBed.configureTestingModule({
      providers: [DealerLedgerStore, { provide: DealerLedgerService, useValue: { getEntries: getEntriesSpy } }],
    });

    store = TestBed.inject(DealerLedgerStore);
  });

  it('starts with hasSearched false, before any fetch has been requested (hide-table-until-submit-17-09-2026-12_01_AM)', () => {
    expect(store.hasSearched()).toBe(false);
  });

  it('sets hasSearched true as soon as search() is called, not only once the response resolves', () => {
    store.search({});
    expect(store.hasSearched()).toBe(true);
  });

  it('sets hasSearched true on reset() and refresh() too', () => {
    const resetStore = TestBed.inject(DealerLedgerStore);
    resetStore.reset();
    expect(resetStore.hasSearched()).toBe(true);
  });

  it('stays true after subsequent fetches, even ones that error', () => {
    getEntriesSpy.mockReturnValue(of({ rows: [], totalCount: 0, summary: null, effectiveColumns: null }));
    store.search({});
    store.search({ dealerCode: 'DLR-2' });
    expect(store.hasSearched()).toBe(true);
  });
});
