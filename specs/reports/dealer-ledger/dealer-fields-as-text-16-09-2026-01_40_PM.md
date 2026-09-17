# Dealer Ledger — Spec 1: Dealer Code & Dealer Description as Text

## Status

Proposed.

## Scope

This document specifies changing the Dealer Code and Dealer Description fields in the
Dealer Ledger filter panel (`src/app/features/dealer-ledger/filters/dealer-ledger-filter`)
from editable input fields to read-only text display.

## Requirements

1. Dealer Code is displayed as plain text, not an editable input field.
2. Dealer Description is displayed as plain text, not an editable input field.
3. Both values continue to be sourced from the current dealer's context
   (`DealerContextService`), same as today's prefill behavior.
4. Company Code, Report Range (From/To), and Include Details checkboxes remain
   editable as they are today — this change is scoped to Dealer Code and
   Dealer Description only.
5. The read-only presentation must not be submittable/clearable via the Reset
   action in a way that changes its value — Reset only affects fields the
   user can edit.

## Current implementation observations

- `ReportSearchBarComponent` (`src/app/shared/ui/report-search-bar`) currently
  renders Dealer Code, Dealer Description, Company Code, and the date range as
  input fields, shared across reports.
- `DealerLedgerFilterComponent` prefills these fields from
  `DealerContextService` via `initialValue`.
- Making Dealer Code/Dealer Description read-only in Dealer Ledger only
  (without affecting other reports that reuse `ReportSearchBarComponent`)
  requires either a display-mode input on the shared component or a
  Dealer Ledger-specific presentation for these two fields.

## Acceptance criteria

- On the Dealer Ledger filter panel, Dealer Code and Dealer Description render
  as non-editable text (e.g. plain text/label), populated from dealer context.
- Company Code and Report Range remain editable inputs.
- Other reports using the shared search bar are unaffected.
- Search/Reset/Export continue to work with the dealer code/description values
  taken from context rather than user input.

## Open decisions

- Whether the shared `ReportSearchBarComponent` gains a "read-only field" mode,
  or Dealer Ledger renders its own text presentation for these two fields
  outside the shared component: TBD.
