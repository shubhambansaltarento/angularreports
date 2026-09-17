# Dealer Ledger — Spec 12: Remove the Reset Control Entirely

**Created:** 2026-09-16 14:09 IST

## Status

Proposed. Supersedes `reset-in-table-header-16-09-2026-01_59_PM.md` — rather than
relocating Reset into the table header, this removes it altogether.

## Scope

This document specifies removing the Reset control from the Dealer Ledger
page entirely: no "Reset" button in the filter panel (already removed per
`remove-actions-row-16-09-2026-01_52_PM.md`) and no "Reset" button in the table's header
(added per `reset-in-table-header-16-09-2026-01_59_PM.md`, now removed).

## Current implementation observations

- `DataTableComponent` has a `showReset` input that renders a "Reset" button
  in its toolbar when true (`data-table.component.html`,
  `.data-table__toolbar-actions`), plus `resetDisabled` input and
  `resetClicked` output.
- `DealerLedgerTableComponent` passes `[showReset]="true"` and re-exposes
  `resetDisabled`/`reset` to bridge the table's header button to the filter
  panel.
- `DealerLedgerListComponent` binds `[resetDisabled]="!filter().hasActiveFilters()"`
  and `(reset)="onTableReset()"`, which calls `filter().resetFilters()`.
- `DealerLedgerFilterComponent.resetFilters()` (clearing fields/checkboxes,
  restoring the 1-month default date range, and emitting `reset`) remains
  useful internally even with no UI trigger — see Open decisions.

## Requirements

1. `DealerLedgerTableComponent` no longer passes `[showReset]="true"` (or
   passes `false`/omits it) — no Reset button appears in the table header.
2. `DealerLedgerListComponent` no longer binds `resetDisabled`/`(reset)` to
   the table, and removes `onTableReset()`.
3. `DataTableComponent`'s generic `showReset`/`resetDisabled`/`resetClicked`
   capability may remain in the shared component (unused, opt-in, harmless
   to other reports) or be removed outright — see Open decisions.
4. Users have no explicit way to clear filters back to defaults; navigating
   away and back to the Dealer Ledger route (or a future report-level
   affordance) is the only way to restore the default state. This is an
   intentional simplification per this request — no replacement control is
   introduced by this spec.

## Acceptance criteria

- No "Reset" button appears anywhere on the Dealer Ledger page (not in the
  filter panel, not in the table header).
- Filters/checkboxes/date range still work via debounced auto-search; only
  the explicit clear-to-default action is removed.
- `dealer-ledger-table.component.spec.ts`/`dealer-ledger-list.component.spec.ts`
  are updated to drop assertions about the Reset button/wiring.

## Open decisions

- Whether to also delete `DataTableComponent`'s `showReset`/`resetDisabled`/
  `resetClicked` API (dead code once Dealer Ledger stops using it, per the
  project's "don't add unused capability" convention) or leave it in place
  in case another report adopts it soon — TBD, default assumption is to
  remove it, consistent with how `pageSizeOptions`/`onPageSizeChange` were
  deleted rather than left unused in
  `spec-table-remove-rows-visible.md`.
- Whether `DealerLedgerFilterComponent.resetFilters()` should also be
  deleted (fully dead with no caller) or kept as a documented
  programmatic-only capability — TBD, default assumption is to delete it
  along with its `reset` output, since nothing would call it.
