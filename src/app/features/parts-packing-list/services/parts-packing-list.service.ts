import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  PARTS_PACKING_LIST_DATA_URL,
  PARTS_PACKING_LIST_REPORT_KEY,
} from '../constants/parts-packing-list.constants';
import { PartsPackingListConfig } from '../models/parts-packing-list-config.model';
import { PartsPackingListFilters } from '../models/parts-packing-list-filters.model';
import { PartsPackingListResponse } from '../models/parts-packing-list-response.model';
import { PartsPackingListRow } from '../models/parts-packing-list-row.model';
import { TableColumn } from '../../../shared/ui/data-table/models/table-column.model';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

/** `dealerCode`'s real shape is a 10-digit, zero-padded customer number — same convention as Dealer Ledger's `kunnr`/Warranty Cost's `dealerCode`. */
const DEALER_CODE_PREFIX = '00000';

/** Converts a raw snake_case field name into a Title Case column header, e.g. `part_description` -> "Part Description". */
function toTitleCaseHeader(fieldName: string): string {
  return fieldName
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Feature-level facade for Parts Packing List — calls the real, plain (not report-keyed)
 * `fetchDatabricksdata`/`config` endpoints directly via `HttpClient`, per
 * parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md. Unlike every other
 * report, this report's table columns are derived dynamically from the first response row
 * rather than a hardcoded `*-column-definitions.ts` file, and the config response drives no
 * visible UI (this report never shows Dealer Code/Name).
 */
@Injectable()
export class PartsPackingListService {
  private readonly http = inject(HttpClient);
  private readonly reportApi = inject(ReportApiService);

  /** Fetches this report's config once, on page entry — via the generic, report-keyed endpoint (confirmed live, unlike the plain `/parts-packing-list/config` path). */
  getConfig(): Observable<PartsPackingListConfig | null> {
    console.log(`[Parts Packing List] Loading report config for "${PARTS_PACKING_LIST_REPORT_KEY}"...`);

    return this.reportApi.getConfig<PartsPackingListConfig>(PARTS_PACKING_LIST_REPORT_KEY).pipe(
      tap((config) => console.log('[Parts Packing List] Report config loaded:', config)),
      catchError((error) => {
        console.error('[Parts Packing List] Report config fetch failed.', error);
        return of(null);
      }),
    );
  }

  /**
   * `dealerCode` is supplied by the caller (this report's own UI never collects it — see
   * the spec's Open decisions) alongside the filter panel's Date Range, and is zero-padded
   * here before being sent — same convention as Dealer Ledger's `kunnr`/Warranty Cost's
   * `dealerCode`. `companyCode` is sent alongside it, sourced from config.
   *
   * Returns the raw (unfiltered) rows — Invoice Number/Delivery Number are never sent to,
   * or applied within, this fetch, since the confirmed API contract does not accept them.
   * `PartsPackingListStore` applies them afterward via `filterRows()`, both on a fresh fetch
   * and when reusing a cached fetch whose Date Range hasn't changed
   * (skip-refetch-when-date-range-unchanged-23-09-2026-11_00_AM.md).
   */
  getEntries(dealerCode: string, companyCode: string, dateFrom: string | undefined, dateTo: string | undefined): Observable<PartsPackingListResponse> {
    const body = {
      dealerCode: dealerCode ? DEALER_CODE_PREFIX + dealerCode : '',
      companyCode,
      fromDate: dateFrom ?? '',
      toDate: dateTo ?? '',
    };
    console.log('[Parts Packing List] Loading report data...', body);

    return this.http.post<Record<string, unknown>[]>(PARTS_PACKING_LIST_DATA_URL, body).pipe(
      tap((rows) => console.log('[Parts Packing List] Report data loaded (raw):', rows)),
      map((rawRows) => this.toResponse(rawRows)),
      tap((response) => console.log(`[Parts Packing List] Report data mapped — ${response.rows.length} row(s).`, response)),
    );
  }

  private toResponse(rawRows: Record<string, unknown>[]): PartsPackingListResponse {
    const rows = rawRows.map((row, index) => ({ id: String(index), ...row }) as PartsPackingListRow);
    const columns = this.deriveColumns(rawRows[0]);

    return { rows, totalCount: rows.length, columns };
  }

  /** Derives the table's columns from the first raw row's keys — no fixed column definition exists for this report. */
  private deriveColumns(firstRow: Record<string, unknown> | undefined): TableColumn<PartsPackingListRow>[] {
    if (!firstRow) return [];
    return Object.keys(firstRow).map((key) => ({ key, header: toTitleCaseHeader(key), sortable: true }));
  }

  /**
   * Applies Invoice/Delivery Number as client-side filters over already-fetched rows — not
   * sent to the real API (see `getEntries()`'s doc). Public: `PartsPackingListStore` calls
   * this both right after a fresh fetch and when re-filtering a cached fetch whose Date Range
   * is unchanged.
   */
  filterRows(rows: PartsPackingListRow[], filters: PartsPackingListFilters): PartsPackingListRow[] {
    return rows.filter((row) => {
      if (filters.invoiceNumber && !this.contains(row['invoice_number'], filters.invoiceNumber)) return false;
      if (filters.deliveryNumber && !this.contains(row['delivery_number'], filters.deliveryNumber)) return false;
      return true;
    });
  }

  private contains(value: unknown, needle: string): boolean {
    return String(value ?? '')
      .toLowerCase()
      .includes(needle.toLowerCase());
  }
}
