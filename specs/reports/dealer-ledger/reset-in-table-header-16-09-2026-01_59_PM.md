# Dealer Ledger — Spec 6: Reset Moves Into the Table Header

**Created:** 2026-09-16 13:59 IST

## Status

Proposed. Supersedes the standalone Reset button introduced by
`remove-actions-row-16-09-2026-01_52_PM.md`.

## Purpose

`remove-actions-row-16-09-2026-01_52_PM.md` removed the Search/Export/Reset action row from
the filter panel but kept a standalone "Reset filters" pill button
(`.dealer-ledger-filter__reset-row`) below "Include Details". This document
specifies removing that standalone button too, and instead exposing Reset as
a control inside the table's own header/toolbar
(`DataTableComponent`'s `.data-table__toolbar`), alongside its existing
search box and Export control.

## Scope

- Remove `.dealer-ledger-filter__reset-row` / the "Reset filters" button from
  `dealer-ledger-filter.component.html`.
- Add a Reset control to `DataTableComponent`'s toolbar
  (`data-table.component.html`, `.data-table__toolbar-actions`), or to
  `DealerLedgerTableComponent` if Reset is Dealer-Ledger-specific rather than
  a generic table capability (see Open decisions).
- Preserve the underlying Reset behavior: clearing Company Code/Date Range
  back to defaults, clearing the "Include Details" checkbox selection, and
  telling the list page to reload the unfiltered result set
  (`DealerLedgerStore.reset()`).

## Current implementation observations

- `DealerLedgerFilterComponent.onReset()` calls `this.searchBar().reset()`,
  clears `checkboxSelection`, and emits `reset` — consumed by
  `DealerLedgerListComponent.onReset()` → `store.reset()`.
- `DataTableComponent`'s toolbar today only has a search input and a Columns/
  Export menu — no reset concept, since the generic table has no notion of
  "filters" (that is entirely owned by each report's filter panel).
- Because Reset is filter-panel state (Dealer Code/Description are read-only
  per Spec 1, but Company Code/Date Range/checkboxes are still user-editable
  and need clearing), the table itself cannot fully self-reset — it needs to
  either expose a `reset` output the list page wires to the filter panel, or
  the filter panel needs to remain reachable from the table's header somehow.

## Requirements

1. No Reset control remains in the filter panel's own markup below "Include
   Details" — the filter panel exposes Reset only as a `reset()` method/
   output for something else to trigger, not as its own rendered button.
2. `DataTableComponent`'s toolbar (or `DealerLedgerTableComponent`, wrapping
   it) renders a "Reset" button/icon alongside the existing search box and
   Export control.
3. Clicking that Reset button clears the filter panel's editable fields
   (Company Code, Date Range) and checkbox selection back to defaults, and
   triggers the same store reset (`DealerLedgerStore.reset()`) as today.
4. Reset's enabled/disabled state (only enabled when a filter/checkbox is
   currently active) is preserved, sourced from the filter panel's
   `hasActiveFilters` state.

## Acceptance criteria

- No "Reset filters" button appears below "Include Details".
- A Reset control is visible in the table's header area, disabled when no
  filter/checkbox is active and enabled otherwise.
- Clicking it clears filters/checkboxes and reloads the unfiltered list,
  matching today's Reset behavior exactly.
- `dealer-ledger-filter.component.spec.ts`/`dealer-ledger-list.component.spec.ts`
  are updated for the relocated control.

## Open decisions

- Where the wiring lives: (a) `DataTableComponent` gains a generic optional
  `resetDisabled`/`reset` input+output any report can opt into, with
  `DealerLedgerListComponent` bridging the filter panel's state/`reset()`
  method to the table's inputs/outputs; or (b) Reset stays specific to
  Dealer Ledger, rendered by `DealerLedgerTableComponent` itself (composing
  `DataTableComponent` plus one extra button) so the shared table stays
  domain-agnostic — TBD, default assumption is (a) since a "Reset" action
  alongside Search/Export is plausibly useful to other reports too.
- Icon vs. text label for the relocated Reset control, consistent with the
  Columns/Export buttons' current text-label styling — TBD.
