# Dealer Ledger — Spec 27: Backend Now Supports the Five Checkboxes — Wire Up Their Ref-No Columns

**Created:** 2026-09-16 17:24 IST

## Status

Accepted (implemented in the same change as this spec).

## Purpose

The gap flagged in `checkbox-filters-in-request-parameters-16-09-2026-05_08_PM.md` is
closed: the backend has been updated (`configVersion` is now `2026.09.3`,
up from `2026.09.2`) to accept all five "Include Details" parameters
(`withOeDetails`/`withSpDetails`/`withAcDetails`/`withEvDetails`/
`withAcwshDetails`), confirmed via direct API testing —
`200 OK`, no `UNKNOWN_PARAMETER` errors. Each flag, when `true`, now also
adds its own reference-number column to `effectiveColumns`
(`oeRefNo`/`spRefNo`/`acRefNo`/`evRefNo`/`acwshRefNo` — plus the
pre-existing `cblRefNo` for `withCblDetails`, which the UI still has no
checkbox for). This spec wires the app up to consume this properly: the
new columns render correctly, and the `dealerCode` parameter placement is
aligned with the backend's now-official declared contract.

## New backend contract (observed)

- Config `parameters` now declares `withOeDetails`, `withSpDetails`,
  `withAcDetails`, `withEvDetails`, `withAcwshDetails` (alongside the
  pre-existing `withCblDetails`) as real `CHECKBOX`/`BOOLEAN` parameters.
- Config `columnGroups` now has five new conditional groups — `oe`, `sp`,
  `ac`, `ev`, `acwsh` — each `visibleWhen` its corresponding flag is `true`,
  each contributing exactly one column: `oeRefNo`, `spRefNo`, `acRefNo`,
  `evRefNo`, `acwshRefNo` respectively (mirroring the existing `cbl`
  group's `cblRefNo`).
- The data API's `effectiveColumns` response reflects this: submitting with
  `withSpDetails: true, withAcDetails: true` returns
  `effectiveColumns` including `"spRefNo"` and `"acRefNo"` appended to the
  base column set — confirmed via direct testing.
- `dealerCode` is now also declared as a real `parameters` entry in the
  config response (`control: "TEXT"`), alongside `companyCode`/
  `postingDate`/the checkboxes — previously it had no declared parameter
  entry at all. Direct testing confirms the data API now accepts
  `dealerCode` both at the request's top level (this app's current
  approach, per `data-api-request-contract-16-09-2026-02_48_PM`) and inside `parameters` — both return `200`.
  Per this spec, `dealerCode` moves into `parameters` to match the
  backend's own declared parameter list, rather than being ordinary-but-
  outside-of-schema at the top level.
- `paging`/`sort` in the request body are not required — a request omitting
  them entirely still succeeds. This app continues to send them (per
  `data-api-request-contract-16-09-2026-02_48_PM`) since the field is harmless and no regression was observed;
  not a required change here.

## Scope

- `DealerLedgerApiRequest`: move `dealerCode` from the top level into
  `parameters`.
- `DealerLedgerApiResponseRow`/`DealerLedgerRow`: add the five new optional
  reference-number fields (plus `cblRefNo`, already implied by the existing
  `cbl` group but never wired up either).
- `DEALER_LEDGER_COLUMN_DEFINITIONS` (`dealer-ledger-column-definitions.ts`):
  add entries for `oeRefNo`/`spRefNo`/`acRefNo`/`evRefNo`/`acwshRefNo`/
  `cblRefNo` so they render correctly whenever `effectiveColumns` includes
  them (per `effective-columns-drive-table-headers-16-09-2026-03_59_PM.md`'s existing
  lookup-and-skip-unknown mechanism — these were previously "unknown" and
  silently skipped with a console warning; this spec adds their
  definitions instead).
- `DealerLedgerService.toDealerLedgerRow()`: map the new backend row fields
  onto the new `DealerLedgerRow` fields.
- Out of scope: any change to the checkbox UI itself (already sends the
  correct five flags, unchanged) or to `withCblDetails` (the UI still has
  no corresponding checkbox for it — out of scope, as it was for data-api-request-contract-16-09-2026-02_48_PM).

## Requirements

1. `DealerLedgerApiRequest.dealerCode` moves from the request's top level
   into `DealerLedgerApiRequestParameters.dealerCode` (optional string,
   matching the config's own declared parameter).
2. `DealerLedgerApiResponseRow` gains five new optional string fields:
   `oeRefNo`, `spRefNo`, `acRefNo`, `evRefNo`, `acwshRefNo` (plus
   `cblRefNo`, not previously present at all).
3. `DealerLedgerRow` gains the same six optional fields.
4. `DealerLedgerService.toDealerLedgerRow()` maps each backend field onto
   its corresponding row field (`row.oeRefNo ?? ''`, etc.).
5. `DEALER_LEDGER_COLUMN_DEFINITIONS` gains entries mapping each backend
   key to its row field and a human header ("OE Ref No", "SP Ref No", "AC
   Ref No", "EV Ref No", "ACWSH Ref No", "CBL Ref No" — matching the
   config's own `label` values for each column group).
6. No change to how/when these columns actually appear — that is already
   entirely driven by `effectiveColumns` (per Spec 21), which the backend
   now correctly varies based on which checkboxes were submitted.

## Acceptance criteria

- Submitting with "With SP Details" and "With AC Details" checked shows an
  "SP Ref No" and "AC Ref No" column in the table (populated from the
  response's `spRefNo`/`acRefNo` fields), in addition to the base columns —
  no console warning about an unrecognized column key.
- Submitting with no checkboxes checked shows only the base columns, as
  today.
- The request sent to the backend has `dealerCode` inside `parameters`,
  not at the top level.
- `dealer-ledger.service.spec.ts` and `dealer-ledger-column-definitions`'
  test coverage (if any) are updated for the new field mappings.

## Open decisions

- None — this is a direct, confirmed reconciliation with the real backend
  contract; no ambiguity remains.
