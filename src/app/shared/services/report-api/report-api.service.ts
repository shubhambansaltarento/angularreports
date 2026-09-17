import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';

/**
 * Generic, report-keyed API client — shared by any report (Multi-Report Framework
 * pattern), per api-integration-16-09-2026-02_28_PM.md. `reportKey` is a dynamic path segment (e.g.
 * `'DEALER_LEDGER'`); callers pass their own report's key rather than hardcoding a path.
 */
@Injectable({ providedIn: 'root' })
export class ReportApiService {
  private readonly http = inject(HttpClient);

  /** GET {baseUrl}reports/{reportKey}/config — basic report structure (columns/filters/etc). */
  getConfig<TConfig = unknown>(reportKey: string): Observable<TConfig> {
    return this.http.get<TConfig>(`${API_BASE_URL}reports/${reportKey}/config`);
  }

  /** POST {baseUrl}reports/{reportKey}/data — rows/summary/pagination for the given request. */
  getData<TRequest, TResponse>(reportKey: string, request: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(`${API_BASE_URL}reports/${reportKey}/data`, request);
  }
}
