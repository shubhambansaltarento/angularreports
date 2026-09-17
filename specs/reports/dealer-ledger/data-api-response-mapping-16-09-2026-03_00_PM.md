# Dealer Ledger — Spec 20: Map the Real Data API Response onto the Table

**Created:** 2026-09-16 15:00 IST

## Status

Accepted (implemented in the same change as this spec).

## Purpose

`POST reports/DEALER_LEDGER/data` now succeeds (per the fix in
`data-api-request-contract-16-09-2026-02_48_PM.md`), but its response shape does not
match the app's internal `DealerLedgerResponse`
(`rows`/`totalCount`/`summary`) — this was flagged as a known follow-up in
that spec and is addressed here: map the real response onto the table and
summary cards.

## Real response shape (observed)

```json
{
  "reportCode": "DEALER_LEDGER",
  "configVersion": "2026.08.1",
  "effectiveColumns": ["dealerCode", "docType", "docReferenceNo", "docDate", "postingDate", "assignment", "cca", "textDec", "vehicleNarration", "debit", "credit", "dealerName", "dealerAddress", "currency", "text", "qnt", "amt", "runningBalance"],
  "rows": [
    { "postingDate": "2026-04-02", "debit": 12500.00, "credit": 0.00, "runningBalance": 12500.00 }
  ],
  "totals": { "debit": 15700.50, "credit": 5000.00 },
  "paging": { "page": 1, "pageSize": 20, "totalRows": 3, "totalPages": 1 },
  "meta": { "generatedAt": "...", "dataAsOf": "...", "queryMs": 5 }
}
```

Each row in the sample only carries the fields that had data
(`postingDate`/`debit`/`credit`/`runningBalance`) — not the full column set
listed in `effectiveColumns`. The mapping must tolerate rows with a subset
of fields, not assume every field is always present.

## Scope

- A `DealerLedgerApiResponse` model matching this shape.
- Mapping from `DealerLedgerApiResponse` onto the app's existing internal
  `DealerLedgerResponse` (`rows: DealerLedgerRow[]`, `totalCount`,
  `summary: DealerLedgerSummary`) inside `DealerLedgerService.getEntries()`
  — the store, table, and summary cards are unchanged; the mapping boundary
  stays entirely inside the service, mirroring how the request mapping was
  isolated in Spec 19.
- A synthetic `id` per row (the API does not return one), stable enough for
  the table's `trackByKey="id"`.
- Out of scope: adding `postingDate`/`runningBalance` as new visible table
  columns (the table's current column set — per
  `dealer-ledger-table.component.ts` — stays as-is for now); reconciling
  `effectiveColumns` with the table's own hardcoded columns (a
  config-driven-columns feature, tracked separately).

## Field mapping

| `DealerLedgerRow` field | Source |
|---|---|
| `id` | Synthesized: `` `${page}-${index}` `` (page from the request, index within the page) — unique enough for `trackBy` given one page of rows at a time. |
| `dealerCode` | `row.dealerCode ?? ''` |
| `dealerName` | `row.dealerName ?? ''` |
| `dealerAddress` | `row.dealerAddress ?? ''` |
| `docType` | `row.docType ?? ''` (kept as `string`, not narrowed to `DealerLedgerDocType`, since the API may not return a value that matches that union — see Open decisions) |
| `docReferenceNo` | `row.docReferenceNo ?? ''` |
| `docDate` | `row.docDate ?? row.postingDate ?? ''` — `postingDate` is what the sample data actually populates; `docDate` is used if present. |
| `assignment` | `row.assignment ?? ''` |
| `cca` | `row.cca ?? ''` |
| `textDec` | `row.textDec ?? ''` |
| `narrationVehDescription` | `row.vehicleNarration ?? ''` — API field is named `vehicleNarration`, not `narrationVehDescription`. |
| `debitAmount` | `row.debit ?? 0` |
| `creditAmount` | `row.credit ?? 0` |
| `currency` | `row.currency ?? ''` |
| `text` | `row.text ?? ''` |
| `qnt` | `row.qnt ?? 0` |
| `amt` | `row.amt ?? row.runningBalance ?? 0` — falls back to `runningBalance` (what the sample data actually returns) if `amt` is absent. |

| `DealerLedgerResponse` field | Source |
|---|---|
| `totalCount` | `response.paging.totalRows` |
| `summary.totalDebit` | `response.totals.debit` |
| `summary.totalCredit` | `response.totals.credit` |
| `summary.closingBalance` | `response.totals.debit - response.totals.credit` |
| `summary.entryCount` | `response.paging.totalRows` |

## Requirements

1. A `DealerLedgerApiResponse` model is added, matching the shape above
   (rows typed as `Partial<...>`-style optional fields, since any field may
   be absent per row).
2. `DealerLedgerService.getEntries()` maps a successful
   `DealerLedgerApiResponse` onto `DealerLedgerResponse` per the Field
   mapping tables above, before returning it to the store — the store's
   `applyResponse()` requires no changes.
3. The mock-fallback path (`DealerLedgerMockService.list()`, used on request
   failure) is unaffected — it already returns `DealerLedgerResponse`
   directly.
4. Console logging (Spec 16/17) continues to log the raw API response as
   received, in addition to (or instead of) the mapped one — enough to
   verify the mapping visually during development.

## Acceptance criteria

- After a successful real data call, the table renders the returned rows
  (Debit/Credit/running-balance values visible, per available fields) and
  correct row count (`totalRows`).
- The summary cards show `totals.debit`/`totals.credit`/the computed closing
  balance/`totalRows` as the entry count.
- A row missing most fields (per the sparse sample data) renders without
  errors — empty string/0 for whatever fields aren't present, not
  `undefined`/`NaN` in the UI.
- The existing mock-fallback path (no live backend) continues to work
  exactly as before.

## Open decisions

- `docType` is loosely typed as `string` in the mapped row rather than
  narrowed to `DealerLedgerDocType`, since the real API is not guaranteed to
  return one of the five known values — TBD whether the `DealerLedgerRow`
  model's `docType` field should be loosened platform-wide once more real
  data is seen, or left as todayapos;s union with a runtime cast.
- Whether `postingDate`/`runningBalance` should be added as their own
  visible table columns (since the real data populates them, while
  `docDate`/`amt` are currently empty for this sample) — TBD, tracked as a
  follow-up once the config-driven column set (Spec 18's `columnGroups`,
  intentionally left unconsumed) is addressed.
