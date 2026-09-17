# Dealer Ledger — Spec 7: Dealer Code / Description / Company Code on One Line, Company Code as Text

**Created:** 2026-09-16 13:59 IST

## Status

Proposed. Refines `dealer-fields-as-text-16-09-2026-01_40_PM.md` and
`top-to-bottom-layout-16-09-2026-01_43_PM.md`'s row1/row2/row3.

## Scope

This document changes two things about the top of the Dealer Ledger filter
panel:

1. Dealer Code, Dealer Description, and Company Code render on a single
   line (row) instead of three stacked rows.
2. Company Code becomes read-only text (like Dealer Code/Description per
   Spec 1), rather than an editable input.

## Current implementation observations

- Per `top-to-bottom-layout-16-09-2026-01_43_PM.md`, `ReportSearchBarComponent`'s `stacked`
  input currently renders Dealer Code, Dealer Description, and Company Code
  each as its own full-width (`col-12`) row.
- Per `dealer-fields-as-text-16-09-2026-01_40_PM.md`, `readonlyDealerFields` currently
  makes only Dealer Code and Dealer Description read-only text; Company Code
  is still an editable `<input>` bound to `formControlName="companyCode"`.
- Example values from the request: Dealer Code `DLR-001`, Dealer Description
  free text, Company Code free text — all sourced today from
  `DealerContextService` via `DealerLedgerFilterComponent.initialValue`.

## Requirements

1. Dealer Code, Dealer Description, and Company Code render side by side on
   one row (e.g. three columns within a single Bootstrap `.row`), not as
   three stacked full-width rows.
2. Company Code renders as read-only text (same treatment as Dealer Code/
   Dealer Description), populated from dealer context — no longer an
   editable `<input>`.
3. Date Range (From/To) remains on its own row below this combined identity
   row, per `top-to-bottom-layout-16-09-2026-01_43_PM.md`'s row4.
4. `ReportSearchBarComponent`'s `readonlyDealerFields` input is renamed/
   extended in scope to also cover Company Code (or a new
   `readonlyCompanyCode` input is added) — since Company Code readonly-ness
   is Dealer-Ledger-specific, other reports reusing the shared component are
   unaffected unless they also opt in.

## Acceptance criteria

- Dealer Code, Dealer Description, and Company Code appear together on one
  line at desktop widths (may still stack at narrow/phone widths per
  existing responsive rules).
- Company Code displays as plain text sourced from dealer context, not an
  editable field.
- Date Range remains directly below this row, unaffected in behavior.
- `report-search-bar.component.spec.ts` and
  `dealer-ledger-filter.component.spec.ts` are updated: assertions that
  `#report-search-bar-company-code` is an `<input>` are changed to expect
  read-only text, consistent with the existing Dealer Code/Description
  assertions.

## Open decisions

- Exact column split for the combined row (e.g. even thirds vs. Dealer
  Description getting more width, matching the original non-stacked
  `col-lg-2/3/2` proportions) — TBD, default to reusing those original
  column-width ratios.
- Naming of the extended readonly input (`readonlyDealerFields` broadened to
  include Company Code vs. a separate `readonlyCompanyCode` flag) — TBD.
