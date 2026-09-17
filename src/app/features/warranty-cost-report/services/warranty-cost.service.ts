import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { WARRANTY_COST_DEFAULT_COMPANY_CODE, WARRANTY_COST_REPORT_KEY } from '../constants/warranty-cost.constants';
import { WarrantyCostApiRequest } from '../models/warranty-cost-api-request.model';
import { WarrantyCostApiResponse, WarrantyCostApiResponseRow } from '../models/warranty-cost-api-response.model';
import { WarrantyCostConfig } from '../models/warranty-cost-config.model';
import { WarrantyCostRequest } from '../models/warranty-cost-request.model';
import { WarrantyCostResponse } from '../models/warranty-cost-response.model';
import { WarrantyCostRow } from '../models/warranty-cost-row.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

/**
 * Feature-level facade for Warranty Cost Report — calls the real, report-keyed API,
 * confirmed live via direct testing (api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md).
 * Mirrors `DealerLedgerService`'s config-caching/request-mapping/response-mapping pattern.
 * No mock fallback on error (unlike Dealer Ledger's `DealerLedgerMockService`) — this
 * report is being built directly against an already-confirmed-working real backend, so a
 * failed fetch simply surfaces an error rather than falling back to fabricated data.
 */
@Injectable()
export class WarrantyCostService {
  private readonly reportApi = inject(ReportApiService);

  private lastConfig: WarrantyCostConfig | null = null;

  /** Fetches this report's config once — called on page entry, not per data request. */
  getConfig(): Observable<WarrantyCostConfig | null> {
    console.log(`[Warranty Cost Report] Loading report config for "${WARRANTY_COST_REPORT_KEY}"...`);

    return this.reportApi.getConfig<WarrantyCostConfig>(WARRANTY_COST_REPORT_KEY).pipe(
      tap((config) => {
        console.log(`[Warranty Cost Report] Report config loaded:`, config);
        this.lastConfig = config;
      }),
      catchError((error) => {
        console.error(`[Warranty Cost Report] Report config fetch failed.`, error);
        this.lastConfig = null;
        return of(null);
      }),
    );
  }

  getEntries(request: WarrantyCostRequest): Observable<WarrantyCostResponse> {
    const apiRequest = this.toApiRequest(request);
    console.log(`[Warranty Cost Report] Loading report data for "${WARRANTY_COST_REPORT_KEY}"...`, apiRequest);

    return this.reportApi
      .getData<WarrantyCostApiRequest, WarrantyCostApiResponse>(WARRANTY_COST_REPORT_KEY, apiRequest)
      .pipe(
        tap((response) => console.log(`[Warranty Cost Report] Report data loaded (raw):`, response)),
        map((response) => this.toWarrantyCostResponse(response, request.page)),
        tap((response) => console.log(`[Warranty Cost Report] Report data mapped — ${response.rows.length} row(s).`, response)),
      );
  }

  /** Maps the internal request/filters onto the backend's exact contract. */
  private toApiRequest(request: WarrantyCostRequest): WarrantyCostApiRequest {
    const { filters } = request;

    return {
      parameters: {
        dealerCode: filters.dealerCode,
        companyCode: WARRANTY_COST_DEFAULT_COMPANY_CODE,
        claimDate: { from: filters.dateFrom ?? '', to: filters.dateTo ?? '' },
      },
      paging: { page: request.page, pageSize: request.pageSize },
      sort: request.sort.map((entry) => ({
        field: entry.columnKey,
        direction: entry.direction === 'desc' ? 'DESC' : 'ASC',
      })),
      configVersion: this.lastConfig?.configVersion ?? '',
    };
  }

  /** Maps the backend's real response shape onto the app's internal `WarrantyCostResponse`. */
  private toWarrantyCostResponse(response: WarrantyCostApiResponse, page: number): WarrantyCostResponse {
    return {
      rows: response.rows.map((row, index) => this.toWarrantyCostRow(row, page, index)),
      totalCount: response.paging.totalRows,
      summary: {
        totalLaborCost: response.totals.laborCost ?? 0,
        totalPartCost: response.totals.partCost ?? 0,
        totalCost: response.totals.totalCost ?? 0,
      },
      effectiveColumns: response.effectiveColumns,
    };
  }

  /**
   * Normalizes the backend's `DD-MM-YYYY` dates (e.g. "28-04-2026") to ISO 8601 —
   * identical fix to `DealerLedgerService.toIsoDate()`
   * (doc-date-dd-mm-yyyy-format-17-09-2026-12_00_AM.md) — `DatePipe` cannot parse
   * `DD-MM-YYYY` and throws a fatal `NG02311` at render time otherwise. Falls back to the
   * raw string, unchanged, for anything not matching the expected shape.
   */
  private toIsoDate(value: string): string {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
    if (!match) return value;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  private toWarrantyCostRow(row: WarrantyCostApiResponseRow, page: number, index: number): WarrantyCostRow {
    return {
      id: `${page}-${index}`,
      dealerCode: row.dealerCode ?? '',
      dealerName: row.dealerName ?? '',
      orderDate: this.toIsoDate(row.orderDate ?? ''),
      quantity: row.quantity ?? 0,
    };
  }
}
