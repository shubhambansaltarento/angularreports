# Dealer Ledger — Spec 24: Replace Debounced Auto-Search with an Explicit Submit Button

**Created:** 2026-09-16 16:54 IST

## Status

Proposed. Reverses the debounced auto-search behavior introduced by
`remove-actions-row-16-09-2026-01_52_PM.md`.

## Purpose

`remove-actions-row-16-09-2026-01_52_PM.md` removed the filter panel's explicit Search
button and replaced it with a debounced auto-search that fires a new data
API call on every field/checkbox change (Date From, Date To, and each
"Include Details" checkbox included). This is incorrect behavior — the API
must only be called when the user explicitly submits the filter criteria,
not on every keystroke/toggle. This spec reintroduces an explicit **Submit**
button and removes the debounced auto-search entirely.

## Scope

- Remove `DealerLedgerFilterComponent`'s debounced auto-search `effect()`
  (the one that watches field/checkbox changes and calls `searched.emit()`
  after a delay).
- Add a Submit button to the filter panel, visible below/alongside the
  fields, which triggers the search only when clicked.
- The six filter inputs — Dealer Code, Dealer Description, Company Code,
  Date From, Date To, and the "Include Details" checkbox group — remain
  freely editable/toggleable without triggering any API call; only clicking
  Submit sends the current combination of all of them to the data API.
- The summary cards (Total Debit, Total Credit, Closing Balance, Entries —
  `DealerLedgerSummaryCardsComponent`) are unaffected in their own
  rendering logic; they already just reflect `DealerLedgerStore.summary()`,
  which only updates when a request actually completes — per this spec,
  that now only happens on Submit (plus the initial config-driven load, and
  Reset), not on every field change.
- Out of scope: changing what the Reset control does (per
  `reset-in-table-header-16-09-2026-01_59_PM.md`, it lives in the table header and
  already triggers an explicit, one-shot reset+fetch — this spec doesn't
  touch that) or the export/PDF/table pagination behavior.

## Current implementation observations

- `DealerLedgerFilterComponent`'s constructor sets up an `effect()` that
  reads `currentValue()`/`isDateRangeInvalid()` and, after a
  `SEARCH_DEBOUNCE_MS` (400ms) delay, emits `searched` — this fires on
  every field/checkbox change once the initial run is skipped.
  This is exactly what causes an API call "on every selection."
- The reference screenshot shows Date From/Date To as plain editable date
  inputs and five "Include Details" checkboxes with no Submit control
  nearby — confirming there is currently no user-visible way to defer the
  search until they're done adjusting filters.
- `DealerLedgerListComponent.onSearch()` already exists and calls
  `store.search(...)` — no change needed there; it simply needs to be
  invoked by an explicit button click instead of the debounce effect.

## Requirements

1. `DealerLedgerFilterComponent` removes the debounced-auto-search
   `effect()` and its `SEARCH_DEBOUNCE_MS` constant/timer entirely.
2. A "Submit" button is added to the filter panel's template. Clicking it:
   - Reads the current values of all six fields (Dealer Code, Dealer
     Description, Company Code, Date From, Date To, checkbox selection).
   - Emits `searched` with that value, exactly like the removed debounce
     effect used to (same `currentValue()` shape), but only on click.
   - Is a no-op (does not emit) if the date range is currently invalid
     (`isDateRangeInvalid()`), mirroring the debounce effect's existing
     guard.
3. Editing any of the six fields does not, by itself, trigger any API call
   — only clicking Submit does.
4. The Submit button is clearly visible near the filter fields (placement
   TBD — see Open decisions), consistent with the existing pill/button
   visual language established for other controls in this feature.
5. `DealerLedgerListComponent`'s `onSearch()` wiring is unchanged — it
   still receives the same `DealerLedgerFilterValue` shape from `searched`.

## Acceptance criteria

- Changing Dealer Code/Description/Company Code/Date From/Date To, or
  toggling any "Include Details" checkbox, does not trigger a network
  request to the data API.
- Clicking Submit triggers exactly one data API request carrying the
  current values of all six fields.
- Total Debit/Total Credit/Closing Balance/Entries (summary cards) only
  update after a Submit click resolves (or the initial load/Reset) — never
  as a side effect of merely changing a filter field.
- An invalid date range (Date From after Date To) prevents Submit from
  emitting a search, with the existing inline error message still shown.
- `dealer-ledger-filter.component.spec.ts` is updated: the debounce-based
  tests are replaced with tests asserting Submit-triggered emission and
  no-emission-on-field-change.

## Open decisions

- Submit button placement and label — options: (a) inline at the end of
  the six-field row/Include Details row, (b) its own row below "Include
  Details," similar to the original pre-Spec-4 action row but with only
  this one button (Export/Reset remain elsewhere, per
  `reset-in-table-header-16-09-2026-01_59_PM`/table-header specs) — default assumption is (b), a single
  right-aligned "Submit" button on its own row below Include Details,
  mirroring the pill-button style already used elsewhere in this panel.
- Whether Submit should also be disabled while the date range is invalid
  (visually, via `[disabled]`) rather than just silently no-op — default
  assumption is yes, disable it, for clearer feedback than a silent no-op.
