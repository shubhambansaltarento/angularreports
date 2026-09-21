# Remove the Plain Black-Text Header and Breadcrumb from Every Report Page

## Context

`legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md` added a new shared, blue
`ReportHeaderBarComponent` above the existing plain header on every report page, but
deliberately left the old plain title and the `BreadcrumbComponent` trail ("Reports → Title")
in place beneath it (see that spec's item 1: "the existing centered report title stays,
unchanged"). That leaves each report showing its title twice — once in the new blue bar, once
in the old plain black `<h1>` — plus the breadcrumb trail.

This spec removes that now-redundant plain header and breadcrumb entirely, so the blue
`ReportHeaderBarComponent` is the only title shown.

## Current state (every page still has both)

- `src/app/features/warranty-cost-report/pages/warranty-cost-report-list/warranty-cost-report-list.component.html` — `<header class="warranty-cost-report-list__header"><h1>{{ title }}</h1></header>` + `<app-breadcrumb [currentLabel]="title" />`, both directly below the new `<app-report-header-bar>`.
- `src/app/features/warranty-reconciliation/pages/warranty-reconciliation-list/warranty-reconciliation-list.component.html` — same pattern, `warranty-reconciliation-list__header`.
- `src/app/features/goods-acknowledgement/pages/goods-acknowledgement-list/goods-acknowledgement-list.component.html` — same pattern, `goods-acknowledgement-list__header`.
- `src/app/features/parts-packing-list/pages/parts-packing-list-list/parts-packing-list-list.component.html` — no `<header>` wrapper, but `<h1 class="parts-packing-list-list__title">{{ title }}</h1>` inside `.parts-packing-list-list__card`, plus `<app-breadcrumb [currentLabel]="title" />`.
- `src/app/features/dealer-ledger/components/dealer-ledger-toolbar/dealer-ledger-toolbar.component.html` — `<header class="dealer-ledger-toolbar"><h1 class="dealer-ledger-toolbar__title">{{ title() }}</h1></header>`, used by `dealer-ledger-list.component.html` (no breadcrumb here in the toolbar itself — confirm at `dealer-ledger-list.component.html` for its own `<app-breadcrumb>`).
- `src/app/shared/ui/report-search-only-page/report-search-only-page.component.html` — `<header class="report-search-only-page__header"><h1>{{ title() }}</h1>...</header>` + `<app-breadcrumb [currentLabel]="title()" />` — shared by PQM, VOR Print, and Warranty Labour Tax Invoice.

`reports-home` (the report catalog/landing page) is out of scope — its header is its own
branding banner ("TVS 🐎 Dealer Reports"), not a per-report title, and has no breadcrumb.

## Requirement

For every report page/component listed above:

1. Delete the plain `<header>...<h1>...</h1>...</header>` block (or bare `<h1>` for Parts
   Packing List) entirely — not just hide it with CSS.
2. Delete the `<app-breadcrumb [currentLabel]="..." />` element entirely.
3. Remove the now-unused `BreadcrumbComponent` import from each page's `imports: [...]` array
   and TS import statement.
4. Remove any now-dead SCSS rules that only styled the deleted header/breadcrumb (e.g.
   `.warranty-cost-report-list__header`, `.dealer-ledger-toolbar__title`,
   `.parts-packing-list-list__title`, `.report-search-only-page__header`) — check each
   `.component.scss` file for these selectors before deleting.
5. `report-search-only-page.component.ts`'s `title`/`description` inputs stay (still passed
   into `<app-report-header-bar [title]="title()" />`); only the description `<p>` inside the
   deleted header block goes with it — Open decision below covers where the description text
   should reappear, if anywhere.
6. Dealer Ledger: `DealerLedgerToolbarComponent` becomes just a thin wrapper around
   `<app-report-header-bar>` (or is removed outright and callers use
   `<app-report-header-bar>` directly) — check `dealer-ledger-list.component.html` for its own
   separate `<app-breadcrumb>` usage outside the toolbar and remove that too if present.

## Out of scope

- `reports-home` — no per-report header/breadcrumb to remove.
- The `BreadcrumbComponent` and `ReportSearchBarComponent` shared components themselves are not
  deleted from the codebase, only their usages on report pages (breadcrumb) — do not remove the
  component files unless a repo-wide check confirms zero remaining usages anywhere.
- No change to `ReportHeaderBarComponent` itself, or to the data table restyling from the prior
  spec.

## Open decisions

- `ReportSearchOnlyPageComponent`'s optional `description()` text currently rendered under the
  deleted `<h1>` — either drop it entirely, or relocate it to render just below
  `<app-report-header-bar>` as its own line. Default to relocating (as a plain `<p
  class="text-muted">`) unless product says otherwise, since existing report configs may rely
  on it being shown.
- Whether `BreadcrumbComponent` remains needed anywhere else in the app after this change — if
  a repo-wide grep after implementation shows zero usages, flag it as dead code for a
  follow-up removal (not automatically deleted by this spec).

## Acceptance criteria

- No report page renders a second, plain-black-text title below the blue
  `ReportHeaderBarComponent`.
- No report page renders a "Reports → Title" breadcrumb trail.
- Each report's blue header bar remains the only visible title on the page.
- No unused imports or dead CSS selectors are left behind from the removal.
- Existing filter/table/data-fetch behavior on every report page is unaffected.
