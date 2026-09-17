import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WarrantyReconciliationService } from './warranty-reconciliation.service';
import { WarrantyReconciliationRequest } from '../models/warranty-reconciliation-request.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

const BASE_REQUEST: WarrantyReconciliationRequest = {
  page: 1,
  pageSize: 50,
  sort: [],
  filters: {
    dealerCode: '10015',
    dateFrom: '2026-06-01',
    dateTo: '2026-07-31',
  },
};

describe('WarrantyReconciliationService', () => {
  let getDataSpy: ReturnType<typeof vi.fn>;
  let service: WarrantyReconciliationService;

  beforeEach(() => {
    getDataSpy = vi.fn().mockReturnValue(
      of({
        reportCode: 'WARRANTY_RECONCILLATION',
        configVersion: '2026.09.1',
        effectiveColumns: [],
        rows: [],
        totals: {},
        paging: { page: 1, pageSize: 50, totalRows: 0, totalPages: 0 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 0 },
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        WarrantyReconciliationService,
        { provide: ReportApiService, useValue: { getConfig: vi.fn(), getData: getDataSpy } },
      ],
    });

    service = TestBed.inject(WarrantyReconciliationService);
  });

  it('sends dealerCode, a silently-defaulted companyCode, and reconciliationDate as a nested {from, to} object — matching the confirmed real request shape (add-date-range-ui-17-09-2026-09_05_AM.md)', () => {
    service.getEntries(BASE_REQUEST).subscribe();

    expect(getDataSpy).toHaveBeenCalledTimes(1);
    const [reportKey, apiRequest] = getDataSpy.mock.calls[0];
    expect(reportKey).toBe('WARRANTY_RECONCILLATION');
    expect(apiRequest.parameters).toEqual({
      dealerCode: '10015',
      companyCode: 'TVSL',
      reconciliationDate: { from: '2026-06-01', to: '2026-07-31' },
    });
    expect(apiRequest.parameters.dateFrom).toBeUndefined();
    expect(apiRequest.parameters.dateTo).toBeUndefined();
    expect(apiRequest.paging).toEqual({ page: 1, pageSize: 50 });
    expect(apiRequest.sort).toEqual([]);
  });

  it('maps a real response onto internal WarrantyReconciliationRow shapes', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'WARRANTY_RECONCILLATION',
        configVersion: '2026.09.1',
        effectiveColumns: [
          { columnName: 'dealerCode', isDefault: true, isVisible: true },
          { columnName: 'dealerName', isDefault: true, isVisible: true },
          { columnName: 'reconciliationDate', isDefault: true, isVisible: true },
        ],
        rows: [{ dealerCode: '10015', dealerName: 'PAWAN SARKAR AUTOMOBILES', reconciliationDate: '02-06-2026' }],
        totals: {},
        paging: { page: 1, pageSize: 1, totalRows: 1, totalPages: 1 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 3 },
      }),
    );

    let result:
      | { rows: { dealerCode: string; dealerName: string; reconciliationDate: string }[]; totalCount: number; effectiveColumns?: unknown }
      | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.rows).toEqual([{ dealerCode: '10015', dealerName: 'PAWAN SARKAR AUTOMOBILES', reconciliationDate: '2026-06-02' }]);
    expect(result?.totalCount).toBe(1);
    expect(result?.effectiveColumns).toEqual([
      { columnName: 'dealerCode', isDefault: true, isVisible: true },
      { columnName: 'dealerName', isDefault: true, isVisible: true },
      { columnName: 'reconciliationDate', isDefault: true, isVisible: true },
    ]);
  });

  it('defaults missing row fields to empty strings', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'WARRANTY_RECONCILLATION',
        configVersion: '2026.09.1',
        effectiveColumns: [],
        rows: [{}],
        totals: {},
        paging: { page: 1, pageSize: 1, totalRows: 1, totalPages: 1 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 0 },
      }),
    );

    let result: { rows: { dealerCode: string; dealerName: string; reconciliationDate: string }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.rows).toEqual([{ dealerCode: '', dealerName: '', reconciliationDate: '' }]);
  });

  it('propagates a fetch failure as an error (no mock fallback)', () => {
    getDataSpy.mockReturnValue(throwError(() => new Error('network error')));

    let errored = false;
    service.getEntries(BASE_REQUEST).subscribe({ error: () => (errored = true) });

    expect(errored).toBe(true);
  });
});
