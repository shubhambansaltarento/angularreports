# Dealer Ledger — effectiveColumns Shape Change in the DEALER_LEDGER Data API

**Created:** 2026-09-17 05:41 AM

## Status

Implemented.

## Endpoint

`POST /api/v1/reports/DEALER_LEDGER/data`

## What changed

The `effectiveColumns` field in the response changed from a flat array
of strings to an array of objects with a `columnName` and an
`isDefault` flag.

**Before:**

```json
"effectiveColumns": [
  "dealerCode",
  "docType",
  "docReferenceNo",
  "docDate",
  "assignment",
  "cca",
  "textDec",
  "vehicleNarration",
  "debit",
  "credit"
]
```

**After:**

```json
"effectiveColumns": [
  { "columnName": "dealerCode", "isDefault": true },
  { "columnName": "docType", "isDefault": true },
  { "columnName": "docReferenceNo", "isDefault": true },
  { "columnName": "docDate", "isDefault": true },
  { "columnName": "assignment", "isDefault": true },
  { "columnName": "cca", "isDefault": true },
  { "columnName": "textDec", "isDefault": false },
  { "columnName": "vehicleNarration", "isDefault": false },
  { "columnName": "debit", "isDefault": true },
  { "columnName": "credit", "isDefault": true }
]
```

**What `isDefault` means:** whether the column should be
checked/visible by default in a column picker. Currently only
`textDec` and `vehicleNarration` are `isDefault: false`; every other
currently-visible column (including conditional ones like `cblRefNo`
when `withCblDetails=true`) is `isDefault: true`.

Nothing else changed — same `rows`/`totals`/`paging`/`configVersion`
shape, and `effectiveColumns` still reflects only currently-visible
columns based on the request's `with*Details` flags.

## Current implementation

- `DealerLedgerApiResponse.effectiveColumns` (`dealer-ledger-api-response.model.ts:52`)
  is typed `string[]`.
- `DealerLedgerService.toDealerLedgerResponse()`
  (`dealer-ledger.service.ts`) passes `response.effectiveColumns`
  straight through onto the app's internal
  `DealerLedgerResponse.effectiveColumns` (`dealer-ledger-response.model.ts:20`),
  also typed `string[]`.
- `DealerLedgerStore._effectiveColumns` stores this list as-is and
  exposes it via `store.effectiveColumns()`.
- `DealerLedgerTableComponent.columns` (`dealer-ledger-table.component.ts:48`)
  computes `toDealerLedgerColumns(effectiveColumns)` when non-null,
  else falls back to `DEALER_LEDGER_DEFAULT_COLUMNS`.
- `toDealerLedgerColumns()` (`dealer-ledger-column-definitions.ts:67`)
  iterates the raw string keys, looks each up in
  `DEALER_LEDGER_COLUMN_DEFINITIONS`, and returns the matched
  `TableColumn<DealerLedgerRow>[]` in the same order — skipping
  (with a `console.warn`) any key not in the map.
- The shared `TableColumn<T>` model
  (`shared/ui/data-table/models/table-column.model.ts`) already has a
  `hidden?: boolean` field — "Initial hidden state — the user's
  persisted choice (if any) overrides this on load" — and
  `DataTableComponent` already has a full column-picker
  (`column-settings/data-table-column-settings.component.ts`,
  `onToggleColumnVisibility()`) with per-`tableId` `localStorage`
  persistence (`buildDefaultColumnState()`,
  `reconcileColumnState()`). **No new column-picker UI needs to be
  built** — this is purely about feeding the existing `hidden` field
  correctly from `isDefault`.

## Scope

- `DealerLedgerApiResponse.effectiveColumns` — retype to
  `{ columnName: string; isDefault: boolean }[]`.
- `DealerLedgerResponse.effectiveColumns` (the app's internal shape) —
  retype identically, so the mapping is carried through rather than
  flattened back to strings and losing `isDefault`.
- `DealerLedgerStore` — no logic change, only the type it stores/exposes.
- `toDealerLedgerColumns()` (`dealer-ledger-column-definitions.ts`) —
  read `.columnName` (not the raw string) to look up
  `DEALER_LEDGER_COLUMN_DEFINITIONS`, and set each resulting
  `TableColumn.hidden` to `!isDefault` (columns with `isDefault: false`
  remain in the column list — and thus selectable in the column picker
  — but start hidden until the user opts in via the picker, per the
  existing `hidden`/column-picker mechanism already in
  `DataTableComponent`).
- Any test fixtures (`dealer-ledger.service.spec.ts`,
  `dealer-ledger-table.component.spec.ts`, mock generator) that
  currently build `effectiveColumns` as `string[]`.
- Out of scope: `DataTableComponent`/column-picker UI itself — already
  supports `hidden`, no changes needed there. Out of scope: any change
  to `rows`/`totals`/`paging`/`configVersion` handling — unaffected by
  this contract change.

## Requirements

1. `DealerLedgerApiResponse.effectiveColumns` is
   `{ columnName: string; isDefault: boolean }[]`.
2. `DealerLedgerResponse.effectiveColumns` (internal) is retyped the
   same way, and `DealerLedgerService.toDealerLedgerResponse()`
   continues to pass it through unchanged in shape (no flattening).
3. `toDealerLedgerColumns()` accepts
   `{ columnName: string; isDefault: boolean }[]`, looks up each
   `columnName` in `DEALER_LEDGER_COLUMN_DEFINITIONS` (unrecognized
   `columnName`s still skipped with the existing `console.warn`, per
   current behavior — not a fatal error), and returns
   `TableColumn<DealerLedgerRow>[]` with `hidden: !isDefault` merged
   onto each matched definition.
4. A column with `isDefault: false` (currently `textDec` and
   `vehicleNarration`) is present in the table's column list and its
   column picker, but not visible in the grid until the user checks it
   on — exactly the existing `hidden`/column-picker behavior, driven
   now by the backend's `isDefault` instead of a value hardcoded in
   `DEALER_LEDGER_COLUMN_DEFINITIONS`.
5. `DEALER_LEDGER_DEFAULT_COLUMNS` (the pre-first-response fallback
   column set, used before any real `effectiveColumns` has arrived) is
   unaffected — it has no `isDefault` concept and keeps its current
   hardcoded column list, since the backend hasn't been consulted yet
   at that point.
6. No change to `configVersion`/`rows`/`totals`/`paging` handling.

## Acceptance criteria

- Given a response with `effectiveColumns` containing
  `{ "columnName": "textDec", "isDefault": false }`, the "Text Dec."
  column appears in the column picker but is unchecked/hidden in the
  grid by default; checking it in the picker reveals it, exactly as
  today's `hidden`-column mechanism already behaves for any other
  hidden column.
- Given a response with `{ "columnName": "dealerCode", "isDefault": true }`,
  the "Dealer Code" column is visible in the grid immediately, with no
  picker interaction required.
- An `effectiveColumns` entry whose `columnName` isn't in
  `DEALER_LEDGER_COLUMN_DEFINITIONS` is skipped with a console warning
  (unchanged behavior), not a crash.
- `dealer-ledger.service.spec.ts` gains/updates a test asserting
  `effectiveColumns` objects pass through
  `toDealerLedgerResponse()`/`getEntries()` unchanged in shape (not
  flattened to strings).
- A `dealer-ledger-column-definitions.spec.ts` (or wherever
  `toDealerLedgerColumns()` is tested) test asserts: a mixed
  `isDefault: true`/`false` input produces `TableColumn[]` with
  `hidden` set correctly per entry, in the original order, skipping
  unrecognized `columnName`s.
- `dealer-ledger-table.component.spec.ts`'s existing effective-columns
  tests are updated to the new object shape.

## Open decisions

- None — the shared table's existing `hidden`/column-picker mechanism
  is a direct, already-built fit for `isDefault`; this is a pure
  data-shape/mapping change, no new UI capability required.
