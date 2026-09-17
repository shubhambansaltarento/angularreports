# Warranty Cost Report — Dedicated Page Matching the Real SAP Form, Dealer-Ledger-Style

**Created:** 2026-09-17 07:28 AM

## Status

Implemented. Open decisions resolved as: (a) duplicated the small
header/button SCSS ruleset in the new components rather than
extracting a shared partial; `ReportSearchBarComponent`'s identity
group conditionally omits the Company Code column via `@if
(showCompanyCode())`, same flex container; new
`identitySectionLabel`/`dateSectionLabel` inputs on
`ReportSearchBarComponent` render the "Dealer Details"/"Specify Date
Range" headings at `0.8125rem`/`font-weight: 600` with a bottom
border. `defaultDateRange()` was generalized from Dealer-Ledger-only to
`shared/utils/default-date-range.ts` as a second real consumer needed
the identical default. SSR output confirmed to include "Dealer
Details"/"Specify Date Range"/"Show Report".

## Purpose

The user shared a screenshot of the actual production SAP "Warranty
Cost Details" search form, as the source-of-truth reference for what
this report's real search screen looks like:

- A "Dealer Details" section: Dealer Code, Dealer Description
  (read-only, matching Dealer Ledger's identity-field treatment) —
  **no Company Code field**, unlike Dealer Ledger.
- A "Specify Date Range" section: a single "Date" row with a From
  picker and a "To" picker on the same line.
- A "Submit" button.

Per this request: build Warranty Cost Report's search page to match
this reference, reusing Dealer Ledger's already-established UI
patterns (identity-field group, single-line date range, small grey
Submit-styled button, centered small header, breadcrumb) rather than
inventing a new visual language — but note this report's field set is
narrower than Dealer Ledger's (no Company Code, no checkbox group).

## Current implementation

- Warranty Cost Report currently has no dedicated page — it's one of
  the six reports routed to the shared, generic
  `ReportSearchOnlyPageComponent` via `SEARCH_ONLY_REPORT_CONFIGS` in
  `app.routes.ts`, which unconditionally renders all four common
  fields (Dealer Code, Dealer Description, **Company Code**, Date
  Range) plus Search/Reset buttons — not sectioned into "Dealer
  Details"/"Specify Date Range" groups, and it shows Company Code,
  which the real form does not have.
- `WARRANTY_COST_REPORT_CONFIG` (`warranty-cost-report.config.ts`) has
  `hasTable: false` — "table columns are pending confirmed source
  data." This request is about the search form only; nothing here
  implies the data/table source has become confirmed, so `hasTable`
  stays `false` and no table/mock data is introduced, consistent with
  this project's standing rule (see `goods-acknowledgement.config.ts`'s
  identical comment) never to fabricate data ahead of a confirmed
  source.
- `ReportSearchBarComponent` (`shared/ui/report-search-bar/`) always
  renders Company Code — there is no way today to omit it for a report
  that doesn't have that field, per the real screenshot.
- Dealer Ledger's already-built patterns to reuse:
  - `DealerLedgerToolbarComponent`-style header (centered, `1.375rem`)
    — per `header-center-align-single-row-identity-fields-17-09-2026-06_05_AM.md`.
  - The single-row, 3-column identity-field group
    (`.report-search-bar__identity-group`) — reused here with only 2
    columns (Dealer Code, Dealer Description), no Company Code.
  - The single-line Date Range control (label, "From"/"To" each with
    their own picker) — per `date-range-single-line-17-09-2026-06_10_AM.md`.
  - The small, grey-background "Show Report" button — per
    `date-range-label-grey-show-report-button-17-09-2026-06_15_AM.md`/
    `shorter-date-pickers-and-grey-show-report-bg-17-09-2026-06_18_AM.md`.
  - The breadcrumb below the header — per
    `breadcrumbs-and-dealer-ledger-style-headers-17-09-2026-07_17_AM.md`.

## Scope

- `ReportSearchBarComponent` gains a `showCompanyCode` input
  (`input(true)`), so Company Code is omitted from the rendered fields
  (and from `value()`'s meaningfulness — `companyCode` stays `null`
  when hidden) when a consumer sets it `false`. Kept generic/shared
  rather than duplicating the whole component, since a future report
  may have the same "no Company Code" need.
- A new, dedicated Warranty Cost Report feature, structured like
  Dealer Ledger's (own route, own list-page component, own filter
  component) instead of the generic shared search-only page:
  - `src/app/features/warranty-cost-report/pages/warranty-cost-report-list/warranty-cost-report-list.component.{ts,html,scss,spec.ts}`
  - `src/app/features/warranty-cost-report/filters/warranty-cost-report-filter/warranty-cost-report-filter.component.{ts,html,scss,spec.ts}`
    (mirrors `DealerLedgerFilterComponent`, minus the checkbox group,
    with section headings "Dealer Details" and "Specify Date Range"
    matching the reference screenshot)
  - `src/app/features/warranty-cost-report/warranty-cost-report.routes.ts`
- `app.routes.ts` — remove `WARRANTY_COST_REPORT_CONFIG` from
  `SEARCH_ONLY_REPORT_CONFIGS`, add its own lazy route (mirroring
  `DEALER_LEDGER_FEATURE_PATH`'s pattern).
- Reuse (not duplicate): `BreadcrumbComponent`,
  `ReportSearchBarComponent` (with `showCompanyCode="false"`), and the
  same header/button/date-range CSS conventions already established
  for Dealer Ledger (either by literally sharing class names via a
  common stylesheet, or duplicating the small ruleset per this
  project's existing "no shared styling/theming layer yet" precedent —
  see Open decisions).
- Out of scope: any table/data source for Warranty Cost Report —
  `hasTable` stays `false`; Submit remains a no-op seam (like
  `ReportSearchOnlyPageComponent.onSearch()` today) until a real data
  source is confirmed.
- Out of scope: the other five search-only reports (Warranty
  Reconciliation, Warranty Labour Tax Invoice, Parts Packing List, VOR
  Print, PQM) — they stay on the generic shared page unless/until each
  gets its own confirmed reference design.

## Requirements

1. The Warranty Cost Report page shows a "Dealer Details" section
   containing Dealer Code and Dealer Description as read-only
   identity fields (Dealer Ledger's existing single-row-group style,
   just 2 columns instead of 3) — no Company Code field anywhere on
   this page.
2. The page shows a "Specify Date Range" section with a single-line
   Date Range control (label, "From" picker, "To" picker), matching
   Dealer Ledger's existing single-line date-range component.
3. A "Show Report" button (small, grey background, matching Dealer
   Ledger's) submits the form — disabled under the same "Date From
   after Date To" invalid-range condition as Dealer Ledger's
   `isDateRangeInvalid()`.
4. The page's own header ("Warranty Cost Report") is centered,
   `1.375rem`, with the breadcrumb ("Reports → Warranty Cost Report")
   directly below it, per the established pattern.
5. No table renders — this report still has no confirmed data source;
   Submit is a no-op seam for now, exactly like the generic
   search-only page's current placeholder behavior.
6. `ReportSearchBarComponent`'s new `showCompanyCode` input defaults
   to `true` — every other current consumer (Dealer Ledger, Goods
   Acknowledgement, the five remaining search-only reports) is
   unaffected.

## Acceptance criteria

- Navigating to `/warranty-cost-report` shows: breadcrumb, centered
  header, a "Dealer Details" section (Dealer Code + Dealer Description
  only, no Company Code), a "Specify Date Range" section (single-line
  From/To), and a small grey "Show Report" button — matching the
  reference screenshot's structure and section labels.
- Clicking "Show Report" with a valid date range does not throw (no
  data source wired up yet); with Date From after Date To, the button
  is disabled, matching Dealer Ledger's existing validation UX.
- `report-search-bar.component.spec.ts` gains a test:
  `showCompanyCode="false"` hides the Company Code field entirely.
- New `warranty-cost-report-list.component.spec.ts`/
  `warranty-cost-report-filter.component.spec.ts` cover: renders the
  two sections with correct labels, breadcrumb present with "Warranty
  Cost Report", Submit disabled on an invalid date range, no table
  rendered.
- The other five search-only reports' existing tests
  (`report-search-only-page.component.spec.ts`) continue to pass
  unchanged — this report is fully carved out, not a shared-component
  behavior change for the rest.

## Open decisions

- How the header/button/date-range CSS is shared between Dealer
  Ledger and Warranty Cost Report without duplicating the same rules
  twice: (a) duplicate the small SCSS ruleset per component (matching
  this project's existing "no shared styling/theming layer yet, TODO
  once one exists" precedent seen throughout `report-search-bar.component.scss`/
  `dealer-ledger-toolbar.component.scss`), or (b) extract a shared
  `report-page-header` mixin/partial now. Default assumption: (a),
  duplicate for now — consistent with how this codebase has
  consistently deferred shared styling extraction until a real
  styling/theming layer spec exists (`specs/design/design.md`).
- Exact identity-field-group column count handling: whether
  `ReportSearchBarComponent`'s existing `readonlyDealerFields()` +
  identity-group markup can simply skip rendering the Company Code
  `<div class="report-search-bar__identity-col">` when
  `showCompanyCode()` is false (2 columns instead of 3, same
  container), or needs a distinct layout — default assumption: same
  container, conditionally omit the one column, since the existing
  flex layout (`flex: 1 1 0`) already accommodates any column count.
- Section heading style ("Dealer Details", "Specify Date Range") —
  default assumption: reuse the existing small, muted-grey label style
  already used elsewhere (e.g. `.report-search-bar__card-label`'s
  `0.6875rem`/`#666`), scaled up slightly for a section-level heading
  (e.g. `0.8125rem`, `font-weight: 600`), rather than introducing a new
  heading style — to be confirmed visually during implementation.
