import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DealerLedgerService } from './dealer-ledger.service';
import { DealerLedgerMockService } from './dealer-ledger-mock.service';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

const DATABRICKS_URL = 'http://localhost:8080/dealer-ledger/fetch-data-bricks-data';

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
  let service: DealerLedgerService;
  let httpMock: HttpTestingController;
  let mockListSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockListSpy = vi.fn().mockReturnValue(
      of({ rows: [], totalCount: 0, summary: { totalDebit: 0, totalCredit: 0, closingBalance: 0, entryCount: 0 } }),
    );

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DealerLedgerService,
        { provide: DealerLedgerMockService, useValue: { list: mockListSpy } },
        { provide: ReportApiService, useValue: { getConfig: vi.fn(), getData: vi.fn() } },
      ],
    });

    service = TestBed.inject(DealerLedgerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('sends bukrs/kunnr/fromDate/limit as the request query parameters, with kunnr always zero-padded with a 00000 prefix', () => {
    service.getEntries(BASE_REQUEST).subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === DATABRICKS_URL,
    );
    expect(req.request.params.get('bukrs')).toBe('TVSL');
    expect(req.request.params.get('kunnr')).toBe('00000DLR-1');
    expect(req.request.params.get('fromDate')).toBe('2026-08-01');
    expect(req.request.params.get('limit')).toBe('2000');
    req.flush([]);
  });

  it('maps the flat Databricks row array onto DealerLedgerRow', () => {
    let result: { rows: { dealerCode: string; debitAmount: number; creditAmount: number }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    const req = httpMock.expectOne((request) => request.url === DATABRICKS_URL);
    req.flush([
      {
        dealer_code: '0000010015',
        dealer_name: 'PAVAN SEKHAR AUTOMOBILES',
        dealer_address: 'DOOR NO.8-12',
        credit_control_area: 'MS',
        doc_type: 'AB',
        doc_reference_no: '0104023388',
        doc_date: '2026-08-16T18:30:00.000Z',
        assignment: null,
        narration_veh_descr: '',
        text_f: null,
        currency: 'INR',
        debit_amount: 0,
        credit_amount: 284250.25,
        vehicle_text: null,
        amount: null,
        running_balance: -265123394.41,
      },
    ]);

    expect(result?.rows).toEqual([
      expect.objectContaining({
        dealerCode: '0000010015',
        dealerName: 'PAVAN SEKHAR AUTOMOBILES',
        creditAmount: 284250.25,
        debitAmount: 0,
      }),
    ]);
  });

  it('assigns every row in a multi-row response a distinct, stable id (spec-table-pagination-forward-backward-integrity.md)', () => {
    let result: { rows: { id: string }[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    const req = httpMock.expectOne((request) => request.url === DATABRICKS_URL);
    req.flush(Array.from({ length: 40 }, (_, index) => ({ dealer_code: `DLR-${index}` })));

    const ids = result?.rows.map((row) => row.id) ?? [];
    expect(new Set(ids).size).toBe(40);
  });

  it('falls back to mock data when the Databricks call fails', () => {
    let result: { rows: unknown[] } | undefined;
    service.getEntries(BASE_REQUEST).subscribe((response) => (result = response));

    const req = httpMock.expectOne((request) => request.url === DATABRICKS_URL);
    req.error(new ProgressEvent('error'));

    expect(mockListSpy).toHaveBeenCalledWith(BASE_REQUEST);
    expect(result?.rows).toEqual([]);
  });
});
