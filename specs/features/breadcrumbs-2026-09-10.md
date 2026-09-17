# Breadcrumbs Specification (2026-09-10)

## Status

Superseded by `breadcrumbs-and-dealer-ledger-style-headers-17-09-2026-07_17_AM.md` — never implemented. That spec carries forward this document's breadcrumb design (two-level trail, shared component, SSR-safe, Bootstrap classes) but changes the breadcrumb's position to *below* the (now Dealer-Ledger-styled) header instead of above it, and additionally restyles every report's header. Kept here for historical context only — do not implement from this document.

## Purpose

None of the report pages currently show the user where they are in the application relative to the Reports home page (`src/app/features/reports-home/`). Every report is reachable only via its own route, with no in-page trail back to the catalog. This specification defines a shared breadcrumb that appears on every report page — both the reports that have a confirmed table (e.g. Dealer Ledger, Goods Acknowledgement) and the reports that are currently search-parameters-only (rendered via `ReportSearchOnlyPageComponent`, per `src/app/app.routes.ts`'s `SEARCH_ONLY_REPORT_CONFIGS`) — so users always have a consistent, one-click way back to the report catalog and a clear sense of current location.

## Scope

This document covers:
- A shared, reusable breadcrumb component under `src/app/shared/ui/`.
- The breadcrumb trail structure and content for every report route.
- Where the breadcrumb is rendered relative to each report page's own header/title.
- How the breadcrumb sources its labels (route data vs. hardcoded per-page markup).
- Test/acceptance expectations.

This document does not cover:
- Breadcrumbs for the Reports home page itself (it is the root of the trail, and does not need to show a breadcrumb pointing to itself).
- Breadcrumbs inside detail/drill-down sub-pages within a report (e.g. `dealer-ledger-detail`) — that is an extension left as an open decision below.
- Any change to route paths/URLs — this is a presentational, navigational-aid feature only.

## Functional requirements

1. A new shared, standalone `BreadcrumbComponent` (or equivalently named component) must exist under `src/app/shared/ui/breadcrumb/`, following the same conventions as other shared UI (`report-search-bar`, `data-table`): presentational, domain-agnostic, OnPush change detection, inputs only.
2. Every report page must render the breadcrumb component at the top of its content, above the page's own title/header — this includes:
   - Dealer Ledger (`dealer-ledger-list.component`, and its child detail page if in scope later)
   - Goods Acknowledgement (`goods-acknowledgement-list.component`)
   - Every search-only report rendered via `ReportSearchOnlyPageComponent` (Warranty Reconciliation, Warranty Labour Tax Invoice, Warranty Cost Report, Parts Packing List, VOR Print, PQM)
3. The breadcrumb trail for every report page must be exactly two levels: `Reports` (a link back to `/`, the Reports home route) and the current report's title (the trailing/active crumb, not a link).
4. The `Reports` crumb must navigate to the application's home/catalog route (`/`) using Angular's `routerLink`, not a full page reload.
5. The trailing crumb's label must be the same human-readable report title already used elsewhere for that report (e.g. `ReportConfig.title` for search-only reports, or the report's own page title for Dealer Ledger/Goods Acknowledgement) — the breadcrumb must not introduce a second, divergent source of truth for report titles.
6. Since `ReportSearchOnlyPageComponent` is shared across six report routes and already receives `title`/`description` via route `data` (bound through `withComponentInputBinding()`), the breadcrumb inside that shared component must reuse the same `title()` input rather than requiring each search-only report to separately configure a breadcrumb.
7. For Dealer Ledger and Goods Acknowledgement (which have their own page components, not the shared search-only page), the breadcrumb's trailing label must be supplied consistently with how each page already exposes/derives its own title.
8. The breadcrumb must render semantically (a `<nav aria-label="breadcrumb">` wrapping an ordered list of crumbs), for accessibility and to align with the project's existing use of ARIA roles (e.g. `role="status"`, `aria-live` in `dealer-ledger-toolbar`).
9. The breadcrumb must not perform any data fetching, and must not depend on any specific report's store/service — it only renders the trail it is given.

## Non-functional requirements

- The breadcrumb component must work correctly under SSR (per the app's `@angular/ssr` + Express setup, `src/server.ts`) — no direct `window`/`document` access without a platform check, consistent with the existing SSR-safety pattern used in `data-table.component.ts` (`isPlatformBrowser`).
- Styling should use the project's newly-adopted Bootstrap design library (`specs/design/design.md`) — specifically Bootstrap's `.breadcrumb` / `.breadcrumb-item` classes — rather than new bespoke CSS, since breadcrumbs are exactly the kind of common UI element that specification calls out as Bootstrap's responsibility.
- The component must not introduce a new inconsistent visual style relative to the rest of the shared UI (e.g. `report-search-bar`, `data-table`).

## Acceptance criteria

- A shared `BreadcrumbComponent` exists under `src/app/shared/ui/breadcrumb/` and is unit-tested (creation, rendering the expected crumb labels/links, and that the trailing crumb is not a link).
- Every existing report route (Dealer Ledger, Goods Acknowledgement, and all six search-only reports) renders a two-level breadcrumb (`Reports` → report title) above its own page content.
- Clicking the `Reports` crumb navigates back to the Reports home page via the router (verified via a routing-aware test, e.g. `provideRouter([...])` + navigation assertion, consistent with existing router-dependent specs such as `app.spec.ts`).
- No report page duplicates its title as a hardcoded string in two places (page header and breadcrumb) — the breadcrumb consumes the same title source the page already uses.
- Existing tests for all migrated pages continue to pass after the breadcrumb is added (DOM-structure-dependent specs updated as needed, not broken silently).
- The breadcrumb renders correctly in the SSR-rendered HTML (no client-only breadcrumb that appears only after hydration).

## Open decisions

- Whether detail/drill-down pages (e.g. `dealer-ledger-detail`) get a three-level breadcrumb (`Reports > Dealer Ledger > <entry>`) is left open — this spec only requires the two-level trail on top-level report pages.
- Whether the breadcrumb should also appear on the Reports home page itself (as a single, non-linked "Reports" crumb, for visual consistency) is left open; the current requirement is that it is optional there since Reports home is the trail's root.
- Whether crumb labels should be truncated/ellipsized for very long report titles is left open, pending real content review.
