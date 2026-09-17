# Dealer Ledger — Spec 21: `effectiveColumns` Drives the Table's Column Structure

**Created:** 2026-09-16 15:59 IST

## Status

Proposed.

## Purpose

The real `/data` API response (per `data-api-response-mapping-16-09-2026-03_00_PM.md`)
includes an `effectiveColumns` field — the ordered list of column keys the
backend says are actually applicable for this request (e.g. it can include
`postingDate`/`runningBalance`, or exclude `cblRefNo`-style conditional
columns depending on `withCblDetails`). Today the table's column set is
entirely hardcoded (`DEALER_LEDGER_TABLE_COLUMNS` in
`dealer-ledger-table.component.ts`) and ignores `effectiveColumns` — this
spec makes the table's headers/column order come from that field instead.

## Observed `effectiveColumns` value

```json
["dealerCode", "docType", "docReferenceNo", "docDate", "postingDate", "assignment", "cca", "textDec", "vehicleNarration", "debit", "credit", "dealerName", "dealerAddress", "currency", "text", "qnt", "amt", "runningBalance"]
```

Note these are the *backend's* raw field names — they don't all match the
internal `DealerLedgerRow` model's keys 1:1 (e.g. backend `debit` /
`credit` / `vehicleNarration` vs. row model `debitAmount` / `creditAmount`
/ `narrationVehDescription`, per the mapping already established in
`data-api-response-mapping-16-09-2026-03_00_PM.md`).

## Scope

- Deriving the table's `columns` (`TableColumn<DealerLedgerRow>[]`) from
  `effectiveColumns` instead of the hardcoded constant, whenever a response
  has supplied it.
- A field-name + header-label lookup table mapping each known backend
  column key (`dealerCode`, `docType`, ... `runningBalance`) onto its
  `DealerLedgerRow` key and display header — reusing the header text
  already defined in today's hardcoded `DEALER_LEDGER_TABLE_COLUMNS`, plus
  new entries for `postingDate`/`runningBalance` (not currently in that
  list).
- A sensible fallback when no response has arrived yet (initial render,
  before the first successful data call) — the table still needs
  *something* to render as columns.
- Out of scope: consuming the config API's `columnGroups`
  (`map-config-response-to-ui-16-09-2026-02_41_PM.md` left this unconsumed) — this spec
  is specifically about `effectiveColumns` from the *data* response, not
  the config response's column metadata; reconciling the two is a separate
  future spec if/when they need to agree. Also out of scope: any backend
  column key not seen in the observed sample (e.g. a future `cblRefNo`) —
  handled generically (see Requirements) rather than requiring this spec to
  enumerate every possible key in advance.

## Requirements

1. A `DEALER_LEDGER_COLUMN_DEFINITIONS` lookup (backend field name →
   `{ key: keyof DealerLedgerRow, header: string, align?, sortable? }`) is
   defined, covering every field currently known (the 18 in the observed
   `effectiveColumns` sample plus today's hardcoded set).
2. `DealerLedgerResponse` (or a new field alongside it) carries the raw
   `effectiveColumns: string[]` through from `DealerLedgerApiResponse`, so
   it survives `DealerLedgerService.getEntries()`'s response mapping
   (per Spec 20) rather than being dropped.
3. `DealerLedgerStore` exposes the last-received `effectiveColumns` as a
   signal (e.g. `effectiveColumns()`), updated in `applyResponse()`.
4. `DealerLedgerTableComponent` accepts `effectiveColumns` as an input and
   computes its `columns` by mapping each entry through the lookup table
   (Requirement 1), preserving `effectiveColumns`' own order — instead of
   using the hardcoded constant directly.
5. Any backend column key not present in the lookup table is skipped
   (not rendered as a raw/unlabeled column) rather than crashing — logged
   as a console warning so an unrecognized new key is visible during
   development, per this feature's existing console-logging conventions.
6. Before the first response arrives (`effectiveColumns` signal is empty/
   `null`), the table falls back to today's hardcoded
   `DEALER_LEDGER_TABLE_COLUMNS` so the table isn't columnless on initial
   render/loading skeleton.
7. `DealerLedgerListComponent` passes `store.effectiveColumns()` down to
   `DealerLedgerTableComponent`.

## Acceptance criteria

- After a successful real data fetch, the table's visible columns and
  their left-to-right order match `effectiveColumns` from that response
  exactly (mapped to proper headers) — including `Posting Date` and
  `Balance` (for `postingDate`/`runningBalance`), which don't appear in
  today's hardcoded column set.
- Before any response has arrived, the table shows the existing hardcoded
  column set (no blank/columnless table).
- Column sorting/alignment/cell formatting (currency/date pipes on
  Debit/Credit/Amt/Posting Date) continue to work for whichever columns are
  present.
- An unrecognized backend column key does not break the table — it is
  omitted and a console warning names the unmapped key.
- Existing `dealer-ledger-table.component.spec.ts`/store specs are updated
  for the new `effectiveColumns` input/signal.

## Open decisions

- Whether column *visibility/reordering* customization
  (`DataTableComponent`'s existing per-tableId `localStorage` column-state
  persistence) should reset when `effectiveColumns` itself changes between
  requests (e.g. toggling "With CBL Details" adds/removes a column) — TBD;
  default assumption is to let `DataTableComponent`'s existing
  `reconcileColumnState()` logic handle it as-is (new columns appended,
  stale ones dropped), since that reconciliation already exists for exactly
  this kind of column-set change.
- Whether hidden/optional columns (e.g. `cblRefNo`, part of the config
  response's conditional `cbl` column group but not present in the sample
  `effectiveColumns` since `withCblDetails` was `false`) need entries in the
  lookup table now or only once actually observed in a response — default
  assumption is to add lookup entries only for columns actually seen in a
  real response, extending the table as new ones are observed, rather than
  speculatively covering the full config `columnGroups` set now.
