import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  PARTS_PACKING_LIST_CONFIG_URL,
  PARTS_PACKING_LIST_DATA_URL,
} from '../constants/parts-packing-list.constants';
import { PartsPackingListService } from './parts-packing-list.service';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PartsPackingListService],
    });

    service = TestBed.inject(PartsPackingListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('fetches config from the plain (non report-keyed) endpoint', () => {
    let result: unknown;
    service.getConfig().subscribe((config) => (result = config));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_CONFIG_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ reportCode: 'PARTS_PACKING_LIST', title: 'Parts Packing List', parameters: [] });

    expect(result).toEqual({ reportCode: 'PARTS_PACKING_LIST', title: 'Parts Packing List', parameters: [] });
  });

  it('returns null and does not throw when the config fetch fails', () => {
    let result: unknown = 'not-yet-set';
    service.getConfig().subscribe((config) => (result = config));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_CONFIG_URL);
    req.error(new ProgressEvent('error'));

    expect(result).toBeNull();
  });

  it('POSTs dealerCode/fromDate/toDate to fetchDatabricksdata', () => {
    service.getEntries('0000010015', { dateFrom: '2026-08-01', dateTo: '2026-09-01' }).subscribe();

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ dealerCode: '0000010015', fromDate: '2026-08-01', toDate: '2026-09-01' });
    req.flush([]);
  });

  it('derives columns from the first row\'s keys, Title Casing snake_case field names', () => {
    let result: { columns: { key: string; header: string }[] } | undefined;
    service.getEntries('0000010015', {}).subscribe((response) => (result = response));

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
    service.getEntries('0000010015', {}).subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([RAW_ROW]);

    expect(result?.rows[0]).toEqual(expect.objectContaining({ id: '0', part_number: 'TR600080', quantity: 18 }));
  });

  it('returns no columns for an empty response', () => {
    let result: { columns: unknown[] } | undefined;
    service.getEntries('0000010015', {}).subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([]);

    expect(result?.columns).toEqual([]);
  });

  it('applies invoiceNumber/deliveryNumber as client-side substring filters', () => {
    let result: { rows: Record<string, unknown>[] } | undefined;
    service.getEntries('0000010015', { invoiceNumber: '523016' }).subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([RAW_ROW, { ...RAW_ROW, invoice_number: '9999999999' }]);

    expect(result?.rows.length).toBe(1);
    expect(result?.rows[0]['invoice_number']).toBe('3005523016');
  });

  it('applies Case/Material as client-side range filters', () => {
    let result: { rows: Record<string, unknown>[] } | undefined;
    service
      .getEntries('0000010015', { materialFrom: 'TR600000', materialTo: 'TR699999' })
      .subscribe((response) => (result = response));

    const req = httpMock.expectOne(PARTS_PACKING_LIST_DATA_URL);
    req.flush([RAW_ROW, { ...RAW_ROW, part_number: 'ZZ999999' }]);

    expect(result?.rows.length).toBe(1);
    expect(result?.rows[0]['part_number']).toBe('TR600080');
  });
});
