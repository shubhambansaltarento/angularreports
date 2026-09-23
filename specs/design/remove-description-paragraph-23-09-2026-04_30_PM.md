# Design — Spec: Remove the Description Paragraph From PQM/VOR Print/Warranty Labour Tax Invoice

**Created:** 23-09-2026 04:30 PM IST

## Status

Implemented.

## Purpose

PQM, VOR Print, and Warranty Labour Tax Invoice (all served by the shared
`ReportSearchOnlyPageComponent`) rendered each report's config `description` text
("Vehicle Off Road (VOR) print report.", "Product Quality Management report.", "Tax invoices
raised for warranty labour charges.") as a muted paragraph below the dealer identity line. The
user asked to remove this section from all three.

## Requirement

- `report-search-only-page.component.html`: delete the `@if (description()) { <p
  class="report-search-only-page__description text-muted">...</p> }` block entirely.
- `report-search-only-page.component.ts`'s `description` input itself is left in place — it's
  still supplied via each report's route `data` (see `app.routes.ts`) and does no harm unused;
  only its rendering is removed, matching how `title()` sourcing wasn't touched by unrelated
  prior removals.

## Acceptance criteria

- PQM, VOR Print, and Warranty Labour Tax Invoice no longer show any description text below
  the dealer identity line.
- Nothing else on the page (header bar, dealer identity, search bar, Show Report/Reset buttons,
  placeholder table) changes.
