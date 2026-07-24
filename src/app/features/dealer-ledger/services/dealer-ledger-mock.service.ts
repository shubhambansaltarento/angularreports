import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DealerLedgerRepository } from '../interfaces/dealer-ledger-repository.interface';
import { computeDealerLedgerSummary, DEALER_LEDGER_MOCK_ROWS } from '../mock/dealer-ledger-data.generator';
import { DealerLedgerFilters } from '../models/dealer-ledger-filters.model';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { DealerLedgerResponse } from '../models/dealer-ledger-response.model';
import { DealerLedgerRow } from '../models/dealer-ledger-row.model';
import { Sort } from '../models/sort.model';

const MOCK_NETWORK_DELAY_MS = 1000;

/**
 * Mock backend for the Dealer Ledger feature. Simulates a real API against an in-memory
 * dataset (50 generated records) — no HTTP is involved; RxJS `of` + `delay` simulate real
 * network latency (per requirement: artificial 1s delay).
 *
 * Implements `DealerLedgerRepository` so it can be swapped for a real HTTP-backed
 * repository later (API Framework Specification §5.14) with no change to callers.
 */
@Injectable()
export class DealerLedgerMockService implements DealerLedgerRepository {
  private readonly dataset: DealerLedgerRow[] = DEALER_LEDGER_MOCK_ROWS;

  getById(id: string): Observable<DealerLedgerRow> {
    // TODO: surface a typed NotFoundError (API Framework Specification §5.9) instead of `!`
    // once this feature's error-handling is wired up — the mock assumes a valid id for now.
    const found = this.dataset.find((row) => row.id === id)!;
    return of(found).pipe(delay(MOCK_NETWORK_DELAY_MS));
  }

  list(request: DealerLedgerRequest): Observable<DealerLedgerResponse> {
    const filtered = this.applyFilters(this.dataset, request.filters, request.search);
    const sorted = this.applySort(filtered, request.sort);
    const page = this.applyPagination(sorted, request.page, request.pageSize);

    const response: DealerLedgerResponse = {
      rows: page,
      totalCount: filtered.length,
      // Summary is computed over the full filtered/searched result set, not just the
      // current page — an aggregate must reflect the whole matching set.
      summary: computeDealerLedgerSummary(filtered),
    };

    return of(response).pipe(delay(MOCK_NETWORK_DELAY_MS));
  }

  private applyFilters(
    rows: DealerLedgerRow[],
    filters: DealerLedgerFilters,
    search?: string,
  ): DealerLedgerRow[] {
    return rows.filter((row) => {
      if (filters.dealerCode && row.dealerCode !== filters.dealerCode) return false;
      if (filters.branch && row.branch !== filters.branch) return false;
      if (filters.state && row.state !== filters.state) return false;
      if (filters.city && row.city !== filters.city) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.transactionType && row.transactionType !== filters.transactionType) return false;
      if (filters.dateFrom && row.invoiceDate < filters.dateFrom) return false;
      if (filters.dateTo && row.invoiceDate > filters.dateTo) return false;

      const searchTerm = search?.trim().toLowerCase();
      if (searchTerm) {
        const haystack = [
          row.dealerCode,
          row.dealerName,
          row.invoiceNumber,
          row.branch,
          row.state,
          row.city,
          row.transactionType,
          row.status,
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(searchTerm)) return false;
      }

      return true;
    });
  }

  private applySort(rows: DealerLedgerRow[], sort: Sort[]): DealerLedgerRow[] {
    if (!sort.length) return rows;

    return [...rows].sort((a, b) => {
      for (const { columnKey, direction } of sort) {
        const comparison = this.compareValues(
          a[columnKey as keyof DealerLedgerRow],
          b[columnKey as keyof DealerLedgerRow],
        );
        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }

  private compareValues(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  }

  private applyPagination(rows: DealerLedgerRow[], page: number, pageSize: number): DealerLedgerRow[] {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }
}
