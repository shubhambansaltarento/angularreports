# Reports Specification

## Status

Initial specification derived from the existing report catalog, route configuration, and shared report search models.

## Scope

This document captures the current reporting model and the existing report catalog structure used by the application.

## Requirements

1. The application presents a set of platform reports through a central catalog.
2. Each report should have a stable route and descriptive metadata.
3. Some reports have confirmed table implementations; others are present as feature shells with search-only pages until data sources are confirmed.
4. Shared report search fields must be consistent across the platform.
5. Existing report metadata must remain consistent with implementation.

## Current implementation observations

- `src/app/features/reports-home/reports.registry.ts` defines the report catalog.
- `src/app/shared/models/report-config.model.ts` defines a common report configuration shape.
- Report routes are defined in `src/app/app.routes.ts`.
- Dealer Ledger has a confirmed full feature flow with list and detail pages.
- Goods Acknowledgement is a feature route with a table implementation.
- Several reports are intentionally defined as search-only routes pending confirmed source data.

## Acceptance criteria

- Each report has a route, title, and description represented in the config model.
- Shared search fields remain consistent across reports.
- Reports without confirmed data sources do not expose a fabricated table implementation.
- The report catalog stays aligned with features present in the app.

## Open decisions

- Whether additional reports will be promoted from search-only to table-backed flow: TBD
- Source API contract for any report not yet connected to real data: TBD
