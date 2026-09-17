import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WarrantyCostStore } from './warranty-cost.store';
import { WarrantyCostService } from '../services/warranty-cost.service';

describe('WarrantyCostStore', () => {
  let getEntriesSpy: ReturnType<typeof vi.fn>;
  let store: WarrantyCostStore;

  beforeEach(() => {
    getEntriesSpy = vi.fn().mockReturnValue(
      of({ rows: [], totalCount: 0, summary: { totalLaborCost: 0, totalPartCost: 0, totalCost: 0 }, effectiveColumns: null }),
    );

    TestBed.configureTestingModule({
      providers: [WarrantyCostStore, { provide: WarrantyCostService, useValue: { getEntries: getEntriesSpy } }],
    });

    store = TestBed.inject(WarrantyCostStore);
  });

  it('starts with hasSearched false, before any fetch has been requested', () => {
    expect(store.hasSearched()).toBe(false);
  });

  it('sets hasSearched true as soon as search() is called', () => {
    store.search({});
    expect(store.hasSearched()).toBe(true);
  });

  it('surfaces the real validation message from a VALIDATION_FAILED error, not the generic fallback (data-mapping-fixes-from-real-rows-17-09-2026-08_02_AM.md)', () => {
    const validationError = new HttpErrorResponse({
      status: 400,
      error: {
        traceId: '55346c99-0b1f-4119-8728-39f6d5dbdf1e',
        code: 'VALIDATION_FAILED',
        errors: [
          { field: 'claimDate.to', code: 'MAX_RANGE_EXCEEDED', message: 'Date range cannot exceed 366 days', params: { maxRangeDays: 366 } },
        ],
      },
    });
    getEntriesSpy.mockReturnValue(throwError(() => validationError));

    store.search({ dateFrom: '2020-01-01', dateTo: '2026-09-17' });

    expect(store.error()).toBe('Date range cannot exceed 366 days');
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

    expect(store.error()).toBe('Unable to load Warranty Cost Report entries. Please try again.');
  });

  it('captures the real summary shape from a successful response', () => {
    getEntriesSpy.mockReturnValue(
      of({ rows: [], totalCount: 0, summary: { totalLaborCost: 3600, totalPartCost: 14451.5, totalCost: 18051.5 }, effectiveColumns: null }),
    );

    store.search({});

    expect(store.summary()).toEqual({ totalLaborCost: 3600, totalPartCost: 14451.5, totalCost: 18051.5 });
  });
});
