# Design — Spec: PQM/VOR Print/Warranty Labour Tax Invoice Match Other Reports' Look

**Created:** 23-09-2026 03:30 PM IST

## Status

Implemented.

## Purpose

PQM, VOR Print, and Warranty Labour Tax Invoice (all served by the shared
`ReportSearchOnlyPageComponent`) previously showed a "Search"/"Reset" button pair
(`btn-primary`/`btn-outline-secondary`) and a "the table for X is not yet available" message
instead of an actual table — visibly different from every other report's blue-themed Show
Report button and real (or, here, placeholder) `DataTableComponent`.

## Requirement

1. Rename "Search" to "Show Report", styled like every other report's Show Report button:
   `background-color`/`border-color: rgba(47, 92, 138, 0.7411764706)`, white text,
   `font-size: 0.8125rem` (`show-report-button-theme-23-09-2026-03_00_PM.md`). Reset stays
   `btn-sm btn-outline-secondary`, matching Warranty Cost Report's Reset button.
2. Replace the "table for X is not yet available" placeholder paragraph with an actual
   `<app-data-table>`, rendering four generic placeholder columns (`A`, `B`, `C`, `D`) and five
   placeholder rows whose cells just echo their own column letter (`a`/`b`/`c`/`d`) — these
   reports' real schema/data source is still unconfirmed, so this is a stand-in, not fabricated
   real data, but it means the shared table's header/striping/pagination/export chrome is
   visibly present and matches every other report, instead of an absent-table message.
3. Padding moves off the outer `.report-search-only-page` element onto a new
   `.report-search-only-page__content` wrapper (mirroring
   `report-header-bar-full-width-23-09-2026-01_00_PM.md`'s pattern for the other reports), so
   the header bar/dealer identity line span the full page width while the description, search
   bar, actions, and table sit with the same `1rem` padding every other report's content uses.

## Out of scope

- No real data source/store is wired up for these three reports — this spec only makes the
  placeholder table visible and styled, not functional.
- The Dealer Code/Description/Company Code section removal is covered separately by
  `remove-dealer-code-description-company-code-section-23-09-2026-04_00_PM.md`.

## Acceptance criteria

- PQM, VOR Print, and Warranty Labour Tax Invoice each show a "Show Report" button styled
  identically to every other report's, plus a Reset button matching Warranty Cost Report's.
- Each shows a real `DataTableComponent` instance with 4 columns (A/B/C/D) and 5 placeholder
  rows, styled exactly like every other report's table (blue header, striped rows, centered
  pagination).
- The header bar/dealer identity line span the full page width; the rest of the content keeps
  its existing padding.
