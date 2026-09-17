# Dealer Ledger — Header: Center Heading, Single-Row Identity Fields, Remove Entry Count

**Created:** 2026-09-17 06:05 AM

## Status

Implemented — `totalCount()`/`loading()` removed entirely from
`DealerLedgerToolbarComponent`; label ~0.6875rem, value ~0.9rem.

## Purpose

Three changes to the Dealer Ledger page header
(`DealerLedgerToolbarComponent`) and the identity-field cards
(`ReportSearchBarComponent`'s `readonlyDealerFields()` mode, used only
by Dealer Ledger today):

1. Center-align the "Dealer Ledger" heading (currently left-aligned).
2. Replace the three separate bordered cards (Dealer Code, Dealer
   Description, Company Code — one box per field) with a single row:
   one container, three columns, two rows (label row + value row) —
   and reduce the font size used for the label/value text.
3. Remove the "41 entries" count from the top-right of the header
   entirely — not required.

## Current implementation

- `DealerLedgerToolbarComponent`'s template
  (`dealer-ledger-toolbar.component.html`):
  ```html
  <header class="dealer-ledger-toolbar">
    <h1 class="dealer-ledger-toolbar__title">{{ title() }}</h1>
    <span class="dealer-ledger-toolbar__count" role="status" aria-live="polite" ...>
      ... {{ totalCount() }} entries
    </span>
  </header>
  ```
  with `.dealer-ledger-toolbar { display: flex; justify-content: space-between; }`
  (`dealer-ledger-toolbar.component.scss:4-9`) — the title sits left,
  the count sits right.
- The three identity fields (`ReportSearchBarComponent`, per
  `identity-fields-as-cards-16-09-2026-02_14_PM.md`) each render as
  their own separate bordered box via
  `.report-search-bar__field--card` (`report-search-bar.component.scss:17-22`
  — `border: 1px solid #e0e0e0; border-radius: 4px;` per field), with
  `.report-search-bar__card-value` at `font-size: 1.25rem` (large) —
  this is `readonlyDealerFields()` mode, applied only by
  `DealerLedgerFilterComponent` (the only current consumer of this
  mode, confirmed by search — no other report uses it).

## Scope

- `DealerLedgerToolbarComponent`'s template/styles — center the
  heading; remove the entry-count `<span>` entirely (and, if nothing
  else consumes it, the `totalCount()`/`loading()` inputs and the
  skeleton-shimmer styling that exists solely to support it — verify
  no other consumer needs them before removing).
- `ReportSearchBarComponent`'s `readonlyDealerFields()` card styling —
  replace the three separate per-field bordered boxes with one
  container wrapping all three fields (Dealer Code, Dealer
  Description, Company Code) as a single row, each field its own
  column within it — a 3-column, 2-row grid per field (label row above
  value row, as today), just not individually boxed.
- Reduce `.report-search-bar__card-label`/`.report-search-bar__card-value`
  font sizes.
- Out of scope: the Date From/Date To fields and the "Include Details"
  checkbox group — unaffected, still their own separate controls
  outside this single-row identity-field box.
- Out of scope: `DealerLedgerListComponent`'s use of
  `store.filteredCount()` as `[totalCount]` to the toolbar — once the
  toolbar no longer displays a count, this binding is removed from the
  template alongside the toolbar-side changes.

## Requirements

1. `DealerLedgerToolbarComponent`'s "Dealer Ledger" heading is
   horizontally centered within the header.
2. The header no longer shows an entry count anywhere ("41 entries" or
   equivalent) — removed entirely, not just hidden.
3. Dealer Code, Dealer Description, and Company Code render inside a
   single bordered container (one row), laid out as three columns —
   each column showing its label above its value (2 rows per column,
   matching today's label/value stacking, just not individually
   boxed).
4. The label and value font sizes inside this single-row container are
   smaller than today's card sizing.
5. No functional change — these fields remain read-only display
   (sourced from dealer context / config, per
   `dealer-fields-as-text-16-09-2026-01_40_PM.md`), Reset/Submit
   behavior is unaffected.

## Acceptance criteria

- The "Dealer Ledger" heading appears centered in the header, with no
  count text anywhere in the header.
- Dealer Code, Dealer Description, and Company Code appear inside one
  bordered box (not three), arranged as three columns with label above
  value in each, at a visibly smaller font size than before.
- `dealer-ledger-toolbar.component.spec.ts` is updated: any test
  asserting the count text renders is removed/updated; a test confirms
  the heading has the centered style/class.
- `report-search-bar.component.spec.ts` is updated: existing
  `readonlyDealerFields()` tests confirm the three fields render
  inside a single shared container rather than three separately
  bordered ones, and existing text-content assertions (values still
  render correctly) continue to pass.

## Open decisions

- Exact reduced font sizes for the label/value pair — default
  assumption: label ~`0.6875rem`–`0.7rem` (a touch smaller than the
  main table's own `0.75rem` header text), value ~`0.9rem`–`1rem`
  (down from today's `1.25rem`), to be confirmed visually during
  implementation.
- Whether `totalCount()`/`loading()` are removed entirely from
  `DealerLedgerToolbarComponent`'s inputs, or kept (unused in the
  template) for a possible future re-introduction — default
  assumption: remove them entirely, along with the now-dead skeleton
  shimmer styles, since dead inputs/styles should not linger
  (Requirement 2 is "removed entirely, not just hidden").
