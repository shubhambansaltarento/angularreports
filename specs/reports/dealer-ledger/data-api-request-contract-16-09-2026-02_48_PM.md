# Dealer Ledger — Spec 19: Data API Request Contract

**Created:** 2026-09-16 14:48 IST

## Status

Accepted (implemented in the same change as this spec).

## Purpose

The real `POST {baseUrl}reports/DEALER_LEDGER/data` endpoint rejects the
request body `DealerLedgerService.getEntries()` currently sends (the app's
internal `DealerLedgerRequest` shape) because it requires a specific
contract with mandatory fields. This spec defines that request contract,
where each field's value comes from, and the sequencing needed so the data
call only fires once the config response has been fetched and mapped.

## Required request body (observed, mandatory)

```json
{
  "parameters": {
    "companyCode": "TVSL",
    "postingDate": { "from": "2026-01-01", "to": "2026-03-31" },
    "withCblDetails": false
  },
  "paging": { "page": 1, "pageSize": 50 },
  "sort": [{ "field": "postingDate", "direction": "ASC" }],
  "configVersion": "2026.08.1"
}
```

## Scope

- A `DealerLedgerApiRequest` model matching this exact contract.
- Mapping from the app's existing `DealerLedgerRequest`/`DealerLedgerFilters`
  (produced by `DealerLedgerStore`'s fetch pipeline) onto
  `DealerLedgerApiRequest`.
- Adding `dealerCode` into the request's `parameters`, alongside
  `companyCode`/`postingDate`/`withCblDetails` — not present in the sample
  payload above, but required by this request per the current task.
- Sequencing: the data call must not fire until the config call has
  resolved and been mapped (so `configVersion` and the Company Code default
  are both known and correct) — this affects only the *initial* load; every
  subsequent fetch (Search/Reset/sort/page) already runs after config has
  loaded.
- Out of scope: changing the "Include Details" checkbox UI itself
  (OE/SP/AC/EV/ACWSH) to match the config's actual single `withCblDetails`
  checkbox — tracked as a follow-up (see Open decisions); this spec only
  ensures `withCblDetails` is present and boolean in the request body.

## Field mapping

| Request field | Source |
|---|---|
| `dealerCode` (**top level**, not inside `parameters`) | `DealerLedgerFilters.dealerCode` — added per this task. Confirmed by direct API testing: placing it inside `parameters` fails with `422 VALIDATION_FAILED` / `UNKNOWN_PARAMETER`; the backend only accepts it at the request root. |
| `parameters.companyCode` | The filter panel's current Company Code value (`DealerLedgerFilters.companyCode`) — itself prefilled from the config response's `companyCode` parameter default, per `map-config-response-to-ui-16-09-2026-02_41_PM.md`. |
| `parameters.postingDate.from` / `.to` | The filter panel's currently selected Date From/Date To (`DealerLedgerFilters.dateFrom`/`dateTo`), not a fixed value — whatever range the user has selected (defaulting to the 1-month window per `default-one-month-date-range-16-09-2026-01_59_PM.md`). |
| `parameters.withCblDetails` | The corresponding checkbox selection, mapped to a boolean (see Open decisions for the current checkbox-set mismatch). |
| `paging.page` / `.pageSize` | `DealerLedgerRequest.page` / `.pageSize` (unchanged from today's store-driven pagination). |
| `sort` | `DealerLedgerRequest.sort` (`Sort[]`, `{ columnKey, direction: 'asc' \| 'desc' }`), mapped to `{ field: columnKey, direction: 'ASC' | 'DESC' }[]` (uppercased). |
| `configVersion` | The config response's own `configVersion` field (e.g. `"2026.08.1"`), cached from the config call — not the app's own version. |

**Known backend issue (not a frontend bug):** direct testing against the
live backend shows any non-empty `sort` array — including the exact sample
payload from this spec's Purpose section — currently returns
`500 INTERNAL_ERROR`. Omitting `sort` (`[]`) returns `200` successfully. The
frontend still sends `sort` per the documented contract; this is flagged for
the backend team, not worked around here.

## Current implementation observations

- `DealerLedgerService.getEntries()` currently posts the internal
  `DealerLedgerRequest` shape (`page`/`pageSize`/`sort`/`filters`/`search`)
  directly — it does not match the real backend's contract at all, which is
  why the request fails today.
- `DealerLedgerService.getConfig()` fetches and returns
  `DealerLedgerConfig | null`, but the service does not retain that value
  for reuse when building later data requests — each call is independent.
- `DealerLedgerListComponent`'s constructor calls `getConfig()` and
  `store.load()` in parallel today — nothing prevents `store.load()`'s
  resulting data request from firing before the config response (and thus
  `configVersion`) is available.
- `DealerLedgerConfig` (per Spec 18) does not yet include `configVersion` —
  needs to be added.

## Requirements

1. `DealerLedgerConfig` gains a `configVersion: string` field.
2. A `DealerLedgerApiRequest` model is added, matching the contract above
   exactly, with `dealerCode` at the request's top level (confirmed via
   direct API testing — see Field mapping).
3. `DealerLedgerService` caches the most recently loaded config (e.g. a
   private field/signal updated inside `getConfig()`'s success path).
4. `DealerLedgerService.getEntries()` builds a `DealerLedgerApiRequest` from
   the incoming `DealerLedgerRequest` plus the cached config's
   `configVersion`, per the Field mapping table, and posts that body instead
   of the raw internal request shape.
5. `DealerLedgerListComponent`'s constructor sequences its calls: it
   subscribes to `getConfig()` first, and calls `store.load()` only once
   that subscription emits (config resolved, whether success or the
   existing `null`-on-failure fallback) — not in parallel with it.
6. Console logging (per Spec 16/17) continues: config logs on its own call,
   data logs the outgoing `DealerLedgerApiRequest` body (not the old
   internal shape) so the mapped request is visible/verifiable in the
   console.

## Acceptance criteria

- The data call's request body matches the required contract exactly —
  visible in the Network tab's request payload for
  `POST http://localhost:8080/api/v1/reports/DEALER_LEDGER/data`.
- `parameters.companyCode`/`postingDate.from`/`postingDate.to` reflect
  whatever the filter panel currently shows (config default initially, or
  whatever the user has typed/picked into Date From/Date To since).
- `parameters.dealerCode` is present and reflects the current Dealer Code.
- `configVersion` matches the value returned by the config call, not a
  hardcoded string.
- On initial page load, the config call completes before the first data
  call fires (visible in Network tab ordering).
- `DealerLedgerStore`'s public API/signals are unchanged — this mapping
  happens entirely inside `DealerLedgerService`, invisible to the store and
  consuming components.

## Known follow-up (out of scope here)

Direct testing of a successful `200` response from the real backend shows
its response shape does **not** match `DealerLedgerResponse`
(`rows`/`totalCount`/`summary`) — the real response instead returns
`rows` (a partial per-row shape, not the full column set),
`totals: { debit, credit }`, `paging: { page, pageSize, totalRows, totalPages }`,
`effectiveColumns`, and `meta`. `DealerLedgerService.getEntries()` currently
maps the *request* correctly but still expects the *response* in the old
internal shape — a successful real call will not populate the table/summary
cards correctly today. This is a separate mapping problem, tracked here but
intentionally not fixed in this change (which is scoped to the request
contract only, per the task).

## Open decisions

- `withCblDetails` mapping: the app's filter panel currently exposes five
  checkboxes (OE/SP/AC/EV/ACWSH per `dealer-ledger-filter.component.ts`)
  that do not correspond to the config's single real `withCblDetails`
  checkbox. Until the filter panel's checkboxes are made config-driven
  (tracked as a future spec), this implementation sends
  `withCblDetails: false` unconditionally rather than guessing a mapping
  from the mismatched checkbox set — TBD whether/when to reconcile the
  checkbox UI with the real config's single checkbox.
- Whether `postingDate` should omit `from`/`to` (or send `null`) when the
  user has cleared the date range, versus always sending the 1-month
  default — TBD; default assumption is to always send whatever
  `DealerLedgerFilters.dateFrom`/`dateTo` currently holds, which per Spec 8
  is never actually empty (always defaults to the 1-month range).
