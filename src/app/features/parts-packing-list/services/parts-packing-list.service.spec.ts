import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PARTS_PACKING_LIST_DATA_URL, PARTS_PACKING_LIST_REPORT_KEY } from '../constants/parts-packing-list.constants';
import { PartsPackingListService } from './parts-packing-list.service';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

const RAW_ROW = {
  dealer_code: '0000010015',
  dealer_name: 'PAVAN SEKHAR AUTOMOBILES',
  dealer_city: 'VIZIANAGARAM',
  invoice_number: '3005523016',
  delivery_number: '0926068616',
  case_number: '0073838696',
  carton_box: null,
  part_number: 'TR600080',
  part_description: 'TRU SPRAY 375g (500ML) CHAIN LUB CAN',
  quantity: 18,
};

describe('PartsPackingListService', () => {
  let service: PartsPackingListService;
  let httpMock: HttpTestingController;
  let getConfigSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getConfigSpy = vi.fn().mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PartsPackingListService,
        { provide: ReportApiService, useValue: { getConfig: getConfigSpy } },
      ],
    });

    service = TestBed.inject(PartsPackingListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('getConfig() calls the generic report-keyed config endpoint with PARTS_PACKING_LIST', () => {
    getConfigSpy.mockReturnValue(
      of({
        reportCode: 'PARTS_PACKING_LIST',
        title: 'Parts Packing List',
        context: { dealerCode: '10015', dealerDescription: 'X' },
        parameters: [],
      }),
    );

    let result: unknown;
    service.getConfig().subscribe((config) => (result = config));

    expect(getConfigSpy).toHaveBeenCalledWith(PARTS_PACKING_LIST_REPORT_KEY);
    expect(result).toEqual(expect.objectContaining({ reportCode: 'PARTS_PACKING_LIST' }));
  });

  it('returns null and does not throw when the config fetch fails', () => {
    getConfigSpy.mockReturnValue(of(null));

    let result: unknown = 'not-yet-set';
    service.getConfig().subscribe((config) => (result = config));

    expect(result).toBeNull();
  });

  it('POSTs dealerCode zero-padded with 00000, plus companyCode/fromDate/toDate, to fetch-data-bricks-data', () => {
    service.getEntries('10015', 'TSL', '2026-08-01', '2026-09-01').subscribe();

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      dealerCode: '0000010015',
      companyCode: 'TSL',
      fromDate: '2026-08-01',
      toDate: '2026-09-01',
    });
    req.flush([]);
  });

  it('derives columns from the first row\'s keys, Title Casing snake_case field names', () => {
    let result: { columns: { key: string; header: string }[] } | undefined;
    service.getEntries('10015', 'TSL', undefined, undefined).subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([RAW_ROW]);

    expect(result?.columns).toEqual(
      expect.arrayContaining([
        { key: 'part_description', header: 'Part Description', sortable: true },
        { key: 'invoice_number', header: 'Invoice Number', sortable: true },
      ]),
    );
  });

  it('maps every raw field onto the row and adds a synthetic id', () => {
    let result: { rows: Record<string, unknown>[] } | undefined;
    service.getEntries('10015', 'TSL', undefined, undefined).subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([RAW_ROW]);

    expect(result?.rows[0]).toEqual(expect.objectContaining({ id: '0', part_number: 'TR600080', quantity: 18 }));
  });

  it('returns no columns for an empty response', () => {
    let result: { columns: unknown[] } | undefined;
    service.getEntries('10015', 'TSL', undefined, undefined).subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([]);

    expect(result?.columns).toEqual([]);
  });

  it('getEntries() returns raw, unfiltered rows — Invoice/Delivery Number are never applied within the fetch itself', () => {
    let result: { rows: Record<string, unknown>[] } | undefined;
    service.getEntries('10015', 'TSL', undefined, undefined).subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([RAW_ROW, { ...RAW_ROW, invoice_number: '9999999999' }]);

    expect(result?.rows.length).toBe(2);
  });

  it('filterRows() applies invoiceNumber/deliveryNumber as client-side substring filters', () => {
    const rows = [
      { id: '0', ...RAW_ROW },
      { id: '1', ...RAW_ROW, invoice_number: '9999999999' },
    ];

    const result = service.filterRows(rows as never, { invoiceNumber: '523016' });

    expect(result.length).toBe(1);
    expect(result[0]['invoice_number']).toBe('3005523016');
  });
});
