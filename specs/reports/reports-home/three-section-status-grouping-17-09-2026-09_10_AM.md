# Reports Home — Two Sections: Reports in Progress, Reports to be Picked

**Created:** 2026-09-17 09:10 AM
**Revised:** 2026-09-17 09:20 AM — reverted from three headings to two, per explicit correction.

## Status

Implemented.

## Purpose

`group-implemented-reports-top-row-17-09-2026-09_07_AM.md` split
Reports Home into two sections using `hasTable` alone, which
incorrectly grouped Goods Acknowledgement (table/columns scaffolded,
but — per its own config's comment — *"No data source is wired up
yet ... per explicit instruction not to fabricate data for this report
until its source data is confirmed"*) into the same top section as the
three reports with a real, live API integration (Dealer Ledger,
Warranty Cost Report, Warranty Reconciliation).

This spec originally proposed a three-heading fix (Available Reports /
Reports in Progress / Reports to be Picked). That was corrected back
down to **two** headings:

- **Reports in Progress** — the reports with a real, live API
  integration: Dealer Ledger, Warranty Cost Report, Warranty
  Reconciliation.
- **Reports to be Picked** — everything else, including Goods
  Acknowledgement (scaffolded-only) and every pure search-only
  placeholder (Warranty Labour Tax Invoice, Parts Packing List, VOR
  Print, PQM).

Confirmed current catalog state (`grep hasTable`/`apiIntegrated`
across every `*.config.ts`):

| Report | `hasTable` | `apiIntegrated` | Section |
|---|---|---|---|
| Dealer Ledger | true | true | Reports in Progress |
| Warranty Cost Report | true | true | Reports in Progress |
| Warranty Reconciliation | true | true | Reports in Progress |
| Goods Acknowledgement | true | false | Reports to be Picked |
| Warranty Labour Tax Invoice | false | false | Reports to be Picked |
| Parts Packing List | false | false | Reports to be Picked |
| VOR Print | false | false | Reports to be Picked |
| PQM | false | false | Reports to be Picked |

## Scope

- `ReportConfig` (`shared/models/report-config.model.ts`) keeps the
  additive `apiIntegrated: boolean` field introduced by this spec
  — true only for reports with a real, confirmed-live `/config`+`/data`
  integration. `hasTable` is unchanged in meaning/usage (still gates
  routing — dedicated route vs. generic search-only page — and still
  drives the "Search parameters only" badge).
- `dealer-ledger.config.ts`, `warranty-cost-report.config.ts`,
  `warranty-reconciliation.config.ts`: `apiIntegrated: true`.
  All other configs, including `goods-acknowledgement.config.ts`
  (explicitly, despite its `hasTable: true`): `apiIntegrated: false`.
- `ReportsHomeComponent`: exactly two derived groups —
  `inProgressReports` (`apiIntegrated`) and `toBePickedReports`
  (`!apiIntegrated`).
- `reports-home.component.html`: two `<section>`s — "Reports in
  Progress" then "Reports to be Picked" — separated by a divider,
  reusing the existing card markup. A group with zero reports renders
  nothing (no empty heading/section).
- Out of scope: any change to routing behavior — `hasTable` still
  solely decides `app.routes.ts`'s search-only vs. dedicated-route
  behavior; `apiIntegrated` is presentation-only (Reports Home
  grouping), not consulted by routing.

## Requirements

1. Reports Home shows two headed sections, in this order: "Reports in
   Progress" (Dealer Ledger, Warranty Cost Report, Warranty
   Reconciliation), "Reports to be Picked" (Goods Acknowledgement,
   Warranty Labour Tax Invoice, Parts Packing List, VOR Print, PQM).
2. If a section has no reports, it (and its heading/divider) doesn't
   render at all.
3. A report's section is derived purely from its own config's
   `apiIntegrated` flag — no report is named/hardcoded in
   `ReportsHomeComponent`.
4. No change to the "Search parameters only" badge, card content, or
   routing for any report.

## Acceptance criteria

- Reports Home renders exactly 2 section headings in the stated
  order, with the reports listed above in each.
- `reports-home.component.spec.ts`: asserts each of the two groups'
  membership from `REPORTS_CATALOG` (via `apiIntegrated`), and that
  Goods Acknowledgement specifically appears in "Reports to be
  Picked", not "Reports in Progress".
- Existing badge/link/route tests continue to pass unchanged.

## Open decisions

- None.
