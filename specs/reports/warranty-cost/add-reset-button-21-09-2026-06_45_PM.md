# Warranty Cost Report — Spec: Reset Button Alongside Show Report

**Created:** 21-09-2026 06:45 PM IST

## Status

Implemented.

## Purpose

`reset-after-export-in-all-reports-21-09-2026-06_30_PM.md` added a Reset control to every
report's *table*. Warranty Cost Report has no table (its output is a printed statement/PDF via
`WarrantyCostStatementComponent`/`HtmlPdfViewerComponent`), so that spec didn't reach it — it
had no Reset control anywhere, unlike every other report.

## Requirement

1. `WarrantyCostReportFilterComponent`: new `resetFilters()` method, delegating to the shared
   `ReportSearchBarComponent.reset()` — clears the Date Range back to empty (mirrors the other
   filter components' `resetFilters()`).
2. `WarrantyCostStore`: new `reset()` method — clears `hasSearched`/`error`/`statement` and the
   store's last-submitted filters, without re-fetching (same "clear to pre-search state"
   behavior as the other stores' new `reset()` methods).
3. `warranty-cost-report-list.component`: a new Reset button, placed next to the existing "Show
   Report" button (both now wrapped in a `.warranty-cost-report-list__actions` row). Clicking
   it calls `filter().resetFilters()` and `store.reset()`, and clears the page's own
   `lastFilters` (used to render the statement's date range).

## Acceptance criteria

- Warranty Cost Report shows a Reset button next to Show Report.
- Clicking Reset clears the Date Range field and hides the statement viewer, returning to the
  pre-search state, without triggering a new fetch.
