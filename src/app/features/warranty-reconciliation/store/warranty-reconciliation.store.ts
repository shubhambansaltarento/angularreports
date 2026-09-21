import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { WARRANTY_RECONCILIATION_DEFAULT_PAGE, WARRANTY_RECONCILIATION_DEFAULT_PAGE_SIZE } from '../constants/warranty-reconciliation.constants';
import { WarrantyReconciliationEffectiveColumn } from '../models/warranty-reconciliation-api-response.model';
import { WarrantyReconciliationFilters } from '../models/warranty-reconciliation-filters.model';
import { WarrantyReconciliationRequest } from '../models/warranty-reconciliation-request.model';
import { WarrantyReconciliationResponse } from '../models/warranty-reconciliation-response.model';
import { WarrantyReconciliationRow } from '../models/warranty-reconciliation-row.model';
import { WarrantyReconciliationValidationErrorBody } from '../models/warranty-reconciliation-validation-error.model';
import { Pagination } from '../models/pagination.model';
import { WarrantyReconciliationService } from '../services/warranty-reconciliation.service';

const GENERIC_ERROR_MESSAGE = 'Unable to load Warranty Reconciliation entries. Please try again.';

/**
 * Extracts the backend's real validation message(s) from a `VALIDATION_FAILED`-shaped error
 * body, falling back to a generic message for any other error shape — mirrors
 * `WarrantyCostStore`'s `toErrorMessage()`.
 */
function toErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return GENERIC_ERROR_MESSAGE;

  const body = error.error as Partial<WarrantyReconciliationValidationErrorBody> | null;
  const messages = body?.errors?.map((entry) => entry.message).filter(Boolean);
  return messages?.length ? messages.join('; ') : GENERIC_ERROR_MESSAGE;
}

const INITIAL_PAGINATION: Pagination = {
  page: WARRANTY_RECONCILIATION_DEFAULT_PAGE,
  pageSize: WARRANTY_RECONCILIATION_DEFAULT_PAGE_SIZE,
  totalCount: 0,
};

/**
 * Signal Store for the Warranty Reconciliation feature, mirroring `WarrantyCostStore`'s
 * hand-rolled Signal Store pattern. Provided at the feature route level, not
 * `providedIn: 'root'`. No `summary` signal — this report's `totals` is always `{}`.
 */
@Injectable()
export class WarrantyReconciliationStore {
  private readonly warrantyReconciliationService = inject(WarrantyReconciliationService);

  // ---- State ----------------------------------------------------------------------------

  private readonly _loading = signal(false);
  private readonly _hasSearched = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _rows = signal<WarrantyReconciliationRow[]>([]);
  private readonly _pagination = signal<Pagination>(INITIAL_PAGINATION);
  private readonly _filters = signal<WarrantyReconciliationFilters>({});
  /** The last response's `effectiveColumns` — `null` until a real response has supplied one. */
  private readonly _effectiveColumns = signal<WarrantyReconciliationEffectiveColumn[] | null>(null);

  readonly loading = this._loading.asReadonly();
  /** True once at least one fetch has been requested — the table stays hidden until then. */
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly error = this._error.asReadonly();
  readonly data = this._rows.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly effectiveColumns = this._effectiveColumns.asReadonly();

  /** Total rows matching the current filters across all pages (not the page size). */
  readonly filteredCount = computed(() => this._pagination().totalCount);

  // ---- Fetch pipeline ---------------------------------------------------------------------

  private readonly requests = new Subject<WarrantyReconciliationRequest>();

  constructor() {
    this.requests
      .pipe(
        tap(() => {
          this._loading.set(true);
          this._hasSearched.set(true);
          this._error.set(null);
        }),
        switchMap((request) =>
          this.warrantyReconciliationService.getEntries(request).pipe(
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
  search(filters: WarrantyReconciliationFilters): void {
    this._filters.set(filters);
    this._pagination.update((pagination) => ({ ...pagination, page: WARRANTY_RECONCILIATION_DEFAULT_PAGE }));
    this.fetch();
  }

  /** Re-fetches with the current filters — e.g. a manual refresh action. */
  refresh(): void {
    this.fetch();
  }

  /** Clears the current error — called when the shared alert banner is dismissed (manually or on its auto-dismiss timer). */
  dismissError(): void {
    this._error.set(null);
  }

  /** Clears back to the pre-search state — called by the table header's Reset control, alongside the filter panel clearing itself. */
  reset(): void {
    this._filters.set({});
    this._hasSearched.set(false);
    this._error.set(null);
    this._rows.set([]);
    this._pagination.set(INITIAL_PAGINATION);
    this._effectiveColumns.set(null);
  }

  // ---- Internal -------------------------------------------------------------------------

  private fetch(): void {
    const { page, pageSize } = this._pagination();
    this.requests.next({ page, pageSize, sort: [], filters: this._filters() });
  }

  private applyResponse(response: WarrantyReconciliationResponse | null): void {
    this._loading.set(false);
    if (!response) return;

    this._rows.set(response.rows);
    this._pagination.update((pagination) => ({ ...pagination, totalCount: response.totalCount }));
    if (response.effectiveColumns) {
      this._effectiveColumns.set(response.effectiveColumns);
    }
  }
}
