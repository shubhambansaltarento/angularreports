# Dealer Ledger — Spec 15: Dealer Code / Description / Company Code as Cards

**Created:** 2026-09-16 14:14 IST

## Status

Proposed. Supersedes `inline-label-value-identity-fields-16-09-2026-02_09_PM.md` — rather
than label and value sharing one line, each read-only field renders as a
bordered card (label on top, value below), matching the visual language
already used by `DealerLedgerSummaryCardsComponent`'s Total Debit/Total
Credit/Closing Balance/Entries cards.

## Scope

This document changes how each read-only identity field (Dealer Code,
Dealer Description, Company Code) renders: as an individual card — a
bordered box with a small muted label on top and a larger bold value below
— rather than plain inline text.

## Reference

Matches the existing summary-card style: `.dealer-ledger-summary-cards__card`
(`border: 1px solid #e0e0e0; border-radius: 4px; padding: 0.75rem 1rem;`),
`__label` (`font-size: 0.75rem; color: #666;`), `__value`
(`font-size: 1.25rem; font-weight: 600;`). The request confirms: "its like a
cards" — i.e. these three fields should look the same as those summary
cards, just showing Dealer Code/Description/Company Code instead of
financial totals.

## Current implementation observations

- `ReportSearchBarComponent`'s `readonlyDealerFields()` mode currently
  renders label (`.form-label`) and value (`.report-search-bar__text
  .form-control-plaintext`) with `.report-search-bar__field--inline` forcing
  them onto one line (per Spec 10) — this is being replaced by the card
  look.
- `DealerLedgerSummaryCardsComponent` already defines the exact target
  card visual (see Reference) but is Dealer-Ledger-specific and renders
  numeric summary data (`DealerLedgerSummaryCardsComponent.cards()`), not
  the shared `ReportSearchBarComponent`'s fields — the styling needs to be
  reproduced for/reused by `ReportSearchBarComponent`'s read-only fields
  rather than literally sharing the component.

## Requirements

1. When `readonlyDealerFields()` is true, each of Dealer Code, Dealer
   Description, and Company Code renders as its own card: a bordered,
   rounded box containing a small muted label above a larger bold value —
   visually consistent with `DealerLedgerSummaryCardsComponent`'s cards
   (same border/radius/padding/label/value treatment, reusable as shared
   CSS values or a small shared style rather than duplicated ad hoc).
2. The three cards sit side by side on one row (per
   `single-line-identity-fields-16-09-2026-01_59_PM.md`), each taking an equal share of
   the row width — similar to how the summary cards lay out in a responsive
   grid (`repeat(auto-fit, minmax(...))`).
3. Editable fields (Date From/Date To) are unaffected — this styling is
   scoped to the read-only identity fields only.
4. `.report-search-bar__field--inline` (Spec 10's one-line label+value
   treatment) is removed/replaced by this card treatment for read-only
   fields.

## Acceptance criteria

- Dealer Code, Dealer Description, and Company Code each render as a
  bordered card with label-above-value, visually matching the summary
  cards' look.
- The three cards appear side by side on one row at desktop widths.
- Date From/Date To remain standard label-above-input fields, unaffected.
- `report-search-bar.component.spec.ts` is updated: assertions checking for
  one-line inline text are replaced with assertions for the card's label/
  value structure.

## Open decisions

- Whether the card styling is expressed as new shared CSS class names on
  `ReportSearchBarComponent` (e.g. `.report-search-bar__field--card`,
  `.report-search-bar__card-label`, `.report-search-bar__card-value`)
  duplicating the summary-card's literal values, or factored into a small
  shared SCSS mixin/CSS custom-property set both components import — TBD,
  default assumption is duplicating the class values locally (matching this
  codebase's current per-component SCSS convention — see
  `specs/design/design.md`'s note that a shared token/theming layer does not
  exist yet), rather than introducing a new shared abstraction for two call
  sites.
