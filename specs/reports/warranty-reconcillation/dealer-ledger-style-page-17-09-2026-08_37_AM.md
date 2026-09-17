# Warranty Reconciliation — Dedicated Page, Dealer-Ledger-Style (No Date Range)

**Created:** 2026-09-17 08:37 AM

## Status

Proposed.

## Purpose

Build Warranty Reconciliation's search/results page as its own
dedicated feature, mirroring the pattern already established for
Warranty Cost Report (`warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md`)
and, before that, Dealer Ledger: centered small header, breadcrumb
below it, a read-only Dealer Code/Description identity block, and a
small grey "Show Report" submit button — reusing the same shared
components (`ReportSearchBarComponent`, `BreadcrumbComponent`)
rather than inventing new UI.

Confirmed via direct API testing before writing this spec (not
assumed): this report has **no date-range parameter at all** — its
`/config` only defines `dealerCode` (optional text) and `companyCode`
(required select, default `TVSL`). This is simpler than every other
report built so far (Dealer Ledger and Warranty Cost Report both have
a date range); the UI must not show a Date Range control that doesn't
correspond to any real parameter.

## Confirmed real API responses

### `GET /api/v1/reports/WARRANTY_RECONCILLATION/config`

Note the backend's own spelling throughout — `reportCode`,
`title` ("Warranty Reconcillation"), and the URL path segment are all
spelled with the double-L "Reconcillation", not the standard English
"Reconciliation". This must be used verbatim for the report key/route
segment sent to the backend (see Scope) — it is not a typo to silently
"fix" client-side, since the real API requires this exact string.

```json
{
  "reportCode": "WARRANTY_RECONCILLATION",
  "title": "Warranty Reconcillation",
  "configVersion": "2026.09.1",
  "context": { "dealerCode": "10015", "dealerDescription": "PAWAN SARKAR AUTOMOBILES" },
  "parameters": [
    { "name": "dealerCode", "label": "Dealer Code", "control": "TEXT", "dataType": "STRING", "required": false, "defaultValue": null, "layout": { "row": 1, "span": 4 } },
    { "name": "companyCode", "label": "Company Code", "control": "SELECT", "dataType": "STRING", "required": true, "defaultValue": "TVSL", "options": [{ "value": "TVSL", "label": "TVS Lucas" }], "layout": { "row": 1, "span": 4 } }
  ],
  "columnGroups": [
    {
      "key": "base", "label": "Warranty Reconcillation", "visibleWhen": null,
      "columns": [
        { "field": "dealerCode", "label": "Dealer Code", "dataType": "string", "align": "left", "sortable": true, "defaultVisible": true, "visible": true },
        { "field": "dealerName", "label": "Dealer Name", "dataType": "string", "align": "left", "sortable": false, "defaultVisible": true, "visible": true }
      ]
    }
  ],
  "export": { "formats": ["XLSX", "PDF"] },
  "paging": { "defaultPageSize": 50, "maxPageSize": 1000 }
}
```

No `claimDate`/date-range parameter of any kind — unlike Dealer Ledger
and Warranty Cost Report, both of which have one.

## Scope

- New feature under `src/app/features/warranty-reconciliation/`
  (this project's existing folder, correctly spelled in English —
  matching this project's file/route-naming convention for every
  other feature; only the *backend's own* report key/API path segment
  uses the double-L spelling, per the confirmed contract above), with
  its own route (own list-page component, own filter component),
  mirroring Dealer Ledger's/Warranty Cost Report's structure — not the
  generic shared search-only page (this report now has both `/config`
  and `/data` confirmed live, so it graduates the same way Warranty
  Cost Report did).
- Filter component: Dealer Code/Dealer Description as read-only
  identity fields (`readonlyDealerFields="true"`, `showCompanyCode="false"`,
  matching Warranty Cost Report's exact reuse pattern) — **no Date
  Range control at all**, since no such parameter exists. Company Code
  is silently defaulted (`TVSL`, from config) and always sent, exactly
  as Warranty Cost Report already does.
- A small grey "Show Report" button submits — with no date-range
  validity check to gate it (there's no date range to validate), it's
  simply always enabled.
- List page: centered `1.375rem` header, breadcrumb below it, table
  gated behind `hasSearched()` exactly like Dealer Ledger/Warranty
  Cost Report.
- `warranty-reconciliation.config.ts` — `hasTable` becomes `true`
  (both APIs confirmed live).
- `app.routes.ts` — remove `WARRANTY_RECONCILIATION_REPORT_CONFIG`
  from `SEARCH_ONLY_REPORT_CONFIGS`, add its own lazy route.
- Out of scope: any change to `ReportSearchBarComponent`'s public API
  — its existing `showCompanyCode`/`identitySectionLabel`/
  `dateSectionLabel` inputs (all optional, default to today's
  behavior) already support this report's narrower needs with no new
  input required; simply omit the date-range portion of its template
  usage... **actually**: `ReportSearchBarComponent`'s date range is
  not currently optional/omittable — see the companion API-integration
  spec's Scope for the one small shared-component change this report
  requires (a `showDateRange` input, mirroring `showCompanyCode`'s
  existing precedent).

## Requirements

1. The page shows: breadcrumb ("Reports → Warranty Reconciliation"),
   centered header, a read-only Dealer Code/Description block (no
   Company Code, no section headings — matching Warranty Cost
   Report's established look), and a small grey "Show Report" button
   — no Date Range control anywhere.
2. Submitting fetches `/data` with just `dealerCode`/`companyCode` (no
   date-range parameter) and renders a table with Dealer Code/Dealer
   Name columns, gated behind `hasSearched()`.
3. No functional regression to any other report reusing
   `ReportSearchBarComponent` — the new "hide the date range entirely"
   capability defaults to showing it (current behavior) for every
   existing consumer.

## Acceptance criteria

- Navigating to `/warranty-reconciliation` shows no Date Range
  field anywhere on the page.
- Submitting (with no date range to validate) always works — "Show
  Report" is never disabled by a date-range check.
- The rendered table shows real Dealer Code/Dealer Name data for
  dealer `10015` after Submit.
- Reports Home no longer shows "Search parameters only" for Warranty
  Reconciliation.
- `dealer-ledger-filter.component.spec.ts`/`report-search-bar.component.spec.ts`
  (existing) continue to pass unchanged — the new hide-date-range
  input defaults to `true` (shown), so no other consumer's rendered
  output changes.

## Open decisions

- None — directly mirrors Warranty Cost Report's already-established
  pattern, minus the date range this report doesn't have.
