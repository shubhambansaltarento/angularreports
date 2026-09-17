import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  WARRANTY_RECONCILIATION_DEFAULT_COMPANY_CODE,
  WARRANTY_RECONCILLATION_REPORT_KEY,
} from '../constants/warranty-reconciliation.constants';
import { WarrantyReconciliationApiRequest } from '../models/warranty-reconciliation-api-request.model';
import { WarrantyReconciliationApiResponse, WarrantyReconciliationApiResponseRow } from '../models/warranty-reconciliation-api-response.model';
import { WarrantyReconciliationConfig } from '../models/warranty-reconciliation-config.model';
import { WarrantyReconciliationRequest } from '../models/warranty-reconciliation-request.model';
import { WarrantyReconciliationResponse } from '../models/warranty-reconciliation-response.model';
import { WarrantyReconciliationRow } from '../models/warranty-reconciliation-row.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

/**
 * Feature-level facade for Warranty Reconciliation — calls the real, report-keyed API
 * (double-L `WARRANTY_RECONCILLATION`, confirmed live via direct testing —
 * api-integration-17-09-2026-08_37_AM.md). Mirrors `WarrantyCostService`'s
 * config-caching/request-mapping/response-mapping pattern, minus a `summary` (this report's
 * `totals` is always `{}`). Unlike Warranty Cost's `claimDate`, this report's
 * `reconciliationDate` is sent as a nested `{ from, to }` object under `parameters`
 * directly (not `parameters.claimDate`) — add-date-range-ui-17-09-2026-09_05_AM.md.
 */
@Injectable()
export class WarrantyReconciliationService {
  private readonly reportApi = inject(ReportApiService);

  private lastConfig: WarrantyReconciliationConfig | null = null;

  /** Fetches this report's config once — called on page entry, not per data request. */
  getConfig(): Observable<WarrantyReconciliationConfig | null> {
    console.log(`[Warranty Reconciliation] Loading report config for "${WARRANTY_RECONCILLATION_REPORT_KEY}"...`);

    return this.reportApi.getConfig<WarrantyReconciliationConfig>(WARRANTY_RECONCILLATION_REPORT_KEY).pipe(
      tap((config) => {
        console.log(`[Warranty Reconciliation] Report config loaded:`, config);
        this.lastConfig = config;
      }),
      catchError((error) => {
        console.error(`[Warranty Reconciliation] Report config fetch failed.`, error);
        this.lastConfig = null;
        return of(null);
      }),
    );
  }

  getEntries(request: WarrantyReconciliationRequest): Observable<WarrantyReconciliationResponse> {
    const apiRequest = this.toApiRequest(request);
    console.log(`[Warranty Reconciliation] Loading report data for "${WARRANTY_RECONCILLATION_REPORT_KEY}"...`, apiRequest);

    return this.reportApi
      .getData<WarrantyReconciliationApiRequest, WarrantyReconciliationApiResponse>(WARRANTY_RECONCILLATION_REPORT_KEY, apiRequest)
      .pipe(
        tap((response) => console.log(`[Warranty Reconciliation] Report data loaded (raw):`, response)),
        map((response) => this.toWarrantyReconciliationResponse(response)),
        tap((response) => console.log(`[Warranty Reconciliation] Report data mapped — ${response.rows.length} row(s).`, response)),
      );
  }

  /**
   * Maps the internal request/filters onto the backend's exact contract — `reconciliationDate`
   * is sent as a **nested** `{ from, to }` object, not flat `dateFrom`/`dateTo` sibling keys
   * (add-date-range-ui-17-09-2026-09_05_AM.md).
   */
  private toApiRequest(request: WarrantyReconciliationRequest): WarrantyReconciliationApiRequest {
    const { filters } = request;

    return {
      parameters: {
        dealerCode: filters.dealerCode,
        companyCode: WARRANTY_RECONCILIATION_DEFAULT_COMPANY_CODE,
        reconciliationDate: { from: filters.dateFrom ?? '', to: filters.dateTo ?? '' },
      },
      paging: { page: request.page, pageSize: request.pageSize },
      sort: request.sort.map((entry) => ({
        field: entry.columnKey,
        direction: entry.direction === 'desc' ? 'DESC' : 'ASC',
      })),
      configVersion: this.lastConfig?.configVersion ?? '',
    };
  }

  /** Maps the backend's real response shape onto the app's internal `WarrantyReconciliationResponse`. */
  private toWarrantyReconciliationResponse(response: WarrantyReconciliationApiResponse): WarrantyReconciliationResponse {
    return {
      rows: response.rows.map((row) => this.toWarrantyReconciliationRow(row)),
      totalCount: response.paging.totalRows,
      effectiveColumns: response.effectiveColumns,
    };
  }

  /**
   * Normalizes the backend's `DD-MM-YYYY` dates (e.g. "02-06-2026") to ISO 8601 —
   * identical fix to `WarrantyCostService.toIsoDate()`/`DealerLedgerService.toIsoDate()`
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

  private toWarrantyReconciliationRow(row: WarrantyReconciliationApiResponseRow): WarrantyReconciliationRow {
    return {
      dealerCode: row.dealerCode ?? '',
      dealerName: row.dealerName ?? '',
      reconciliationDate: this.toIsoDate(row.reconciliationDate ?? ''),
    };
  }
}
