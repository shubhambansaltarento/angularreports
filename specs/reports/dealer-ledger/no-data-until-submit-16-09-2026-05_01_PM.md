# Dealer Ledger — Spec 25: No Table Data Until Submit Is Clicked

**Created:** 2026-09-16 17:01 IST

## Status

Proposed. Refines the initial-load behavior established by
`data-api-request-contract-16-09-2026-02_48_PM.md`/`api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md`,
in light of `submit-button-replaces-auto-search-16-09-2026-04_54_PM.md`'s explicit Submit
control.

## Purpose

Today, as soon as the config API resolves, `DealerLedgerListComponent`
automatically calls `store.search()` with config-derived filters — so the
table/summary cards populate with data immediately on page load, before the
user has clicked Submit even once. Per Spec 24, Submit is now the sole,
explicit trigger for a data fetch; this spec extends that principle to the
very first load: **no data request happens, and the table shows no rows,
until the user clicks Submit**.

## Scope

- `DealerLedgerListComponent`'s constructor stops calling `store.search()`
  automatically once config resolves. Config is still fetched on entry
  (per Spec 17) — only the *data* fetch is deferred.
- The filter panel's fields are still prefilled from config (Dealer
  Code/Description, Company Code default, the 1-month Report Range) exactly
  as today — the user sees populated fields, just no fetched rows, until
  they click Submit.
- The table renders its existing empty state (no rows) and the summary
  cards show their existing zero/loading-less state until the first Submit.
- Reset (via the table header) continues to clear/re-default the filter
  panel, per `reset-in-table-header-16-09-2026-01_59_PM.md` — this spec does not change
  what Reset does; it only removes the *automatic* initial fetch. Whether
  Reset should also clear back to "no data shown" is addressed in Open
  decisions.
- Out of scope: any change to Submit's own behavior (already correct per
  Spec 24) or to config fetching/logging (Spec 16/17, unchanged).

## Current implementation observations

- `DealerLedgerListComponent`'s constructor:
  ```ts
  this.dealerLedgerService.getConfig().pipe(takeUntilDestroyed()).subscribe((config) => {
    this.config.set(config);
    this.store.search(this.buildInitialFilters(config));
  });
  ```
  The `store.search(...)` call here is what causes an automatic data fetch
  and populates the table before any user interaction.
- `DealerLedgerStore.search()` is the same method Submit
  (`DealerLedgerFilterComponent`'s `onSubmit()` → `DealerLedgerListComponent.onSearch()`)
  already calls — removing the constructor's call does not require any
  store changes.
- `DealerLedgerTableComponent`/`DataTableComponent` already have a
  documented empty state (`emptyStateMessage`) for zero rows — no new UI
  state needs to be built, only the automatic fetch needs to stop.
- `DealerLedgerSummaryCardsComponent` renders `store.summary()`, which
  starts `null` until a response arrives — its existing null-state
  rendering already covers "before any Submit."

## Requirements

1. `DealerLedgerListComponent`'s constructor no longer calls
   `store.search(this.buildInitialFilters(config))` — it only sets
   `this.config.set(config)`.
2. `buildInitialFilters()` is repurposed (or removed) — if kept, it may
   still serve as the source for the filter panel's *prefill* (already
   handled inside `DealerLedgerFilterComponent.initialValue`, which reads
   `config()` directly), so the list page may no longer need its own copy
   at all once the automatic call is removed (see Open decisions).
3. On page entry, the table shows its empty state and the summary cards
   show their zero/null state — no network request to the data API occurs
   until the user clicks Submit.
4. Clicking Submit (per Spec 24) performs the first data fetch, using
   whatever values are currently in the six fields (which are still
   config-prefilled, so a user who just clicks Submit without changing
   anything gets the same result today's automatic fetch would have
   produced).

## Acceptance criteria

- Loading the Dealer Ledger page shows the filter panel prefilled (from
  config) but the table empty and summary cards at their zero/placeholder
  state — confirmed by no data-API network request firing on load (only the
  config request fires).
- Clicking Submit (with no changes to the prefilled fields) fetches and
  displays the same result the old automatic initial fetch used to show.
- `dealer-ledger-list.component.spec.ts` is updated: the existing test
  asserting an automatic `store.search()` call on construction is replaced
  with a test asserting **no** `store.search()`/`store.load()` call occurs
  until `onSearch()`/Submit fires.

## Open decisions

- Whether `DealerLedgerListComponent.buildInitialFilters()` is deleted
  entirely (since its only caller was the removed automatic fetch) — default
  assumption is yes, delete it, since `DealerLedgerFilterComponent.initialValue`
  already independently derives the same prefill values from `config()` for
  display purposes.
- Whether the table header's Reset control should, after this change,
  clear the table back to "no data" (matching the new initial state) rather
  than re-fetching an unfiltered result set — default assumption is Reset's
  behavior is unchanged (it still fetches, per
  `reset-in-table-header-16-09-2026-01_59_PM.md`) since the user has, by the time Reset is
  available/enabled, already performed at least one Submit — this spec only
  changes the state *before* the first Submit.
