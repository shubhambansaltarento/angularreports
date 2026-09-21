# Legacy SAP-BO-Style Report Redesign

## Context

Reference screenshots (P902 - Alternate Part Details, S106 - Service Appointment Details) show
the legacy SAP BusinessObjects report look this app should now match:

- A full-width blue title bar: report code + name on the left (e.g. `P902 - ALTERNATE PART
  DETAILS`), icon actions on the right (`Input Form`, `Print`, `Export`, and/or `PDF`).
- A centered report title below the bar (e.g. `P902 -Alternate Part Details`).
- Small key/value metadata lines above the table, left-aligned, one per filter/context value
  (e.g. `Part No : All`, `Branch: PAVAN SEKHAR AUTOMOBILES`, `Job Type: All`, `Model: All`,
  `Appnt Dt :01-09-2026 - 18-09-2026`, `Appt Created Dt: Appt Dt : -`, `Appt By: All`).
- A DataTables-style toolbar directly above the table: `Show [10 ▾] entries` on the left,
  `Search: [___]` on the right.
- A bordered, striped table with a solid blue header row (white header text), and body rows
  alternating white/light-grey.
- Numeric columns right-aligned; a bold, blue-text `Total` row at the bottom of tables that
  aggregate (as in S106).

This is a deliberate reversal of the current, recently-implemented monochrome table redesign
(`specs/table/monochrome-redesign-and-column-picker-text-fix-17-09-2026-05_56_AM.md`), and it adds
a page-size selector and a colored header bar that do not exist anywhere in the app today. It also
supersedes the plain centered-title header convention from
`specs/features/breadcrumbs-and-dealer-ledger-style-headers-17-09-2026-07_17_AM.md` for the header
bar itself (the breadcrumb trail underneath can remain, placement TBD — see Open decisions).

## Current state (as implemented today)

- **Shared table** — `src/app/shared/ui/data-table/data-table.component.{ts,html,scss}`:
  toolbar has a title, row count, and a search input; pagination footer has Prev/page
  numbers/Next only (no page-size dropdown). Table uses `.table.table-hover` — no
  `.table-striped`/`.table-bordered`, no header color, no footer/totals row. Per-column
  `align: 'start' | 'center' | 'end'` already exists on `TableColumn` and must simply be set to
  `'end'` for numeric columns per report.
- **Report header** — no generic header-bar-with-icons component exists. The closest is
  `DealerLedgerToolbarComponent`, a plain centered `<h1>` (1.375rem, no color, no icons), reused
  by the other search-only reports via `ReportSearchOnlyPageComponent`.
- **Design tokens** — Bootstrap 5 (CSS only) via `src/styles.scss`; no custom SCSS
  variable/token file yet; brand palette is an open decision in `specs/design/design.md`. Table
  colors today are ad hoc greys, not named tokens.
- **Scope** — report feature folders: `dealer-ledger`, `goods-acknowledgement`,
  `parts-packing-list`, `pqm`, `reports-home`, `vor-print`, `warranty-cost-report`,
  `warranty-labour-tax-invoice`, `warranty-reconciliation`. Warranty Cost Report's statement
  table is a bespoke table (fixed 11 columns, dealer/memo/header row order) separate from the
  shared `DataTableComponent` — it needs the same header/toolbar treatment even though it won't
  use the shared table's row styling directly.

## Requirement

### 1. Shared report header bar (new component)

Add a shared, reusable header bar component (e.g. `ReportHeaderBarComponent` in
`shared/ui/report-header-bar/`) used by every report page, replacing/wrapping the current plain
`<h1>` header:

- Full-width bar in the brand blue token (see Design tokens below), with:
  - Left: report code + name, e.g. `P902 - ALTERNATE PART DETAILS` (or the report's existing
    title text, uppercased with code prefix if a code exists in report config/constants).
  - Right: icon-only action buttons — `Input Form`, `Print`, `Export`, and `PDF` where
    applicable (not every report needs all four; make the action list an input so each report
    opts in to what it actually supports today, e.g. only reports with an existing export/print
    action get that icon).
- Below the bar: the existing centered report title stays, unchanged in size/weight, per the
  breadcrumb spec's existing convention — only the colored bar above it is new.
- The existing `BreadcrumbComponent` ("Reports → Title") keeps its current position beneath the
  title (Open decision: confirm no report needs it moved above the color bar instead).

### 2. Metadata line block (new, per report)

Below the centered title (and breadcrumb), each report renders its own short list of key/value
metadata lines sourced from its actual filter values (not new state) — e.g. `Part No : All`,
`Branch: <dealer name>`, `Date range: <from> - <to>`. This is report-specific content, not a
shared component; only the small-text/label styling (a shared SCSS class or a tiny presentational
component) needs to be shared.

### 3. Shared table restyling

In `data-table.component`:

- Add `.table-striped .table-bordered` to the table's classes (alongside existing
  `.table-hover`).
- Add a solid blue header row with white header text (new SCSS, using the same blue token as the
  header bar).
- Add a `Show [N ▾] entries` page-size selector to the toolbar, to the left of (or replacing) the
  current search input's position, matching the DataTables convention shown in the screenshots.
  Options: 10/25/50/100 (confirm with `pageSize` input default).
- Add an optional bold `Total` row rendered as a table `<tfoot>`, driven by a new optional
  `totals` input (map of column key → displayed value), shown only when a report supplies one.
- Set `align: 'end'` on numeric `TableColumn` definitions for reports whose columns are counts/
  amounts (audit each report's `*-column-definitions.ts`).

### 4. Design tokens

Add a small SCSS token file (e.g. `src/app/shared/styles/_tokens.scss`) defining the header-bar
blue and header-row blue as named variables, imported by both the new header bar component and
the data table's styles, so the color exists in exactly one place. Resolves the long-open "brand
palette" TBD in `specs/design/design.md` for this specific blue (does not attempt to resolve the
rest of that file's open decisions).

### 5. Scope

Apply the new header bar + table restyling to all report feature folders listed above,
including Warranty Cost Report's bespoke statement table (header bar only; its own table spec's
row/column layout is unchanged unless a totals row is already required there — cross-check
`specs/reports/warranty-cost/` before touching that table's markup).

## Out of scope

- No change to report business logic, filters, or API contracts.
- No change to the breadcrumb trail's copy or navigation behavior.
- Icon set/library choice is out of scope for this spec if `specs/design/design.md` already has
  an open decision pending — pick a minimal inline-SVG or Bootstrap Icons approach only if no
  icon library is already chosen elsewhere; do not introduce a second icon library.

## Open decisions

- Exact hex value for the header-bar blue (sample from screenshots vs. an existing brand guide —
  none confirmed in the repo yet).
- Whether "Input Form" is a real action for every report or just a label seen in the reference
  screenshots (needs product confirmation before wiring a real navigation/behavior).
- Whether the monochrome table spec's rationale (if any accessibility/branding reason was
  recorded) still applies elsewhere — confirm no conflicting requirement before reverting it
  globally.

## Acceptance criteria

- Every report page in scope renders the new blue header bar with report code/name and only the
  action icons that report actually supports.
- The shared `DataTableComponent` renders striped, bordered rows with a blue header row and a
  page-size selector, without regressing existing sort/filter/column-picker behavior.
- Numeric columns are right-aligned on every report where they represent counts/amounts.
- Reports that already aggregate totals (e.g. S106-equivalent count reports) show a bold Total
  row.
- No existing report's data-fetch, filter, or export functionality changes as a result of this
  restyling.
