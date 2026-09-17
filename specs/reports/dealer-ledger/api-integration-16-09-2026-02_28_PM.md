# Dealer Ledger — Spec 16: Real API Integration (Config + Data)

**Created:** 2026-09-16 14:28 IST

## Status

Proposed.

## Purpose

Replace Dealer Ledger's mock-backend data source
(`DealerLedgerMockService`, referenced from `DealerLedgerService` per its own
TODO) with real HTTP calls to a generic, report-keyed API, and add console
logging around the Dealer Ledger page's load sequence so the API calls are
visible/traceable during development.

## Scope

- A shared base URL and a generic, report-keyed API client usable by any
  report (not just Dealer Ledger), per the existing Multi-Report Framework
  pattern (`ReportConfig`, `reports.registry.ts`).
- Two endpoints per report: a "config" endpoint (basic report structure) and
  a "data" endpoint (the actual rows/summary/pagination).
- Wiring Dealer Ledger specifically to this client, with `DEALER_LEDGER` as
  the report key passed dynamically (a constant/parameter, not hardcoded
  inline at each call site).
- Console logging when Dealer Ledger loads: config fetch start/success,
  data fetch start/success, and errors.
- Out of scope: actually removing `DealerLedgerMockService` (kept as a
  fallback/dev toggle — see Open decisions), building the config endpoint's
  consumer UI (rendering report structure dynamically), and any other
  report adopting these endpoints yet.

## API contract

- Base URL: `http://localhost:8080/api/v1/`.
- Config: `GET {baseUrl}reports/{reportKey}/config` — basic configuration/
  structure for the given report (e.g. column definitions, available
  filters — exact response shape TBD, see Open decisions).
- Data: `GET {baseUrl}reports/{reportKey}/data` — the report's rows/summary/
  pagination for the current request (filters/sort/page), following the
  existing `DealerLedgerRequest`/`DealerLedgerResponse` shapes already
  defined in `dealer-ledger-request.model.ts`/`dealer-ledger-response.model.ts`.
- `{reportKey}` is a dynamic path segment — for Dealer Ledger it is the
  literal string `DEALER_LEDGER`, supplied as a constant
  (`DEALER_LEDGER_REPORT_KEY`) so the same client code serves any future
  report by substituting its own key.

## Current implementation observations

- `DealerLedgerService.getEntries()` currently delegates directly to
  `DealerLedgerMockService.list()` — no HTTP call exists anywhere in the app
  yet, and `provideHttpClient()` is not registered in `app.config.ts`.
- `DealerLedgerStore`'s `fetch()`/`applyResponse()` pipeline
  (`dealer-ledger.store.ts`) already shapes requests as `DealerLedgerRequest`
  and consumes `DealerLedgerResponse` — swapping the service's data source
  requires no store-level changes if the new HTTP-backed service returns the
  same `Observable<DealerLedgerResponse>` shape.
- No report currently has a "config" concept fetched from a backend — column
  definitions are hardcoded per report (e.g.
  `DEALER_LEDGER_TABLE_COLUMNS` in `dealer-ledger-table.component.ts`). This
  spec introduces fetching that config but does not yet require the table to
  consume it dynamically (see Scope).

## Requirements

1. A shared `API_BASE_URL` constant holds `http://localhost:8080/api/v1/`.
2. A shared, generic API service (e.g. `ReportApiService` in
   `shared/services/report-api`) exposes:
   - `getConfig(reportKey: string): Observable<unknown>` → `GET
     {baseUrl}reports/{reportKey}/config`
   - `getData<TRequest, TResponse>(reportKey: string, request: TRequest): Observable<TResponse>`
     → `GET {baseUrl}reports/{reportKey}/data` (request serialized as query
     params, or `POST` with a body — see Open decisions)
3. `provideHttpClient()` is added to `app.config.ts` so `HttpClient` is
   available for injection.
4. A `DEALER_LEDGER_REPORT_KEY = 'DEALER_LEDGER'` constant is defined in the
   Dealer Ledger feature (e.g. `dealer-ledger.constants.ts`) and passed into
   `ReportApiService` calls — never a hardcoded string literal at the call
   site.
5. `DealerLedgerService` calls `ReportApiService.getConfig(DEALER_LEDGER_REPORT_KEY)`
   and `ReportApiService.getData(DEALER_LEDGER_REPORT_KEY, request)` instead
   of (or alongside, per Open decisions) `DealerLedgerMockService`.
6. On Dealer Ledger page load (`DealerLedgerStore.load()`), the app logs to
   the console:
   - When the config fetch starts and when it succeeds/fails (with the
     report key and, on success, the config payload).
   - When the data fetch starts and when it succeeds/fails (with the
     request and, on success, the row count/summary).
7. Logging uses `console.log`/`console.error` directly (no logging
   abstraction exists yet in this codebase, per the existing
   `// TODO: surface via the platform's Logging adapter` comments already
   present in `data-table.component.ts`) — this spec does not introduce a
   new logging service.

## Acceptance criteria

- Navigating to the Dealer Ledger page triggers a `GET` to
  `http://localhost:8080/api/v1/reports/DEALER_LEDGER/config` and a `GET` to
  `http://localhost:8080/api/v1/reports/DEALER_LEDGER/data` (visible in the
  browser Network tab).
- The browser console logs clear, labeled messages for both calls'
  start/success/error, when loading Dealer Ledger.
- `DealerLedgerStore`'s existing `data()`/`summary()`/`pagination()`/
  `loading()`/`error()` signals continue to work exactly as before from the
  consuming components' point of view (no breaking change to the store's
  public API).
- If the API is unreachable (e.g. no backend running at
  `localhost:8080` during local dev), the existing error banner
  (`store.error()`) still surfaces, per current error handling in
  `dealer-ledger.store.ts`.

## Open decisions

- Whether `DealerLedgerMockService` is deleted outright once the real API is
  wired, or kept behind an environment/dev-only toggle for local development
  without a running backend — TBD, default assumption is to keep it
  available (e.g. swap via `DealerLedgerService`'s injected dependency) since
  no `environment.ts` file exists yet in this project to gate it cleanly,
  and removing it outright would break local dev without the backend.
- Exact shape of the "config" response (columns? filter definitions? both?)
  and whether the table/filter panel start consuming it dynamically, or it
  is only fetched-and-logged for now — TBD; this spec only requires the call
  to happen and be logged, not the UI to react to it yet.
- `GET` with query params vs. `POST` with a JSON body for the data endpoint,
  given `DealerLedgerRequest` includes nested `filters`/`sort` — TBD, default
  assumption is `POST` (simpler than serializing nested objects into a query
  string), even though the endpoint is described as a "data" fetch.
- Whether `http://localhost:8080` should already live in an `environment.ts`
  file (introducing environment-based config to the project for the first
  time) rather than a plain shared constant — TBD, default assumption is a
  plain constant for now, since no environment file exists yet and adding
  one is a larger, separate concern.
