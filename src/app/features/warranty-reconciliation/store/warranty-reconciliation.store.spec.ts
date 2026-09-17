import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WarrantyReconciliationStore } from './warranty-reconciliation.store';
import { WarrantyReconciliationService } from '../services/warranty-reconciliation.service';

describe('WarrantyReconciliationStore', () => {
  let getEntriesSpy: ReturnType<typeof vi.fn>;
  let store: WarrantyReconciliationStore;

  beforeEach(() => {
    getEntriesSpy = vi.fn().mockReturnValue(of({ rows: [], totalCount: 0, effectiveColumns: null }));

    TestBed.configureTestingModule({
      providers: [
        WarrantyReconciliationStore,
        { provide: WarrantyReconciliationService, useValue: { getEntries: getEntriesSpy } },
      ],
    });

    store = TestBed.inject(WarrantyReconciliationStore);
  });

  it('starts with hasSearched false, before any fetch has been requested', () => {
    expect(store.hasSearched()).toBe(false);
  });

  it('sets hasSearched true as soon as search() is called', () => {
    store.search({});
    expect(store.hasSearched()).toBe(true);
  });

  it('captures rows and totalCount from a successful response', () => {
    getEntriesSpy.mockReturnValue(
      of({ rows: [{ dealerCode: '10015', dealerName: 'PAWAN SARKAR AUTOMOBILES' }], totalCount: 1, effectiveColumns: null }),
    );

    store.search({ dealerCode: '10015' });

    expect(store.data()).toEqual([{ dealerCode: '10015', dealerName: 'PAWAN SARKAR AUTOMOBILES' }]);
    expect(store.filteredCount()).toBe(1);
  });

  it('surfaces the real validation message from a VALIDATION_FAILED error, not the generic fallback', () => {
    const validationError = new HttpErrorResponse({
      status: 400,
      error: {
        traceId: '55346c99-0b1f-4119-8728-39f6d5dbdf1e',
        code: 'VALIDATION_FAILED',
        errors: [{ field: 'dealerCode', code: 'INVALID', message: 'Dealer code not found' }],
      },
    });
    getEntriesSpy.mockReturnValue(throwError(() => validationError));

    store.search({ dealerCode: 'BOGUS' });

    expect(store.error()).toBe('Dealer code not found');
  });

  it('joins multiple validation messages with "; "', () => {
    const validationError = new HttpErrorResponse({
      status: 400,
      error: {
        traceId: 't-1',
        code: 'VALIDATION_FAILED',
        errors: [
          { field: 'a', code: 'X', message: 'First problem' },
          { field: 'b', code: 'Y', message: 'Second problem' },
        ],
      },
    });
    getEntriesSpy.mockReturnValue(throwError(() => validationError));

    store.search({});

    expect(store.error()).toBe('First problem; Second problem');
  });

  it('falls back to a generic message for a non-validation error (e.g. a network failure)', () => {
    getEntriesSpy.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    store.search({});

    expect(store.error()).toBe('Unable to load Warranty Reconciliation entries. Please try again.');
  });
});
