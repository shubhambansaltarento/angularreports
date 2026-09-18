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
  filters: PartsPackingListFilters;
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

  constructor() {
    this.requests
      .pipe(
        tap(() => {
          this._loading.set(true);
          this._hasSearched.set(true);
          this._error.set(null);
        }),
        switchMap((request) =>
          this.partsPackingListService.getEntries(request.dealerCode, request.filters).pipe(
            catchError(() => {
              this._error.set(GENERIC_ERROR_MESSAGE);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => this.applyResponse(response));
  }

  /** Fetches with the given dealer code (invisible to the user) and filter panel values. */
  search(dealerCode: string, filters: PartsPackingListFilters): void {
    const request: SearchRequest = { dealerCode, filters };
    this.lastRequest = request;
    this.requests.next(request);
  }

  /** Re-fetches with the last-submitted request — e.g. a manual refresh action. */
  refresh(): void {
    if (this.lastRequest) this.requests.next(this.lastRequest);
  }

  /** Clears the current error — called when the shared alert banner is dismissed (manually or on its auto-dismiss timer). */
  dismissError(): void {
    this._error.set(null);
  }

  private applyResponse(response: PartsPackingListResponse | null): void {
    this._loading.set(false);
    if (!response) return;

    this._rows.set(response.rows);
    this._columns.set(response.columns);
  }
}
