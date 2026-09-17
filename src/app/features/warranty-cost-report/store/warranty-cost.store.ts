import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { WARRANTY_COST_DEFAULT_PAGE, WARRANTY_COST_DEFAULT_PAGE_SIZE } from '../constants/warranty-cost.constants';
import { WarrantyCostEffectiveColumn } from '../models/warranty-cost-api-response.model';
import { WarrantyCostFilters } from '../models/warranty-cost-filters.model';
import { WarrantyCostRequest } from '../models/warranty-cost-request.model';
import { WarrantyCostResponse } from '../models/warranty-cost-response.model';
import { WarrantyCostRow } from '../models/warranty-cost-row.model';
import { WarrantyCostSummary } from '../models/warranty-cost-summary.model';
import { WarrantyCostValidationErrorBody } from '../models/warranty-cost-validation-error.model';
import { Pagination } from '../models/pagination.model';
import { WarrantyCostService } from '../services/warranty-cost.service';

const GENERIC_ERROR_MESSAGE = 'Unable to load Warranty Cost Report entries. Please try again.';

/**
 * Extracts the backend's real validation message(s) (e.g. "Date range cannot exceed 366
 * days") from a `VALIDATION_FAILED`-shaped error body, falling back to a generic message
 * for any other error shape — data-mapping-fixes-from-real-rows-17-09-2026-08_02_AM.md.
 */
function toErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return GENERIC_ERROR_MESSAGE;

  const body = error.error as Partial<WarrantyCostValidationErrorBody> | null;
  const messages = body?.errors?.map((entry) => entry.message).filter(Boolean);
  return messages?.length ? messages.join('; ') : GENERIC_ERROR_MESSAGE;
}

const INITIAL_PAGINATION: Pagination = {
  page: WARRANTY_COST_DEFAULT_PAGE,
  pageSize: WARRANTY_COST_DEFAULT_PAGE_SIZE,
  totalCount: 0,
};

/**
 * Signal Store for the Warranty Cost Report feature, mirroring `DealerLedgerStore`'s
 * hand-rolled Signal Store pattern — api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md.
 * Provided at the feature route level, not `providedIn: 'root'`.
 */
@Injectable()
export class WarrantyCostStore {
  private readonly warrantyCostService = inject(WarrantyCostService);

  // ---- State ----------------------------------------------------------------------------

  private readonly _loading = signal(false);
  private readonly _hasSearched = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _rows = signal<WarrantyCostRow[]>([]);
  private readonly _summary = signal<WarrantyCostSummary | null>(null);
  private readonly _pagination = signal<Pagination>(INITIAL_PAGINATION);
  private readonly _filters = signal<WarrantyCostFilters>({});
  /** The last response's `effectiveColumns` — `null` until a real response has supplied one. */
  private readonly _effectiveColumns = signal<WarrantyCostEffectiveColumn[] | null>(null);

  readonly loading = this._loading.asReadonly();
  /** True once at least one fetch has been requested — the table stays hidden until then. */
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly error = this._error.asReadonly();
  readonly data = this._rows.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly effectiveColumns = this._effectiveColumns.asReadonly();

  /** Total rows matching the current filters across all pages (not the page size). */
  readonly filteredCount = computed(() => this._pagination().totalCount);

  // ---- Fetch pipeline ---------------------------------------------------------------------

  private readonly requests = new Subject<WarrantyCostRequest>();

  constructor() {
    this.requests
      .pipe(
        tap(() => {
          this._loading.set(true);
          this._hasSearched.set(true);
          this._error.set(null);
        }),
        switchMap((request) =>
          this.warrantyCostService.getEntries(request).pipe(
            catchError((error) => {
              this._error.set(toErrorMessage(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => this.applyResponse(response));
  }

  // ---- Methods ------------------------------------------------------------------------------

  /** Applies new filters and fetches the full matching result set. */
  search(filters: WarrantyCostFilters): void {
    this._filters.set(filters);
    this._pagination.update((pagination) => ({ ...pagination, page: WARRANTY_COST_DEFAULT_PAGE }));
    this.fetch();
  }

  /** Re-fetches with the current filters — e.g. a manual refresh action. */
  refresh(): void {
    this.fetch();
  }

  // ---- Internal -------------------------------------------------------------------------

  private fetch(): void {
    const { page, pageSize } = this._pagination();
    this.requests.next({ page, pageSize, sort: [], filters: this._filters() });
  }

  private applyResponse(response: WarrantyCostResponse | null): void {
    this._loading.set(false);
    if (!response) return;

    this._rows.set(response.rows);
    this._summary.set(response.summary);
    this._pagination.update((pagination) => ({ ...pagination, totalCount: response.totalCount }));
    if (response.effectiveColumns) {
      this._effectiveColumns.set(response.effectiveColumns);
    }
  }
}
