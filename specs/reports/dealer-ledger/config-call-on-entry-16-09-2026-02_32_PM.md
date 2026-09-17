# Dealer Ledger — Spec 17: Call the Config API Once, on Page Entry

**Created:** 2026-09-16 14:32 IST

## Status

Proposed. Refines `api-integration-16-09-2026-02_28_PM.md`.

## Purpose

Per Spec 16, `DealerLedgerService.getEntries()` currently calls
`GET {baseUrl}reports/DEALER_LEDGER/config` before every data fetch —
including every Search and Reset, not just the initial page load. This spec
moves the config call to fire exactly once, when the Dealer Ledger page/
component is entered, and logs its output to the console at that point.

## Scope

- Move the config fetch out of `DealerLedgerService.getEntries()`'s
  per-request pipeline.
- Call `ReportApiService.getConfig(DEALER_LEDGER_REPORT_KEY)` exactly once,
  from `DealerLedgerListComponent` (the page's entry point — same place
  `store.load()` is already called, per the existing "which function calls
  an API on page load" answer).
- Log the config call's start, success (with payload), and failure to the
  console.
- Data fetches (`getEntries()` for Search/Reset/initial load) no longer
  trigger a config call themselves — only the data call remains there, per
  Spec 16.

## Current implementation observations

- `DealerLedgerListComponent`'s constructor currently only calls
  `this.store.load()`.
- `DealerLedgerService.getEntries()` (per Spec 16) chains
  `getConfig() -> getData()` on every single call — called from
  `DealerLedgerStore`'s `fetch()`, which runs on `load()`, `search()`,
  `reset()`, `changePage()`, `changePageSize()`, `sort()`, and `refresh()`.
  That means config is currently re-fetched far more often than "once per
  page visit."

## Requirements

1. `DealerLedgerService` exposes a separate method (e.g. `getConfig(): Observable<unknown>`)
   that calls `ReportApiService.getConfig(DEALER_LEDGER_REPORT_KEY)` — not
   bundled into `getEntries()`.
2. `getEntries()` (the per-request data pipeline used by
   `DealerLedgerStore.fetch()`) no longer calls the config endpoint — it
   only calls `getData()` (with its existing mock fallback on failure).
3. `DealerLedgerListComponent`'s constructor calls the new `getConfig()`
   method exactly once, alongside (not instead of) `store.load()`.
4. The config call logs to the console:
   - When it starts (e.g. `[Dealer Ledger] Loading report config for "DEALER_LEDGER"...`).
   - On success, the config payload.
   - On failure, the error (the page continues to function — the config
     result is not required for `store.load()`/the table/filter panel to
     work, consistent with Spec 16 treating config as fetch-and-log only).

## Acceptance criteria

- Entering the Dealer Ledger route triggers exactly one
  `GET {baseUrl}reports/DEALER_LEDGER/config` call, visible once in the
  Network tab per page visit.
- Searching, resetting, sorting, or paging does not trigger any further
  config calls — only data calls.
- The browser console shows the config call's start/success/failure exactly
  once per page entry.
- `DealerLedgerStore`'s existing signals/behavior are unaffected — this is
  purely about when/how often config is fetched and logged.

## Open decisions

- Whether a failed config fetch should surface any user-visible state (e.g.
  a banner) or remain console-only, as it is today per Spec 16 — TBD,
  default assumption is console-only, unchanged from Spec 16's treatment.
