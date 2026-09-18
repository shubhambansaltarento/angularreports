import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DealerLedgerMockService } from './dealer-ledger-mock.service';
import { DEALER_LEDGER_REPORT_KEY } from '../constants/dealer-ledger.constants';
import { DealerLedgerConfig } from '../models/dealer-ledger-config.model';
import { DealerLedgerDatabricksRow } from '../models/dealer-ledger-databricks-row.model';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { DealerLedgerResponse } from '../models/dealer-ledger-response.model';
import { DealerLedgerRow } from '../models/dealer-ledger-row.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';
import { DATABRICKS_FETCH_LIMIT } from '../../../shared/constants/databricks-api.constants';

/**
 * `GET` endpoint for the real, Databricks-backed Dealer Ledger data source — the backend
 * standardized this (and Parts Packing List's) endpoint onto `fetch-data-bricks-data`, per
 * databricks-endpoints-renamed-to-fetch-data-bricks-data-18-09-2026-11_52_AM.md.
 */
const DEALER_LEDGER_DATABRICKS_URL = 'http://localhost:8080/dealer-ledger/fetch-data-bricks-data';

/** `kunnr`'s real SAP shape is a 10-digit, zero-padded customer number — always prefixed onto the filter's plain dealer code. */
const KUNNR_PREFIX = '00000';

/**
 * Feature-level facade for the Dealer Ledger feature — calls the real, report-keyed API
 * and falls back to the mock backend (DealerLedgerMockService) if a call fails, so local
 * development still works without a running backend at `localhost:8080`.
 *
 * Config (`getConfig()`) and data (`getEntries()`) are separate calls (config-call-on-entry-16-09-2026-02_32_PM.md):
 * config is fetched once, on page entry, by the consuming page; data is fetched per
 * request (initial load/Search/Reset/sort/page) via `getEntries()`. The most recently
 * loaded config is cached here (`lastConfig`) so `getEntries()` can map each internal
 * `DealerLedgerRequest` onto the real backend's exact request contract
 * (data-api-request-contract-16-09-2026-02_48_PM.md), and its real (differently-shaped) response back
 * onto the app's internal `DealerLedgerResponse` (data-api-response-mapping-16-09-2026-03_00_PM.md) —
 * the consuming page/store/table never see either backend-specific shape.
 */
@Injectable()
export class DealerLedgerService {
  private readonly http = inject(HttpClient);
  private readonly reportApi = inject(ReportApiService);
  private readonly mockRepository = inject(DealerLedgerMockService);

  private lastConfig: DealerLedgerConfig | null = null;

  /** Fetches this report's basic config/structure once — called on page entry, not per data request. */
  getConfig(): Observable<DealerLedgerConfig | null> {
    console.log(`[Dealer Ledger] Loading report config for "${DEALER_LEDGER_REPORT_KEY}"...`);

    return this.reportApi.getConfig<DealerLedgerConfig>(DEALER_LEDGER_REPORT_KEY).pipe(
      tap((config) => {
        console.log(`[Dealer Ledger] Report config loaded:`, config);
        this.lastConfig = config;
      }),
      catchError((error) => {
        console.error(`[Dealer Ledger] Report config fetch failed.`, error);
        this.lastConfig = null;
        return of(null);
      }),
    );
  }

  getEntries(request: DealerLedgerRequest): Observable<DealerLedgerResponse> {
    const params = this.toDatabricksParams(request);
    console.log(`[Dealer Ledger] Loading Databricks report data...`, params);

    return this.http.get<DealerLedgerDatabricksRow[]>(DEALER_LEDGER_DATABRICKS_URL, { params }).pipe(
      tap((rows) => console.log(`[Dealer Ledger] Databricks data loaded (raw):`, rows)),
      map((rows) => this.toDealerLedgerResponseFromDatabricks(rows, request.page)),
      tap((response) => console.log(`[Dealer Ledger] Report data mapped — ${response.rows.length} row(s).`, response)),
      catchError((error) => {
        console.error(`[Dealer Ledger] Databricks data fetch failed — falling back to mock data.`, error);
        return this.mockRepository.list(request);
      }),
    );
  }

  /** Maps the internal request/filters onto `fetchDatabricksdata`'s query parameters. */
  private toDatabricksParams(request: DealerLedgerRequest): HttpParams {
    const { filters } = request;
    let params = new HttpParams().set('limit', DATABRICKS_FETCH_LIMIT);

    if (filters.companyCode) params = params.set('bukrs', filters.companyCode);
    if (filters.dealerCode) params = params.set('kunnr', KUNNR_PREFIX + filters.dealerCode);
    if (filters.dateFrom) params = params.set('fromDate', filters.dateFrom);

    return params;
  }

  /** Maps `fetchDatabricksdata`'s flat row array onto the app's internal `DealerLedgerResponse`. */
  private toDealerLedgerResponseFromDatabricks(rows: DealerLedgerDatabricksRow[], page: number): DealerLedgerResponse {
    const mappedRows = rows.map((row, index) => this.toDealerLedgerRowFromDatabricks(row, page, index));
    const totalDebit = rows.reduce((sum, row) => sum + (row.debit_amount ?? 0), 0);
    const totalCredit = rows.reduce((sum, row) => sum + (row.credit_amount ?? 0), 0);

    return {
      rows: mappedRows,
      totalCount: rows.length,
      summary: {
        totalDebit,
        totalCredit,
        closingBalance: totalDebit - totalCredit,
        entryCount: rows.length,
      },
    };
  }

  private toDealerLedgerRowFromDatabricks(row: DealerLedgerDatabricksRow, page: number, index: number): DealerLedgerRow {
    return {
      id: `${page}-${index}`,
      dealerCode: row.dealer_code ?? '',
      dealerName: row.dealer_name ?? '',
      dealerAddress: row.dealer_address ?? '',
      docType: (row.doc_type ?? '') as DealerLedgerRow['docType'],
      docReferenceNo: row.doc_reference_no ?? '',
      docDate: this.toIsoDate(row.doc_date ?? row.post_date ?? ''),
      assignment: row.assignment ?? '',
      cca: row.credit_control_area ?? '',
      textDec: row.text_f ?? '',
      narrationVehDescription: row.narration_veh_descr ?? '',
      debitAmount: row.debit_amount ?? 0,
      creditAmount: row.credit_amount ?? 0,
      currency: row.currency ?? '',
      text: row.vehicle_text ?? '',
      qnt: 0,
      amt: row.amount ?? row.running_balance ?? 0,
      oeRefNo: '',
      spRefNo: '',
      acRefNo: '',
      evRefNo: '',
      acwshRefNo: '',
      cblRefNo: '',
    };
  }

  /**
   * Normalizes the backend's `DD-MM-YYYY` date strings (e.g. "17-06-2026") to ISO 8601
   * (`YYYY-MM-DD`), per doc-date-dd-mm-yyyy-format-17-09-2026-12_00_AM.md — `DatePipe` cannot parse
   * `DD-MM-YYYY` and throws a fatal `NG02311` at render time otherwise. Falls back to the
   * raw string, unchanged, for anything not matching the expected shape (e.g. already ISO,
   * or an unrecognized format) rather than throwing.
   */
  private toIsoDate(value: string): string {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
    if (!match) return value;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
}
