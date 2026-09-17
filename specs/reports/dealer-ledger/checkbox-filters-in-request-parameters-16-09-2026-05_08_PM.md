# Dealer Ledger — Spec 26: Include Details Checkboxes Must Be Sent in the Submit Request's `parameters`

**Created:** 2026-09-16 17:08 IST

## Status

Accepted — implemented UI/request-contract-first (per explicit decision):
the frontend sends all five checkboxes as their own real parameters, ahead
of backend support. Direct API testing confirms the live backend currently
rejects all five as `UNKNOWN_PARAMETER` (422) — this is a known,
intentional gap until the backend adds support (see Open decisions), not a
frontend bug.

## Purpose

"Include Details" (With OE/SP/AC/EV/ACWSH Details) is a real, user-visible
filter — the reference image shows 2 of 5 checked, with "(2 selected)" — but
today, clicking Submit **drops these entirely**: `DealerLedgerService`'s
request mapping hardcodes `parameters.withCblDetails: false` regardless of
what the user actually checked. The checkbox state never reaches the
backend. This spec makes the current checkbox selection part of the
Submit request's `parameters`, so the API can actually act on it.

## Scope

- `DealerLedgerService.toApiRequest()`'s mapping from
  `DealerLedgerFilters` (`withOeDetails`/`withSpDetails`/`withAcDetails`/
  `withEvDetails`/`withAcwshDetails` — already present on that model and
  already populated correctly by `DealerLedgerListComponent.toFilters()`
  from the checkbox selection) onto `DealerLedgerApiRequestParameters`.
- `DealerLedgerApiRequestParameters`'s shape, to carry all five flags
  instead of only the single `withCblDetails` boolean it has today.
- Out of scope: changing the checkbox UI itself (five checkboxes, one
  selection state — unchanged) or the config API's `parameters` metadata
  (which only currently declares a single `withCblDetails` — see Open
  decisions for how that mismatch is resolved).

## Current implementation observations

- `DealerLedgerFilters` already has `withOeDetails?: boolean`,
  `withSpDetails?: boolean`, `withAcDetails?: boolean`,
  `withEvDetails?: boolean`, `withAcwshDetails?: boolean` — correctly
  populated by `DealerLedgerListComponent.toFilters()` from the filter
  panel's `checkboxSelection` (`oe`/`sp`/`ac`/`ev`/`acwsh` keys).
- `DealerLedgerService.toApiRequest()` currently ignores all five fields on
  `request.filters` and hardcodes:
  ```ts
  parameters: {
    companyCode: filters.companyCode ?? '',
    postingDate: { from: filters.dateFrom ?? '', to: filters.dateTo ?? '' },
    withCblDetails: false, // TODO from data-api-request-contract-16-09-2026-02_48_PM — never wired to the real checkboxes
  }
  ```
- `DealerLedgerApiRequestParameters` only has a single `withCblDetails`
  field, matching the *config* API's currently-declared single checkbox
  parameter (`withCblDetails`) — not the five checkboxes actually rendered.
- The real config response's `parameters` array only lists one boolean
  parameter (`withCblDetails`) — the UI's five checkboxes were never
  reconciled with the config's declared parameter set (this exact mismatch
  was already flagged as an open decision in `data-api-request-contract-16-09-2026-02_48_PM`).

## Requirements

1. `DealerLedgerApiRequestParameters` gains all five boolean fields —
   `withOeDetails`, `withSpDetails`, `withAcDetails`, `withEvDetails`,
   `withAcwshDetails` — alongside `companyCode`/`postingDate`. The single
   `withCblDetails` field is removed (the UI has no "CBL Details" checkbox
   — it doesn't correspond to anything in this app's filter panel).
2. `DealerLedgerService.toApiRequest()` maps each of
   `filters.withOeDetails`/`withSpDetails`/`withAcDetails`/`withEvDetails`/
   `withAcwshDetails` (defaulting to `false` when `undefined`) directly
   onto the corresponding `parameters` field.
3. Clicking Submit with any combination of the five checkboxes checked
   sends that exact combination as boolean flags inside the request's
   `parameters` object — always all five, never omitted, regardless of
   selection.
4. Console logging (per Spec 16/17) continues to show the outgoing mapped
   request, so all five flags are visible/verifiable in the console.

## Known backend gap (not a frontend bug)

Direct testing against the live backend confirms it currently rejects this
request with `422 VALIDATION_FAILED` / `UNKNOWN_PARAMETER` for every one of
the five new field names — its config only declares a single
`withCblDetails` boolean (see `data-api-request-contract-16-09-2026-02_48_PM`'s original observation). Submitting
with any "Include Details" checkbox checked will fail against the real
backend as it exists today. This is intentional: the frontend now sends the
*correct* five-flag contract ahead of the backend adding support for it,
rather than working around the backend's current, narrower shape — per an
explicit decision to implement the UI/request side first.

## Acceptance criteria

- With "With AC Details" and "With EV Details" checked (matching the
  reference image's "(2 selected)" state) and Submit clicked, the request
  body's `parameters` includes `withAcDetails: true`, `withEvDetails: true`,
  and the other three `withXDetails` flags `false`.
- With no checkboxes selected, all five flags are sent as `false` (not
  omitted) — the backend always receives a definite value per flag.
- Toggling checkboxes without clicking Submit does not change any
  in-flight or already-sent request (unaffected, per
  `submit-button-replaces-auto-search-16-09-2026-04_54_PM.md`/`no-data-until-submit-16-09-2026-05_01_PM.md`
  — only Submit reads the current checkbox state).
- (Once the backend adds support) a Submit with any checkbox checked
  succeeds rather than `422`ing.

## Open decisions

- When/whether the backend will add support for these five parameter
  names (or some other agreed shape) — this frontend change is complete
  and correct per the agreed "UI first" approach, but functionally
  inert against the current backend until that lands. Until then, checking
  any "Include Details" box and clicking Submit will 422 against the real
  backend (the mock-data fallback in `DealerLedgerService.getEntries()`
  still keeps the UI usable in the meantime).
- Whether the config API's `parameters` metadata should eventually be
  extended (by the backend) to declare all five checkboxes explicitly,
  replacing the single `withCblDetails` entry, so the two stay in sync —
  tracked as a backend-side follow-up, not something this frontend spec can
  resolve unilaterally.
