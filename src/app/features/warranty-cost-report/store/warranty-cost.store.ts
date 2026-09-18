import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { WarrantyCostFilters } from '../models/warranty-cost-filters.model';
import { WarrantyCostStatement } from '../models/warranty-cost-statement.model';
import { WarrantyCostService } from '../services/warranty-cost.service';

const GENERIC_ERROR_MESSAGE = 'Unable to load Warranty Cost Report entries. Please try again.';

/**
 * Signal Store for Warranty Cost Report. No pagination/sort/effectiveColumns state — this
 * report is a single-statement document, not a table
 * (html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md).
 */
@Injectable()
export class WarrantyCostStore {
  private readonly warrantyCostService = inject(WarrantyCostService);

  private readonly _loading = signal(false);
  private readonly _hasSearched = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _statement = signal<WarrantyCostStatement | null>(null);

  readonly loading = this._loading.asReadonly();
  /** True once at least one fetch has been requested — the statement stays hidden until then. */
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly error = this._error.asReadonly();
  readonly statement = this._statement.asReadonly();

  private readonly requests = new Subject<WarrantyCostFilters>();
  private lastFilters: WarrantyCostFilters | null = null;

  constructor() {
    this.requests
      .pipe(
        tap(() => {
          this._loading.set(true);
          this._hasSearched.set(true);
          this._error.set(null);
        }),
        switchMap((filters) =>
          this.warrantyCostService.getEntries(filters).pipe(
            catchError(() => {
              this._error.set(GENERIC_ERROR_MESSAGE);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((statement) => this.applyStatement(statement));
  }

  /** Fetches with the given filter panel values. */
  search(filters: WarrantyCostFilters): void {
    this.lastFilters = filters;
    this.requests.next(filters);
  }

  /** Re-fetches with the last-submitted filters — e.g. a manual refresh action. */
  refresh(): void {
    if (this.lastFilters) this.requests.next(this.lastFilters);
  }

  /** Clears the current error — called when the shared alert banner is dismissed. */
  dismissError(): void {
    this._error.set(null);
  }

  private applyStatement(statement: WarrantyCostStatement | null): void {
    this._loading.set(false);
    if (!statement) return;
    this._statement.set(statement);
  }
}
