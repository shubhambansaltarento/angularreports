# Warranty Cost Report — Data Mapping Fixes Confirmed Against Real Rows

**Created:** 2026-09-17 08:02 AM

## Status

Implemented. Open decisions resolved exactly as proposed: multiple
validation messages joined with `"; "`; no derived field added to
`WarrantyCostSummary`.

## Purpose

`api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md` implemented
`WarrantyCostService.getEntries()` against `POST reports/WARRANTY_COST/data`,
but every test against that endpoint so far had returned zero rows — several
mapping questions were left explicitly unconfirmed. A follow-up test just
returned **real rows** for the first time, revealing:

1. **A confirmed crash bug** — `claimDate` in real row data is
   `"05-05-2026"` (`DD-MM-YYYY`), the exact same format problem Dealer
   Ledger had with `docDate`
   (`doc-date-dd-mm-yyyy-format-17-09-2026-12_00_AM.md`). Our current
   `WarrantyCostService.toWarrantyCostRow()` passes `claimDate` straight
   through with no normalization — piping it through Angular's
   `DatePipe` (as `WarrantyCostTableComponent`'s `claimDate` cell
   template already does) will throw the same fatal `NG02311`/`NG02100`
   `RuntimeError` Dealer Ledger had.
2. **Real, non-empty `totals`** — previously only tested as `{}`;
   confirmed real shape is `{"laborCost": 3600.00, "partCost": 14451.50,
   "totalCost": 18051.50}` (a sum per numeric column) — this is
   discarded entirely by the current `toWarrantyCostResponse()` mapping
   (`WarrantyCostResponse` has no field for it at all).
3. **`isDefault` genuinely varies now** — `dealerCode`/`dealerName` are
   `isDefault: true`; every other column (`claimNo`, `claimDate`,
   `partNo`, `partDescription`, `laborCost`, `partCost`, `totalCost`)
   is `isDefault: false` — confirming `toWarrantyCostColumns()`'s
   `hidden: !isDefault` mapping has real columns to exercise (previously
   every column was `isDefault: true` in the only response tested).
   `isVisible` is still `true` for every column in this response too —
   its distinct meaning from `isDefault` remains unconfirmed (that Open
   decision from the prior spec is unchanged).
4. **A structured validation-error response** — requesting a date range
   over 366 days returns `422`-style JSON:
   ```json
   {
     "traceId": "55346c99-0b1f-4119-8728-39f6d5dbdf1e",
     "code": "VALIDATION_FAILED",
     "errors": [
       { "field": "claimDate.to", "code": "MAX_RANGE_EXCEEDED", "message": "Date range cannot exceed 366 days", "params": { "maxRangeDays": 366 } }
     ]
   }
   ```
   `WarrantyCostStore`'s current `catchError()` discards this entirely,
   showing only a generic "Unable to load Warranty Cost Report entries"
   message regardless of cause.

## Confirmed real API response (with rows)

Request: `claimDate: { from: "2025-10-01", to: "2026-09-17" }` (352
days, within the 366-day limit), `dealerCode` omitted (works
identically with or without it, per the test).

```json
{
  "reportCode": "WARRANTY_COST",
  "configVersion": "2026.09.1",
  "effectiveColumns": [
    { "columnName": "dealerCode", "isDefault": true, "isVisible": true },
    { "columnName": "dealerName", "isDefault": true, "isVisible": true },
    { "columnName": "claimNo", "isDefault": false, "isVisible": true },
    { "columnName": "claimDate", "isDefault": false, "isVisible": true },
    { "columnName": "partNo", "isDefault": false, "isVisible": true },
    { "columnName": "partDescription", "isDefault": false, "isVisible": true },
    { "columnName": "laborCost", "isDefault": false, "isVisible": true },
    { "columnName": "partCost", "isDefault": false, "isVisible": true },
    { "columnName": "totalCost", "isDefault": false, "isVisible": true }
  ],
  "rows": [
    { "dealerCode": "10015", "dealerName": "PAWAN SARKAR AUTOMOBILES", "claimNo": "WC26050001", "claimDate": "05-05-2026", "partNo": "P-10023", "partDescription": "CLUTCH PLATE ASSY", "laborCost": 450.00, "partCost": 1250.00, "totalCost": 1700.00 }
    // ...7 more rows, all claimDate in DD-MM-YYYY (e.g. "18-05-2026", "22-08-2026")
  ],
  "totals": { "laborCost": 3600.00, "partCost": 14451.50, "totalCost": 18051.50 },
  "paging": { "page": 1, "pageSize": 8, "totalRows": 8, "totalPages": 1 },
  "meta": { "generatedAt": "...", "dataAsOf": "...", "queryMs": 4 }
}
```

Note `paging.pageSize` in the response (`8`) doesn't echo the
requested `pageSize` (`50`) — it reflects the actual row count
returned. Combined with `totalPages: 1` for 8 rows, this is consistent
with Dealer Ledger's own "not truly paginated — one request returns
the full matching result set" behavior
(`api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md`);
no change to the existing client-side-pagination approach is implied
by this.

## Scope

- `WarrantyCostService.toWarrantyCostRow()` — normalize `claimDate`
  from `DD-MM-YYYY` to ISO 8601, mirroring
  `DealerLedgerService.toIsoDate()` exactly (same regex, same
  fallback-to-raw-string-on-mismatch behavior).
- `WarrantyCostApiResponse.totals` / a new `WarrantyCostSummary` model
  — capture the real `{ laborCost, partCost, totalCost }` shape (not
  the placeholder `Record<string, number>` guess from the prior spec)
  and thread it through `WarrantyCostResponse` and `WarrantyCostStore`
  (readonly `summary` signal), mirroring `DealerLedgerStore.summary`.
  No UI consumer is required by this spec (no summary cards requested
  for this report) — this is about correctly capturing/not discarding
  real API data the response already provides, for future use.
- `WarrantyCostStore`'s error handling — when the caught error is an
  `HttpErrorResponse` whose body matches the `VALIDATION_FAILED` shape
  (has an `errors[]` array with `message` fields), surface the
  first/joined validation message(s) instead of the generic fallback
  string.
- Out of scope: enforcing `minDate`/`maxDate`/`maxRangeDays`
  client-side (still deferred per the prior spec's Open decision) —
  this spec only makes the *resulting* backend validation error legible
  to the user when it does occur, not prevent triggering it.

## Requirements

1. A Warranty Cost row's `claimDate` renders correctly through
   `DatePipe` with no `NG02311`/`NG02100` crash, for real `DD-MM-YYYY`
   backend dates.
2. The response's real `totals` (`laborCost`/`partCost`/`totalCost`
   sums) are captured in `WarrantyCostResponse`/`WarrantyCostStore`,
   not discarded.
3. A `VALIDATION_FAILED` error response (e.g. exceeding the 366-day
   claim-date range) surfaces its real validation message(s) to the
   user, rather than the generic "Unable to load..." fallback.
4. No regression to the already-working `effectiveColumns`/`isDefault`
   hidden-column mapping, or to the existing pagination/loading/
   hasSearched behavior.

## Acceptance criteria

- `warranty-cost.service.spec.ts` gains a test asserting a
  `DD-MM-YYYY` `claimDate` (e.g. `"05-05-2026"`) maps to ISO
  (`"2026-05-05"`), using the exact real row payload captured above.
- `warranty-cost.service.spec.ts` gains a test asserting `totals` maps
  onto the new summary shape correctly (`laborCost: 3600, partCost:
  14451.5, totalCost: 18051.5`).
- `warranty-cost.store.spec.ts` (new, mirroring the store-level
  coverage `dealer-ledger.store.spec.ts` has) gains a test: a
  `VALIDATION_FAILED`-shaped HTTP error surfaces its real message
  (e.g. containing "Date range cannot exceed 366 days") in
  `store.error()`, not the generic fallback.
- Manually verified against the live backend: a request within the
  366-day limit for a dealer with real claims renders the table with
  correctly-formatted dates and no console error; a request exceeding
  366 days shows the real validation message.

## Open decisions

- Exact validation-error message format when there are multiple
  `errors[]` entries — default assumption: join every entry's
  `message` with `"; "` (simple, no special-casing for one vs. many).
- Whether `WarrantyCostSummary` needs a `closingBalance`-style derived
  field the way Dealer Ledger's summary does — default assumption: no,
  since there's no established meaning for such a derived value on
  Warranty Cost's three independent cost sums; expose the three sums
  as-is.
