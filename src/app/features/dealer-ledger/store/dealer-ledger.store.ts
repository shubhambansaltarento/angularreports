import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { DEALER_LEDGER_DEFAULT_PAGE, DEALER_LEDGER_DEFAULT_PAGE_SIZE } from '../constants/dealer-ledger.constants';
import { DealerLedgerFilters } from '../models/dealer-ledger-filters.model';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { DealerLedgerResponse } from '../models/dealer-ledger-response.model';
import { DealerLedgerRow } from '../models/dealer-ledger-row.model';
import { DealerLedgerSummary } from '../models/dealer-ledger-summary.model';
import { Pagination } from '../models/pagination.model';
import { SelectionState } from '../models/selection-state.model';
import { Sort, SortDirection } from '../models/sort.model';
import { DealerLedgerService } from '../services/dealer-ledger.service';

const INITIAL_PAGINATION: Pagination = {
  page: DEALER_LEDGER_DEFAULT_PAGE,
  pageSize: DEALER_LEDGER_DEFAULT_PAGE_SIZE,
  totalCount: 0,
};
const INITIAL_SELECTION: SelectionState = { selectedIds: [], allMatchingFilter: false, excludedIds: [] };

/**
 * Signal Store for the Dealer Ledger feature — a hand-rolled `@Injectable()` class built
 * from Angular Signals (writable private state + readonly exposed signals + `computed()`),
 * per the approved Signal Store Architecture Specification. Deliberately NOT using
 * `@ngrx/signals`'s `signalStore()` factory — this project does not depend on NgRx.
 *
 * Provided at the feature route level (see dealer-ledger.routes.ts), not `providedIn: 'root'`,
 * so its state does not leak beyond this feature.
 *
 * Note: the "Sort" state is exposed as `sortState`, not `sort` — `sort` is already the verb
 * method name (`sort(columnKey)`), and a class cannot declare two members with the same name.
 */
@Injectable()
export class DealerLedgerStore {
  private readonly dealerLedgerService = inject(DealerLedgerService);

  // ---- State ----------------------------------------------------------------------------

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _rows = signal<DealerLedgerRow[]>([]);
  private readonly _summary = signal<DealerLedgerSummary | null>(null);
  private readonly _pagination = signal<Pagination>(INITIAL_PAGINATION);
  private readonly _sort = signal<Sort[]>([]);
  private readonly _filters = signal<DealerLedgerFilters>({});
  private readonly _searchTerm = signal('');
  private readonly _selection = signal<SelectionState>(INITIAL_SELECTION);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly data = this._rows.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly sortState = this._sort.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selection = this._selection.asReadonly();

  // ---- Computed ---------------------------------------------------------------------------

  /** Total Debit across the full filtered/searched result set (not just the current page). */
  readonly totalDebit = computed(() => this._summary()?.totalDebit ?? 0);

  /** Total Credit across the full filtered/searched result set (not just the current page). */
  readonly totalCredit = computed(() => this._summary()?.totalCredit ?? 0);

  /** Net movement (Total Debit - Total Credit) across the full filtered/searched result set. */
  readonly closingBalance = computed(() => this._summary()?.closingBalance ?? 0);

  /** Total rows matching the current filters/search across all pages (not the page size). */
  readonly filteredCount = computed(() => this._pagination().totalCount);

  // ---- Fetch pipeline ---------------------------------------------------------------------

  private readonly requests = new Subject<DealerLedgerRequest>();

  constructor() {
    this.requests
      .pipe(
        tap(() => {
          this._loading.set(true);
          this._error.set(null);
        }),
        switchMap((request) =>
          this.dealerLedgerService.getEntries(request).pipe(
            catchError(() => {
              this._error.set('Unable to load Dealer Ledger entries. Please try again.');
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => this.applyResponse(response));
  }

  // ---- Methods ------------------------------------------------------------------------------

  /** Initial fetch using whatever filters/sort/pagination the store currently holds. */
  load(): void {
    this.fetch();
  }

  /** Applies new filters/search term, resets to page 1, and fetches. */
  search(filters: DealerLedgerFilters, searchTerm = ''): void {
    this._filters.set(filters);
    this._searchTerm.set(searchTerm);
    this._pagination.update((pagination) => ({ ...pagination, page: DEALER_LEDGER_DEFAULT_PAGE }));
    this.fetch();
  }

  /** Clears filters, search term, sort, and selection back to their defaults, and fetches. */
  reset(): void {
    this._filters.set({});
    this._searchTerm.set('');
    this._sort.set([]);
    this._selection.set(INITIAL_SELECTION);
    this._pagination.update((pagination) => ({ ...pagination, page: DEALER_LEDGER_DEFAULT_PAGE }));
    this.fetch();
  }

  /** Navigates to the given 1-based page and fetches. */
  changePage(page: number): void {
    this._pagination.update((pagination) => ({ ...pagination, page: Math.max(DEALER_LEDGER_DEFAULT_PAGE, page) }));
    this.fetch();
  }

  /** Changes the page size, resets to page 1, and fetches. */
  changePageSize(pageSize: number): void {
    this._pagination.update((pagination) => ({ ...pagination, pageSize, page: DEALER_LEDGER_DEFAULT_PAGE }));
    this.fetch();
  }

  /** Cycles the given column's sort direction (none -> asc -> desc -> none), resets to page 1, and fetches. */
  sort(columnKey: string): void {
    const existing = this._sort().find((entry) => entry.columnKey === columnKey);
    const nextDirection: SortDirection | null =
      !existing ? 'asc' : existing.direction === 'asc' ? 'desc' : null;

    this._sort.set(nextDirection ? [{ columnKey, direction: nextDirection }] : []);
    this._pagination.update((pagination) => ({ ...pagination, page: DEALER_LEDGER_DEFAULT_PAGE }));
    this.fetch();
  }

  /**
   * Toggles a single row's selection. Respects the "select all matching filter" mode
   * (SelectionState model): once that mode is active, toggling a row adds/removes it from
   * the exclusion set rather than the selected-ids list.
   */
  toggleSelection(id: string): void {
    this._selection.update((selection) => {
      if (selection.allMatchingFilter) {
        const isExcluded = selection.excludedIds.includes(id);
        return {
          ...selection,
          excludedIds: isExcluded
            ? selection.excludedIds.filter((excludedId) => excludedId !== id)
            : [...selection.excludedIds, id],
        };
      }

      const isSelected = selection.selectedIds.includes(id);
      return {
        ...selection,
        selectedIds: isSelected
          ? selection.selectedIds.filter((selectedId) => selectedId !== id)
          : [...selection.selectedIds, id],
      };
    });
  }

  /** Re-fetches the current page with the current filters/sort — e.g. a manual refresh action. */
  refresh(): void {
    this.fetch();
  }

  // ---- Internal -------------------------------------------------------------------------

  private fetch(): void {
    const { page, pageSize } = this._pagination();
    this.requests.next({
      page,
      pageSize,
      sort: this._sort(),
      filters: this._filters(),
      search: this._searchTerm() || undefined,
    });
  }

  private applyResponse(response: DealerLedgerResponse | null): void {
    this._loading.set(false);
    if (!response) return;

    this._rows.set(response.rows);
    this._summary.set(response.summary);
    this._pagination.update((pagination) => ({ ...pagination, totalCount: response.totalCount }));
  }
}
