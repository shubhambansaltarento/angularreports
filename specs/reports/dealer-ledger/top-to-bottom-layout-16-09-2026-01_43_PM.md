# Dealer Ledger — Spec 2: Top-to-Bottom Filter Layout

## Status

Proposed.

## Scope

This document specifies a redesign of the Dealer Ledger filter panel
(`src/app/features/dealer-ledger/filters/dealer-ledger-filter`) from its
current layout into a stacked, top-to-bottom row structure.

## Requirements

1. Row 1: Dealer Code (text value, per Spec 1).
2. Row 2: Dealer Description (text value, per Spec 1).
3. Row 3: Company Code (text value).
4. Row 4: Report Range — From and To date fields, on the same row.
5. Row 5: Include Details — all checkboxes (With OE/SP/AC/EV/ACWSH Details)
   grouped together on the same row.
6. Action row: Search, Reset, and Export options appear together on one line
   below the field rows.
7. Export offers exactly 3 options: PDF and XLS as the export formats
   (Search, Reset, Export as PDF, Export as XLS — 3 action options total
   alongside Search/Reset, or Export exposes a choice between PDF and XLS).
8. Rows stack vertically (top to bottom); within a row, fields lay out
   horizontally.

## Current implementation observations

- `DealerLedgerFilterComponent` composes `ReportSearchBarComponent` (Dealer
  Code, Dealer Description, Company Code, Date Range) with its own
  "include details" checkbox group (`CHECKBOX_OPTIONS` in
  `dealer-ledger-filter.component.ts`).
- Current export behavior emits a single `exported` event
  (`onExport()` in `dealer-ledger-filter.component.ts`) with no format choice.
- Layout is currently defined in
  `dealer-ledger-filter.component.html`/`.scss`.

## Acceptance criteria

- The filter panel visually stacks Dealer Code, Dealer Description, Company
  Code, Report Range, and Include Details as five distinct rows, in that
  order, top to bottom.
- Search, Reset, and Export controls appear together on a single line.
- Export supports both PDF and XLS as output formats (3 total action options:
  Search, Reset, and Export, where Export provides a PDF/XLS choice).
- Layout remains responsive/usable at typical desktop widths; no fields are
  clipped or wrap unexpectedly within a row.

## Open decisions

- Whether "3 options" means Search / Reset / Export (with Export offering a
  PDF-or-XLS sub-choice), or Search / Reset / two separate Export buttons
  (Export as PDF, Export as XLS): TBD — current draft assumes the former.
- Visual treatment of the Export PDF/XLS choice (dropdown, split button, or
  two buttons): TBD.
