import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WARRANTY_COST_DATA_URL, WARRANTY_COST_REPORT_KEY } from '../constants/warranty-cost.constants';
import { WarrantyCostService } from './warranty-cost.service';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

const RAW_ROW = {
  dealer: '0000010015',
  dealer_name: 'PAVAN SEKHAR AUTOMOBILES',
  cn_memo_no: '91048544',
  doc_date: '20260912',
  order_num: '64162944',
  order_date: '20260809',
  dlr_ref_num: 'HOS-44',
  ref_date: '20260809',
  item_no: '1',
  part_number: 'K6242080',
  description: 'BATTERY PACK ASSY',
  quantity: 1,
  plant: 'SPWH',
  ndp_rate: 25470,
  excise: 0,
  sales_tax: 0,
  labour: 120,
  octroi: 0,
  service_tax: 0,
  tot_cost: 25590,
  freight: 0,
  demurrage: 0,
  billing_doc: 'X',
};

describe('WarrantyCostService', () => {
  let service: WarrantyCostService;
  let httpMock: HttpTestingController;
  let getConfigSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getConfigSpy = vi.fn().mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        WarrantyCostService,
        { provide: ReportApiService, useValue: { getConfig: getConfigSpy } },
      ],
    });

    service = TestBed.inject(WarrantyCostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('getConfig() calls the generic report-keyed config endpoint with WARRANTY_COST', () => {
    getConfigSpy.mockReturnValue(of({ reportCode: 'WARRANTY_COST', title: 'Warranty Cost', configVersion: '1', context: { dealerCode: '10015', dealerDescription: 'X' }, parameters: [] }));

    let result: unknown;
    service.getConfig().subscribe((config) => (result = config));

    expect(getConfigSpy).toHaveBeenCalledWith(WARRANTY_COST_REPORT_KEY);
    expect(result).toEqual(expect.objectContaining({ reportCode: 'WARRANTY_COST' }));
  });

  it('POSTs dealerCode zero-padded with 00000, plus companyCode/fromDate/toDate, to fetch-data-bricks-data', () => {
    service.getEntries({ dealerCode: '10015', companyCode: 'TSL', dateFrom: '2026-08-01', dateTo: '2026-08-31' }).subscribe();

    const req = httpMock.expectOne(WARRANTY_COST_DATA_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      dealerCode: '0000010015',
      companyCode: 'TSL',
      fromDate: '2026-08-01',
      toDate: '2026-08-31',
    });
    req.flush([]);
  });

  it('groups rows by dealer and formats YYYYMMDD dates as DD.MM.YYYY', () => {
    let result: { dealerGroups: { dealerCode: string; dealerName: string; rows: { docDate: string }[] }[] } | undefined;
    service.getEntries({ dealerCode: '10015' }).subscribe((response) => (result = response));

    const req = httpMock.expectOne(WARRANTY_COST_DATA_URL);
    req.flush([RAW_ROW]);

    expect(result?.dealerGroups).toEqual([
      expect.objectContaining({
        dealerCode: '0000010015',
        dealerName: 'PAVAN SEKHAR AUTOMOBILES',
        rows: [expect.objectContaining({ docDate: '12.09.2026', partNumber: 'K6242080' })],
      }),
    ]);
  });

  it('computes per-dealer and grand-total summaries from the cost columns', () => {
    let result:
      | { dealerGroups: { summary: { totalCost: number; totalValue: number } }[]; grandTotal: { totalCost: number; totalValue: number } }
      | undefined;
    service.getEntries({ dealerCode: '10015' }).subscribe((response) => (result = response));

    const req = httpMock.expectOne(WARRANTY_COST_DATA_URL);
    req.flush([RAW_ROW, { ...RAW_ROW, tot_cost: 100, freight: 10, demurrage: 5 }]);

    expect(result?.dealerGroups[0].summary.totalCost).toBe(25690);
    expect(result?.grandTotal.totalCost).toBe(25690);
    expect(result?.grandTotal.totalValue).toBe(25690 + 10 + 5);
  });

  it('returns an empty statement (zero-valued grand total) for an empty response', () => {
    let result: { dealerGroups: unknown[]; grandTotal: { totalCost: number } } | undefined;
    service.getEntries({ dealerCode: '10015' }).subscribe((response) => (result = response));

    const req = httpMock.expectOne(WARRANTY_COST_DATA_URL);
    req.flush([]);

    expect(result?.dealerGroups).toEqual([]);
    expect(result?.grandTotal.totalCost).toBe(0);
  });
});
