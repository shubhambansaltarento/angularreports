import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { PartsPackingListFilters } from '../models/parts-packing-list-filters.model';
import { PartsPackingListResponse } from '../models/parts-packing-list-response.model';
import { PartsPackingListRow } from '../models/parts-packing-list-row.model';
import { TableColumn } from '../../../shared/ui/data-table/models/table-column.model';
import { PartsPackingListService } from '../services/parts-packing-list.service';

const GENERIC_ERROR_MESSAGE = 'Unable to load Parts Packing List entries. Please try again.';

interface SearchRequest {
  dealerCode: string;
  companyCode: string;
  filters: PartsPackingListFilters;
}

/** The last successful fetch's raw (unfiltered) rows/columns, plus the request they answer — skip-refetch-when-date-range-unchanged-23-09-2026-11_00_AM.md. */
interface CachedFetch {
  dealerCode: string;
  companyCode: string;
  dateFrom: string | undefined;
  dateTo: string | undefined;
  rawRows: PartsPackingListRow[];
  columns: TableColumn<PartsPackingListRow>[];
}

/**
 * Signal Store for Parts Packing List — mirrors `DealerLedgerStore`'s hand-rolled pattern.
 * No pagination/sort request fields: the confirmed API is not paginated, and the table
 * paginates/sorts the fetched rows entirely client-side (same as Dealer Ledger). Also
 * holds `columns()`, since this report's columns are derived per-fetch rather than fixed.
 */
@Injectable()
export class PartsPackingListStore {
  private readonly partsPackingListService = inject(PartsPackingListService);

  private readonly _loading = signal(false);
  private readonly _hasSearched = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _rows = signal<PartsPackingListRow[]>([]);
  private readonly _columns = signal<TableColumn<PartsPackingListRow>[]>([]);

  readonly loading = this._loading.asReadonly();
  /** True once at least one fetch has been requested — the table stays hidden until then. */
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly error = this._error.asReadonly();
  readonly data = this._rows.asReadonly();
  readonly columns = this._columns.asReadonly();

  private readonly requests = new Subject<SearchRequest>();
  private lastRequest: SearchRequest | null = null;
  private cachedFetch: CachedFetch | null = null;

  constructor() {
    this.requests
      .pipe(
        tap(() => {
          this._loading.set(true);
          this._hasSearched.set(true);
          this._error.set(null);
        }),
        switchMap((request) =>
          this.partsPackingListService.getEntries(request.dealerCode, request.companyCode, request.filters.dateFrom, request.filters.dateTo).pipe(
            catchError(() => {
              this._error.set(GENERIC_ERROR_MESSAGE);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => this.applyResponse(response, this.lastRequest));
  }

  /**
   * Fetches with the given dealer/company code (both invisible to the user, sourced from
   * config) and filter panel values — unless `dealerCode`/`companyCode`/Date Range are
   * unchanged from the last successful fetch, in which case the real API call is skipped
   * entirely and Invoice/Delivery Number are re-applied over the cached raw rows instead
   * (skip-refetch-when-date-range-unchanged-23-09-2026-11_00_AM.md) — those two fields never
   * affect the underlying query, so re-fetching for them alone would return identical rows.
   */
  search(dealerCode: string, companyCode: string, filters: PartsPackingListFilters): void {
    const request: SearchRequest = { dealerCode, companyCode, filters };

    const cache = this.cachedFetch;
    if (
      cache &&
      cache.dealerCode === dealerCode &&
      cache.companyCode === companyCode &&
      cache.dateFrom === filters.dateFrom &&
      cache.dateTo === filters.dateTo
    ) {
      console.log(
        `[Parts Packing List] Date range unchanged (${cache.dateFrom} – ${cache.dateTo}) — skipping fetch, filtering cached results for Invoice/Delivery Number only.`,
      );
      this.lastRequest = request;
      this._hasSearched.set(true);
      this._error.set(null);
      const rows = this.partsPackingListService.filterRows(cache.rawRows, filters);
      this._rows.set(rows);
      this._columns.set(cache.columns);
      return;
    }

    this.lastRequest = request;
    this.requests.next(request);
  }

  /** Re-fetches with the last-submitted request — e.g. a manual refresh action. Always hits the real API, bypassing the cache above. */
  refresh(): void {
    if (this.lastRequest) this.requests.next(this.lastRequest);
  }

  /** Clears the current error — called when the shared alert banner is dismissed (manually or on its auto-dismiss timer). */
  dismissError(): void {
    this._error.set(null);
  }

  /** Clears back to the pre-search state — called by the table header's Reset control, alongside the filter panel clearing itself. */
  reset(): void {
    this.lastRequest = null;
    this.cachedFetch = null;
    this._hasSearched.set(false);
    this._error.set(null);
    this._rows.set([]);
    this._columns.set([]);
  }

  private applyResponse(response: PartsPackingListResponse | null, request: SearchRequest | null): void {
    this._loading.set(false);
    if (!response || !request) return;

    this.cachedFetch = {
      dealerCode: request.dealerCode,
      companyCode: request.companyCode,
      dateFrom: request.filters.dateFrom,
      dateTo: request.filters.dateTo,
      rawRows: response.rows,
      columns: response.columns,
    };

    this._rows.set(this.partsPackingListService.filterRows(response.rows, request.filters));
    this._columns.set(response.columns);
  }
}
