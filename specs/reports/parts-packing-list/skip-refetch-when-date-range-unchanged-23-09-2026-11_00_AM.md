# Parts Packing List — Spec: Skip Re-Fetch When Only Invoice/Delivery Number Changes

**Created:** 23-09-2026 11:00 AM IST

## Status

Implemented.

## Purpose

Parts Packing List's real API (`fetch-data-bricks-data`) only accepts `dealerCode`,
`companyCode`, `fromDate`, `toDate` — Invoice Number/Delivery Number are never sent to it; they
are applied afterward as client-side substring filters over the fetched rows
(`PartsPackingListService.filterRows()`, per
`parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md`).

Today, every "Show Report" click — regardless of what changed — calls
`PartsPackingListStore.search()`, which always issues a fresh HTTP request. If the user only
edits Invoice Number and/or Delivery Number and the Date Range is unchanged from the last
submitted search, the exact same backend query would run again for no reason: the underlying
row set the query returns cannot have changed, since Invoice/Delivery Number play no part in
it.

## Requirement

1. `PartsPackingListService.getEntries(dealerCode, companyCode, dateFrom, dateTo)` no longer
   takes `filters`/applies any filtering itself — it now returns the raw (unfiltered) rows plus
   derived columns. A new public `PartsPackingListService.filterRows(rows, filters)` (renamed
   from the previous private `applyClientFilters()`) applies Invoice Number/Delivery Number
   afterward, callable by the store on both a fresh fetch and a cache hit.
2. `PartsPackingListStore` retains the **last successful raw fetch** in a private `cachedFetch`:
   the `dealerCode`/`companyCode`/`dateFrom`/`dateTo` it queried with, plus the raw rows and
   columns the API returned.
3. On `search(dealerCode, companyCode, filters)`:
   - If `cachedFetch` exists and its `dealerCode`, `companyCode`, `dateFrom`, `dateTo` all match
     the new call's — skip the HTTP call entirely. Call `filterRows()` on the cached raw rows
     with the new `filters`, and update `data`/`columns` from that directly.
   - Log to the console when this happens: `[Parts Packing List] Date range unchanged
     (<fromDate> – <toDate>) — skipping fetch, filtering cached results for Invoice/Delivery
     Number only.`
   - Otherwise, fetch normally (exactly as today), and on success cache the new raw
     rows/columns/request in `cachedFetch` before applying `filterRows()` to populate `data`.
4. `store.reset()` clears `cachedFetch` too, so a Reset genuinely returns to a clean pre-search
   state — a subsequent search always re-fetches rather than reusing a stale cache from before
   the Reset.
5. `store.refresh()` (used by the error banner's Retry action) pushes directly onto the fetch
   pipeline, bypassing `search()`'s cache check entirely — a Retry always re-fetches from the
   real API.

## Out of scope

- No change to what's sent to the API — `dealerCode`/`companyCode`/`fromDate`/`toDate` remain
  the only request parameters.
- No change to Invoice Number/Delivery Number's substring-match logic itself
  (`PartsPackingListService.contains()`).
- Does not extend this caching behavior to any other report — Parts Packing List is the only
  report whose filter fields are entirely client-side today.

## Acceptance criteria

- Submitting Show Report with the same Date Range as the last search, but a different
  Invoice Number/Delivery Number (or vice versa), does not trigger a new HTTP request — the
  Network tab shows no new call to `fetch-data-bricks-data`, and the console logs the
  skip-fetch message with the unchanged date range.
- The table still updates correctly, showing only rows matching the new Invoice
  Number/Delivery Number, filtered from the previously-fetched raw rows.
- Changing the Date Range (either bound), or changing `dealerCode`/`companyCode`, still
  triggers a real fetch.
- Reset clears the cache; the next search after a Reset always re-fetches.
- Retry (after an error) always re-fetches, never serves from the cache.

## Open decisions

- Whether the cache should persist across a full page reload (e.g. `sessionStorage`) or exist
  only in memory for the current page visit — defaulting to in-memory only (component/store
  lifetime) unless told otherwise, since no other report caches anything across reloads today.
