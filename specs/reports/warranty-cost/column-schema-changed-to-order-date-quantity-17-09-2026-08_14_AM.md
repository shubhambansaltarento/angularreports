# Warranty Cost Report — Backend Column Schema Changed: Order Date/Quantity Replace Claim Details

**Created:** 2026-09-17 08:14 AM

## Status

Implemented.

## Purpose

The `WARRANTY_COST` report's real backend column schema has changed
since `api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md`/
`data-mapping-fixes-from-real-rows-17-09-2026-08_02_AM.md` were written
— re-tested directly against the live backend just now (confirmed via
both `/config` and `/data`), and the columns are now entirely
different from what's currently mapped in code:

- **Previously mapped** (now stale): `claimNo`, `claimDate`, `partNo`,
  `partDescription`, `laborCost`, `partCost`, `totalCost`.
- **Currently real**: `dealerCode`, `dealerName`, `orderDate`,
  `quantity`.

This is a genuine backend contract change, not a frontend bug — the
`/config` response's `columnGroups[0].columns` now only lists these
four fields, and `/data` only returns these four per row.

## Confirmed real API responses (re-tested just now)

### `GET /config` — `columnGroups`

```json
[
  { "field": "dealerCode", "label": "Dealer Code", "dataType": "string", "align": "left", "sortable": true, "defaultVisible": true, "visible": true },
  { "field": "dealerName", "label": "Dealer Name", "dataType": "string", "align": "left", "sortable": false, "defaultVisible": true, "visible": true },
  { "field": "orderDate", "label": "Order Date", "dataType": "date", "format": "dd-MM-yyyy", "align": "left", "sortable": true, "defaultVisible": true, "visible": true },
  { "field": "quantity", "label": "Quantity", "dataType": "integer", "align": "right", "sortable": false, "defaultVisible": true, "visible": true }
]
```

`parameters` (Dealer Code/Company Code/Claim Date) are unchanged — only
the result columns changed, not the search parameters.

### `POST /data` (request: `claimDate.from/to` = `2025-10-01`..`2026-09-17`)

```json
{
  "effectiveColumns": [
    { "columnName": "dealerCode", "isDefault": true, "isVisible": true },
    { "columnName": "dealerName", "isDefault": true, "isVisible": true },
    { "columnName": "orderDate", "isDefault": true, "isVisible": true },
    { "columnName": "quantity", "isDefault": true, "isVisible": true }
  ],
  "rows": [
    { "dealerCode": "10015", "dealerName": "PAWAN SARKAR AUTOMOBILES", "orderDate": "28-04-2026", "quantity": 2 }
    // ...19 more rows, all with only these 4 fields, orderDate in DD-MM-YYYY
  ],
  "totals": { "totalCost": 37772.00, "partCost": 30322.00, "laborCost": 7450.00 },
  "paging": { "page": 1, "pageSize": 20, "totalRows": 20, "totalPages": 1 }
}
```

Note: `totals` still reports `totalCost`/`partCost`/`laborCost` sums
even though none of those fields appear on any row anymore — these
appear to be backend-side aggregates computed from data not exposed
per-row. No change needed to the already-implemented
`WarrantyCostSummary` mapping (`data-mapping-fixes-from-real-rows-17-09-2026-08_02_AM.md`)
— it already maps exactly this `{ laborCost, partCost, totalCost }`
shape.

## Scope

- `WarrantyCostApiResponseRow`/`WarrantyCostRow` — replace `claimNo`/
  `claimDate`/`partNo`/`partDescription`/`laborCost`/`partCost`/
  `totalCost` with `orderDate`/`quantity` (keeping `dealerCode`/
  `dealerName`, unchanged).
- `WARRANTY_COST_COLUMN_DEFINITIONS`/`WARRANTY_COST_DEFAULT_COLUMNS`
  (`warranty-cost-column-definitions.ts`) — updated to the four real
  fields, with "Order Date"/"Quantity" labels matching the config's
  own `label`s, `quantity` right-aligned (matching the config's
  `align: "right"`).
- `WarrantyCostService.toWarrantyCostRow()` — map `orderDate`/
  `quantity` instead of the old fields; `orderDate` needs the same
  `DD-MM-YYYY`→ISO normalization already built (`toIsoDate()`) — the
  real values (`"28-04-2026"`, etc.) are in the same format
  `claimDate` was.
- `WarrantyCostTableComponent`'s cell templates — replace the
  `claimDate`/`laborCost`/`partCost`/`totalCost` cell templates with an
  `orderDate` date-formatting template; `quantity` needs no special
  cell template (plain integer, default rendering is fine).
- Every test fixture across `warranty-cost.service.spec.ts`,
  `warranty-cost-column-definitions.spec.ts`,
  `warranty-cost-table.component.spec.ts` that references the old
  field names — updated to the real ones.
- Out of scope: `WarrantyCostConfig`/`WarrantyCostConfigColumn` model
  shapes themselves — already generic enough (field/label/dataType/
  format/align/etc.) to describe any column set, no change needed
  there. Out of scope: `WarrantyCostSummary`/totals mapping — already
  correct for this response.

## Requirements

1. `WarrantyCostRow` has `orderDate: string` (ISO 8601) and
   `quantity: number` instead of the removed claim/part/cost fields.
2. The table renders "Dealer Code", "Dealer Name", "Order Date"
   (date-formatted), "Quantity" (right-aligned, no special
   formatting) — matching the real `/config`'s column labels exactly.
3. `orderDate` renders through `DatePipe` with no `NG02311` crash (same
   `DD-MM-YYYY`→ISO fix already proven for `docDate`/`claimDate`).
4. No regression to the already-correct `effectiveColumns`/`isDefault`/
   `isVisible` mapping logic, or to the summary/validation-error
   handling from the prior spec.

## Acceptance criteria

- `warranty-cost.service.spec.ts`'s fixtures use the real observed
  response shape (`orderDate`/`quantity` fields, `orderDate` in
  `DD-MM-YYYY`) and assert correct ISO normalization.
- `warranty-cost-column-definitions.spec.ts` asserts the four real
  columns map correctly, with `quantity` `align: 'end'`.
- `warranty-cost-table.component.spec.ts` asserts rows render with
  "Order Date"/"Quantity" headers and a formatted date cell.
- Manually verified end-to-end against the live backend: submitting a
  valid Claim Date range for dealer `10015` renders a real table with
  correctly-formatted Order Date values and Quantity numbers, no
  console error.

## Open decisions

- None — this is a direct field-for-field replacement of the
  previously (incorrectly) assumed schema with the now-confirmed real
  one; no ambiguity requiring a judgment call.
