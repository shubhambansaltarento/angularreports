import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DealerLedgerService } from './dealer-ledger.service';
import { DealerLedgerMockService } from './dealer-ledger-mock.service';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

const BASE_REQUEST: DealerLedgerRequest = {
  page: 1,
  pageSize: 10,
  sort: [],
  filters: {
    dealerCode: 'DLR-1',
    companyCode: 'TVSL',
    dateFrom: '2026-08-01',
    dateTo: '2026-09-01',
  },
};

describe('DealerLedgerService', () => {
  let getDataSpy: ReturnType<typeof vi.fn>;
  let service: DealerLedgerService;

  beforeEach(() => {
    getDataSpy = vi.fn().mockReturnValue(
      of({
        reportCode: 'DEALER_LEDGER',
        configVersion: '2026.08.1',
        effectiveColumns: [],
        rows: [],
        totals: { debit: 0, credit: 0 },
        paging: { page: 1, pageSize: 10, totalRows: 0, totalPages: 1 },
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        DealerLedgerService,
        DealerLedgerMockService,
        { provide: ReportApiService, useValue: { getConfig: vi.fn(), getData: getDataSpy } },
      ],
    });

    service = TestBed.inject(DealerLedgerService);
  });

  it('sends every "Include Details" checkbox as its own boolean parameter, per the current selection', () => {
    service
      .getEntries({
        ...BASE_REQUEST,
        filters: {
          ...BASE_REQUEST.filters,
          withOeDetails: false,
          withSpDetails: false,
          withAcDetails: true,
          withEvDetails: true,
          withAcwshDetails: false,
        },
      })
      .subscribe();

    expect(getDataSpy).toHaveBeenCalledTimes(1);
    const [, apiRequest] = getDataSpy.mock.calls[0];
    expect(apiRequest.parameters).toMatchObject({
      withOeDetails: false,
      withSpDetails: false,
      withAcDetails: true,
      withEvDetails: true,
      withAcwshDetails: false,
    });
  });

  it('defaults every checkbox flag to false (not omitted) when none are set on the filters', () => {
    service.getEntries(BASE_REQUEST).subscribe();

    const [, apiRequest] = getDataSpy.mock.calls[0];
    expect(apiRequest.parameters.withOeDetails).toBe(false);
    expect(apiRequest.parameters.withSpDetails).toBe(false);
    expect(apiRequest.parameters.withAcDetails).toBe(false);
    expect(apiRequest.parameters.withEvDetails).toBe(false);
    expect(apiRequest.parameters.withAcwshDetails).toBe(false);
  });

  it('sends dealerCode inside parameters, not at the request top level (backend-adds-checkbox-support-16-09-2026-05_24_PM — now a declared config parameter)', () => {
    service.getEntries(BASE_REQUEST).subscribe();

    const [, apiRequest] = getDataSpy.mock.calls[0];
    expect(apiRequest.parameters.dealerCode).toBe('DLR-1');
    expect(apiRequest.dealerCode).toBeUndefined();
  });

  it('passes effectiveColumns through as objects (columnName/isDefault), not flattened to strings (effective-columns-shape-change-17-09-2026-05_41_AM.md)', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'DEALER_LEDGER',
        configVersion: '2026.08.1',
        effectiveColumns: [
          { columnName: 'dealerCode', isDefault: true },
          { columnName: 'textDec', isDefault: false },
        ],
        rows: [],
        totals: { debit: 0, credit: 0 },
        paging: { page: 1, pageSize: 10, totalRows: 0, totalPages: 1 },
      }),
    );

    let result: { effectiveColumns?: { columnName: string; isDefault: boolean }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.effectiveColumns).toEqual([
      { columnName: 'dealerCode', isDefault: true },
      { columnName: 'textDec', isDefault: false },
    ]);
  });

  it('normalizes a DD-MM-YYYY docDate from the backend to ISO 8601, so DatePipe can render it (doc-date-dd-mm-yyyy-format-17-09-2026-12_00_AM)', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'DEALER_LEDGER',
        configVersion: '2026.08.1',
        effectiveColumns: [],
        rows: [{ docDate: '17-06-2026' }],
        totals: { debit: 0, credit: 0 },
        paging: { page: 1, pageSize: 10, totalRows: 1, totalPages: 1 },
      }),
    );

    let result: { rows: { docDate: string }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.rows[0].docDate).toBe('2026-06-17');
  });

  it('assigns every row in a multi-row response a distinct, stable id (spec-table-pagination-forward-backward-integrity.md)', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'DEALER_LEDGER',
        configVersion: '2026.08.1',
        effectiveColumns: [],
        rows: Array.from({ length: 40 }, (_, index) => ({ dealerCode: `DLR-${index}` })),
        totals: { debit: 0, credit: 0 },
        paging: { page: 1, pageSize: 10, totalRows: 40, totalPages: 4 },
      }),
    );

    let result: { rows: { id: string }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    const ids = result?.rows.map((row) => row.id) ?? [];
    expect(new Set(ids).size).toBe(40);
  });

  it('leaves an already-ISO or unrecognized docDate format unchanged', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'DEALER_LEDGER',
        configVersion: '2026.08.1',
        effectiveColumns: [],
        rows: [{ docDate: '2026-06-17' }],
        totals: { debit: 0, credit: 0 },
        paging: { page: 1, pageSize: 10, totalRows: 1, totalPages: 1 },
      }),
    );

    let result: { rows: { docDate: string }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.rows[0].docDate).toBe('2026-06-17');
  });
});
