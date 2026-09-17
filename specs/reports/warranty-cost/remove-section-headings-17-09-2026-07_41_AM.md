# Warranty Cost Report — Remove the "Dealer Details"/"Specify Date Range" Section Headings

**Created:** 2026-09-17 07:41 AM

## Status

Implemented.

## Purpose

Remove both section headings introduced by
`warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md`
— "Dealer Details" and "Specify Date Range" — from the Warranty Cost
Report screen entirely (not hidden via CSS — the text itself no
longer renders). The Dealer Code/Dealer Description fields and the
single-line Date Range control underneath each heading stay exactly
as they are; only the heading labels above them are removed.

## Current implementation

- `WarrantyCostReportFilterComponent`'s template
  (`warranty-cost-report-filter.component.html`) passes
  `identitySectionLabel="Dealer Details"` and
  `dateSectionLabel="Specify Date Range"` to `<app-report-search-bar>`.
- `ReportSearchBarComponent` renders each as an
  `<h2 class="report-search-bar__section-label">` only when its
  corresponding input is non-null
  (`report-search-bar.component.html`) — no other current consumer
  (Dealer Ledger, Goods Acknowledgement, the search-only reports)
  passes either input, so removing them here has no effect elsewhere.

## Scope

- `warranty-cost-report-filter.component.html` — remove the
  `identitySectionLabel`/`dateSectionLabel` attribute bindings.
- Out of scope: `ReportSearchBarComponent`'s `identitySectionLabel`/
  `dateSectionLabel` inputs themselves — kept as-is (still optional,
  default `null`, so no other consumer is affected); not deleted from
  the shared component, since removing the capability entirely would
  be a bigger, unrequested change and the inputs are harmless when
  unused.

## Requirements

1. The Warranty Cost Report screen shows no "Dealer Details" or
   "Specify Date Range" text anywhere.
2. Dealer Code, Dealer Description, and the Date Range control
   (From/To pickers) remain exactly as they are otherwise.

## Acceptance criteria

- Rendering `WarrantyCostReportFilterComponent` shows no
  `.report-search-bar__section-label` elements.
- `warranty-cost-report-filter.component.spec.ts`'s existing assertion
  that these headings render is removed/inverted to assert their
  absence instead.
