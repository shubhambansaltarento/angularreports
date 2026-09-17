# Dealer Ledger — Spec 10: Dealer Code / Description / Company Code — Label and Value on One Line

**Created:** 2026-09-16 14:09 IST

## Status

Proposed. Refines `dealer-fields-as-text-16-09-2026-01_40_PM.md` and
`single-line-identity-fields-16-09-2026-01_59_PM.md`.

## Scope

This document specifies how each read-only identity field (Dealer Code,
Dealer Description, Company Code) renders internally: label and value
together on one line (e.g. "Dealer Code DLR-001"), instead of the label
stacked above the value.

## Current implementation observations

- `ReportSearchBarComponent`'s `.report-search-bar__field` container uses
  `display: flex; flex-direction: column;` for every field, editable or
  read-only — so even though `readonlyDealerFields()` already renders Dealer
  Code, Dealer Description, and Company Code as plain text
  (`form-control-plaintext`) rather than `<input>`s, the label still sits on
  its own line above the value line, visually two lines per field.
- Example values from the request: Dealer Code `DLR-001`, Dealer Description
  `Northgate Motors — Authorized Dealer`, Company Code `CO-10`.
- `single-line-identity-fields-16-09-2026-01_59_PM.md` already covers these three fields
  sharing one row together; this spec is about each individual field's
  internal label/value arrangement, not their row placement.

## Requirements

1. When `readonlyDealerFields()` is true, each of Dealer Code, Dealer
   Description, and Company Code renders its label and value on the same
   line (e.g. `Dealer Code DLR-001`), not stacked.
2. Editable fields (Date From/Date To, and Company Code/Dealer fields in any
   report that does not set `readonlyDealerFields`) keep their current
   label-above-input layout — this change is scoped to the read-only
   presentation only.
3. Long values (e.g. "Northgate Motors — Authorized Dealer") do not overflow
   or wrap awkwardly — the field takes the width it needs within its column
   per `single-line-identity-fields-16-09-2026-01_59_PM.md`'s row layout.

## Acceptance criteria

- Dealer Code, Dealer Description, and Company Code each show as a single
  visual line (label immediately followed by value) in the Dealer Ledger
  filter panel.
- No visual change to editable fields (Date From/Date To).
- `report-search-bar.component.spec.ts` continues to assert the same
  label/value text content, updated only if the DOM structure assertions
  need adjusting for the new inline markup.

## Open decisions

- Exact visual separator/spacing between label and value (a colon, extra
  margin, or just a gap) — TBD, default to a simple gap with the label
  styled slightly muted/bold to distinguish it from the value.
