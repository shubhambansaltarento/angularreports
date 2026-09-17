import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DealerLedgerMockService } from './dealer-ledger-mock.service';
import { DEALER_LEDGER_REPORT_KEY } from '../constants/dealer-ledger.constants';
import { DealerLedgerApiRequest } from '../models/dealer-ledger-api-request.model';
import { DealerLedgerApiResponse, DealerLedgerApiResponseRow } from '../models/dealer-ledger-api-response.model';
import { DealerLedgerConfig } from '../models/dealer-ledger-config.model';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { DealerLedgerResponse } from '../models/dealer-ledger-response.model';
import { DealerLedgerRow } from '../models/dealer-ledger-row.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

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
    const apiRequest = this.toApiRequest(request);
    console.log(`[Dealer Ledger] Loading report data for "${DEALER_LEDGER_REPORT_KEY}"...`, apiRequest);

    return this.reportApi.getData<DealerLedgerApiRequest, DealerLedgerApiResponse>(DEALER_LEDGER_REPORT_KEY, apiRequest).pipe(
      tap((response) => console.log(`[Dealer Ledger] Report data loaded (raw):`, response)),
      map((response) => this.toDealerLedgerResponse(response, request.page)),
      tap((response) => console.log(`[Dealer Ledger] Report data mapped — ${response.rows.length} row(s).`, response)),
      catchError((error) => {
        console.error(`[Dealer Ledger] Report data fetch failed — falling back to mock data.`, error);
        return this.mockRepository.list(request);
      }),
    );
  }

  /** Maps the internal request/filters onto the backend's exact contract, per data-api-request-contract-16-09-2026-02_48_PM.md/backend-adds-checkbox-support-16-09-2026-05_24_PM.md. */
  private toApiRequest(request: DealerLedgerRequest): DealerLedgerApiRequest {
    const { filters } = request;

    return {
      parameters: {
        dealerCode: filters.dealerCode,
        companyCode: filters.companyCode ?? '',
        postingDate: { from: filters.dateFrom ?? '', to: filters.dateTo ?? '' },
        // The "Include Details" checkboxes, sent as their own real parameters ahead of
        // backend support (checkbox-filters-in-request-parameters-16-09-2026-05_08_PM.md) — always
        // sent as definite booleans, never omitted, regardless of selection.
        withOeDetails: filters.withOeDetails ?? false,
        withSpDetails: filters.withSpDetails ?? false,
        withAcDetails: filters.withAcDetails ?? false,
        withEvDetails: filters.withEvDetails ?? false,
        withAcwshDetails: filters.withAcwshDetails ?? false,
      },
      paging: { page: request.page, pageSize: request.pageSize },
      sort: request.sort.map((entry) => ({
        field: entry.columnKey,
        direction: entry.direction === 'desc' ? 'DESC' : 'ASC',
      })),
      configVersion: this.lastConfig?.configVersion ?? '',
    };
  }

  /** Maps the backend's real response shape onto the app's internal `DealerLedgerResponse`, per data-api-response-mapping-16-09-2026-03_00_PM.md. */
  private toDealerLedgerResponse(response: DealerLedgerApiResponse, page: number): DealerLedgerResponse {
    return {
      rows: response.rows.map((row, index) => this.toDealerLedgerRow(row, page, index)),
      totalCount: response.paging.totalRows,
      summary: {
        totalDebit: response.totals.debit,
        totalCredit: response.totals.credit,
        closingBalance: response.totals.debit - response.totals.credit,
        entryCount: response.paging.totalRows,
      },
      effectiveColumns: response.effectiveColumns,
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

  private toDealerLedgerRow(row: DealerLedgerApiResponseRow, page: number, index: number): DealerLedgerRow {
    return {
      id: `${page}-${index}`,
      dealerCode: row.dealerCode ?? '',
      dealerName: row.dealerName ?? '',
      dealerAddress: row.dealerAddress ?? '',
      docType: (row.docType ?? '') as DealerLedgerRow['docType'],
      docReferenceNo: row.docReferenceNo ?? '',
      docDate: this.toIsoDate(row.docDate ?? row.postingDate ?? ''),
      assignment: row.assignment ?? '',
      cca: row.cca ?? '',
      textDec: row.textDec ?? '',
      narrationVehDescription: row.vehicleNarration ?? '',
      debitAmount: row.debit ?? 0,
      creditAmount: row.credit ?? 0,
      currency: row.currency ?? '',
      text: row.text ?? '',
      qnt: row.qnt ?? 0,
      amt: row.amt ?? row.runningBalance ?? 0,
      oeRefNo: row.oeRefNo ?? '',
      spRefNo: row.spRefNo ?? '',
      acRefNo: row.acRefNo ?? '',
      evRefNo: row.evRefNo ?? '',
      acwshRefNo: row.acwshRefNo ?? '',
      cblRefNo: row.cblRefNo ?? '',
    };
  }
}
