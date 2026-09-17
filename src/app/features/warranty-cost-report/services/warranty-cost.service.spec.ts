import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WarrantyCostService } from './warranty-cost.service';
import { WarrantyCostRequest } from '../models/warranty-cost-request.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

const BASE_REQUEST: WarrantyCostRequest = {
  page: 1,
  pageSize: 50,
  sort: [],
  filters: {
    dealerCode: '10015',
    dateFrom: '2026-08-17',
    dateTo: '2026-09-17',
  },
};

describe('WarrantyCostService', () => {
  let getDataSpy: ReturnType<typeof vi.fn>;
  let service: WarrantyCostService;

  beforeEach(() => {
    getDataSpy = vi.fn().mockReturnValue(
      of({
        reportCode: 'WARRANTY_COST',
        configVersion: '2026.09.1',
        effectiveColumns: [],
        rows: [],
        totals: {},
        paging: { page: 1, pageSize: 50, totalRows: 0, totalPages: 0 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 0 },
      }),
    );

    TestBed.configureTestingModule({
      providers: [WarrantyCostService, { provide: ReportApiService, useValue: { getConfig: vi.fn(), getData: getDataSpy } }],
    });

    service = TestBed.inject(WarrantyCostService);
  });

  it('sends dealerCode, a silently-defaulted companyCode, and claimDate.{from,to} — matching the confirmed real request shape (api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md)', () => {
    service.getEntries(BASE_REQUEST).subscribe();

    expect(getDataSpy).toHaveBeenCalledTimes(1);
    const [, apiRequest] = getDataSpy.mock.calls[0];
    expect(apiRequest.parameters).toEqual({
      dealerCode: '10015',
      companyCode: 'TVSL',
      claimDate: { from: '2026-08-17', to: '2026-09-17' },
    });
    expect(apiRequest.paging).toEqual({ page: 1, pageSize: 50 });
    expect(apiRequest.sort).toEqual([]);
  });

  it('maps a real multi-row response onto internal WarrantyCostRow shapes with distinct ids (column-schema-changed-to-order-date-quantity-17-09-2026-08_14_AM.md)', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'WARRANTY_COST',
        configVersion: '2026.09.1',
        effectiveColumns: [{ columnName: 'dealerCode', isDefault: true, isVisible: true }],
        rows: [
          { dealerCode: '10015', dealerName: 'PAWAN SARKAR AUTOMOBILES', orderDate: '28-04-2026', quantity: 2 },
          { dealerCode: '10015', orderDate: '10-05-2026' },
        ],
        totals: {},
        paging: { page: 1, pageSize: 50, totalRows: 2, totalPages: 1 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 0 },
      }),
    );

    let result: { rows: { id: string; orderDate: string; quantity: number }[]; totalCount: number; effectiveColumns?: unknown } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.rows.map((row) => row.orderDate)).toEqual(['2026-04-28', '2026-05-10']);
    expect(result?.rows[0].quantity).toBe(2);
    expect(result?.rows[1].quantity).toBe(0);
    expect(new Set(result?.rows.map((row) => row.id)).size).toBe(2);
    expect(result?.totalCount).toBe(2);
    expect(result?.effectiveColumns).toEqual([{ columnName: 'dealerCode', isDefault: true, isVisible: true }]);
  });

  it('normalizes a real DD-MM-YYYY orderDate from the backend to ISO 8601, so DatePipe can render it (column-schema-changed-to-order-date-quantity-17-09-2026-08_14_AM.md)', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'WARRANTY_COST',
        configVersion: '2026.09.1',
        effectiveColumns: [],
        rows: [{ dealerCode: '10015', dealerName: 'PAWAN SARKAR AUTOMOBILES', orderDate: '28-04-2026', quantity: 2 }],
        totals: { laborCost: 450, partCost: 1250, totalCost: 1700 },
        paging: { page: 1, pageSize: 1, totalRows: 1, totalPages: 1 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 0 },
      }),
    );

    let result: { rows: { orderDate: string }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.rows[0].orderDate).toBe('2026-04-28');
  });

  it('leaves an already-ISO or unrecognized orderDate format unchanged', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'WARRANTY_COST',
        configVersion: '2026.09.1',
        effectiveColumns: [],
        rows: [{ orderDate: '2026-04-28' }],
        totals: {},
        paging: { page: 1, pageSize: 1, totalRows: 1, totalPages: 1 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 0 },
      }),
    );

    let result: { rows: { orderDate: string }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.rows[0].orderDate).toBe('2026-04-28');
  });

  it('maps the real totals shape ({ laborCost, partCost, totalCost }) onto the internal summary, even though these fields no longer appear on any row', () => {
    getDataSpy.mockReturnValue(
      of({
        reportCode: 'WARRANTY_COST',
        configVersion: '2026.09.1',
        effectiveColumns: [],
        rows: [],
        totals: { laborCost: 3600, partCost: 14451.5, totalCost: 18051.5 },
        paging: { page: 1, pageSize: 50, totalRows: 0, totalPages: 0 },
        meta: { generatedAt: '', dataAsOf: '', queryMs: 0 },
      }),
    );

    let result: { summary: { totalLaborCost: number; totalPartCost: number; totalCost: number } } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.summary).toEqual({ totalLaborCost: 3600, totalPartCost: 14451.5, totalCost: 18051.5 });
  });

  it('defaults every summary field to 0 when totals is empty ({})', () => {
    let result: { summary: { totalLaborCost: number; totalPartCost: number; totalCost: number } } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    expect(result?.summary).toEqual({ totalLaborCost: 0, totalPartCost: 0, totalCost: 0 });
  });

  it('propagates a fetch failure as an error (no mock fallback, unlike Dealer Ledger)', () => {
    getDataSpy.mockReturnValue(throwError(() => new Error('network error')));

    let errored = false;
    service.getEntries(BASE_REQUEST).subscribe({ error: () => (errored = true) });

    expect(errored).toBe(true);
  });
});
