# All Reports — Breadcrumbs Below a Dealer-Ledger-Style Header

**Created:** 2026-09-17 07:17 AM

## Status

Implemented. Supersedes `specs/features/breadcrumbs-2026-09-10.md`
(never implemented) — same two-level "Reports → current report" trail
and shared component, but the breadcrumb's position relative to the
header changes (below, not above — see Root difference below), and
this spec additionally restyles every report's header to match Dealer
Ledger's. SSR output confirmed to include the breadcrumb (verified in
the prerendered `goods-acknowledgement`/`warranty-cost-report` build
output).

## Purpose

1. Add a shared, reusable breadcrumb ("Reports" → current report
   title) to every report page — Dealer Ledger, Goods Acknowledgement,
   and all six search-parameters-only reports (Warranty Reconciliation,
   Warranty Labour Tax Invoice, Warranty Cost Report, Parts Packing
   List, VOR Print, PQM).
2. Restyle every report's own header (currently a plain, large,
   left-aligned `<h1>`) to match Dealer Ledger's existing look —
   centered, smaller font (`DealerLedgerToolbarComponent`'s
   `1.375rem`, per `header-center-align-single-row-identity-fields-17-09-2026-06_05_AM.md`).
3. Place the breadcrumb directly below that header, left-aligned.

## Root difference from `breadcrumbs-2026-09-10.md`

That earlier (unimplemented) spec required the breadcrumb *above* the
page's title (Requirement 2: "above the page's own title/header").
This request explicitly wants it *below* the (now centered) header,
left-aligned — a deliberate layout choice, not an oversight. Everything
else about that spec's breadcrumb design (two-level trail, shared
component under `shared/ui/`, `routerLink` to `/`, non-linked trailing
crumb, SSR-safe, Bootstrap `.breadcrumb` classes, no data-fetching)
still applies and is carried forward here rather than re-litigated.

## Current implementation

- No `BreadcrumbComponent` exists yet (confirmed: no file/reference
  anywhere in `src/app`).
- `DealerLedgerToolbarComponent` (`dealer-ledger-toolbar.component.html/.scss`)
  is the target style to match:
  ```html
  <header class="dealer-ledger-toolbar">
    <h1 class="dealer-ledger-toolbar__title">{{ title() }}</h1>
  </header>
  ```
  ```scss
  .dealer-ledger-toolbar { display: flex; justify-content: center; }
  .dealer-ledger-toolbar__title { margin: 0; font-size: 1.375rem; text-align: center; }
  ```
- `ReportSearchOnlyPageComponent` (shared by all six search-only
  reports) currently renders a plain `<h1>{{ title() }}</h1>` with no
  centering/size override (`report-search-only-page.component.html:2-3`,
  no matching rule in its `.scss`).
- `GoodsAcknowledgementListComponent` renders a hardcoded
  `<h1>Goods Acknowledgement</h1>` (`goods-acknowledgement-list.component.html:2-3`),
  also with no centering/size override.
- `DealerLedgerListComponent` already composes
  `<app-dealer-ledger-toolbar>` (which already matches the target
  header style) — only the breadcrumb needs adding here, no header
  restyle needed for Dealer Ledger itself.
- Every report route is defined in `app.routes.ts`; the six search-only
  reports already pass `title`/`description` via route `data`
  (`ReportConfig.title`), which `ReportSearchOnlyPageComponent` already
  consumes as its `title()` input — the same value can drive the
  breadcrumb's trailing label with no new data source.

## Scope

- New shared `BreadcrumbComponent` under `src/app/shared/ui/breadcrumb/`
  — presentational, OnPush, one input (`currentLabel: input.required<string>()`),
  always rendering the fixed two-level trail "Reports" (a `routerLink="/"`
  link) → `currentLabel()` (the trailing, non-linked, `aria-current="page"`
  crumb). Deliberately not a generic arbitrary-depth breadcrumb, since
  every consumer needs exactly this same two-level shape (per the
  original spec's Requirement 3) — no report currently needs more.
- `ReportSearchOnlyPageComponent` — restyle its header to the Dealer
  Ledger look (centered, `1.375rem`), and render
  `<app-breadcrumb [currentLabel]="title()" />` immediately below it,
  above the search bar.
- `GoodsAcknowledgementListComponent` — same header restyle, plus
  `<app-breadcrumb currentLabel="Goods Acknowledgement" />` below it.
- `DealerLedgerListComponent` — add
  `<app-breadcrumb currentLabel="Dealer Ledger" />` immediately below
  `<app-dealer-ledger-toolbar>` (whose header already matches the
  target style) — no header restyle needed here.
- Out of scope: the Reports home page itself (root of the trail, no
  breadcrumb needed there, per the original spec's exclusion).
- Out of scope: any drill-down/detail sub-pages (e.g.
  `dealer-ledger-detail`) — two-level trail on top-level report pages
  only, per the original spec.

## Requirements

1. Every report page (Dealer Ledger, Goods Acknowledgement, and the
   six search-only reports) shows a header matching Dealer Ledger's
   existing style: centered, `1.375rem` font size.
2. Directly below that header, every report page shows a breadcrumb:
   "Reports" (a working link back to `/`) → the current report's
   title (not a link, marked `aria-current="page"`), left-aligned.
3. The breadcrumb's trailing label matches each page's own header
   title exactly — no separate/divergent hardcoded string.
4. The breadcrumb renders correctly in SSR output (no client-only
   flash-in), consistent with the rest of this SSR + Express app.
5. No change to routing/URLs, and no data-fetching inside the
   breadcrumb component itself.

## Acceptance criteria

- Every one of the eight report routes shows a centered, `1.375rem`
  header, with a left-aligned "Reports → {report title}" breadcrumb
  directly beneath it.
- Clicking "Reports" in the breadcrumb navigates to `/` via the Angular
  router (no full page reload).
- The trailing crumb is not a link and carries `aria-current="page"`.
- `breadcrumb.component.spec.ts` (new) covers: renders both crumbs,
  "Reports" links to `/`, trailing crumb is plain text with
  `aria-current="page"`.
- `report-search-only-page.component.spec.ts`,
  `goods-acknowledgement-list.component.spec.ts`, and
  `dealer-ledger-list.component.spec.ts` are updated to assert the
  breadcrumb is present with the correct trailing label, and existing
  DOM-structure-dependent assertions (if any) still pass.
- SSR build (`ng build`, this project's existing `outputMode: server`
  config) renders the breadcrumb in the initial HTML.

## Open decisions

- None — the original spec's remaining open decisions (detail-page
  breadcrumbs, Reports-home breadcrumb, label truncation) are still
  genuinely open but out of scope for this pass, same as before.
