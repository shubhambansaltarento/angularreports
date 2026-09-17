# Dealer Ledger — Spec 4: Remove the Search/Reset/Export Row Below Include Details

**Created:** 2026-09-16 13:52 IST

## Status

Proposed.

## Scope

This document specifies removing the standalone Search / Reset / Export
button row that currently renders directly below the "Include Details"
checkbox group in the Dealer Ledger filter panel
(`dealer-ledger-filter.component.html`, `.dealer-ledger-filter__actions`).

## Purpose

`specs/table/spec-table-visual-redesign.md` gives the shared `DataTableComponent`
its own toolbar with a search input and an Export control. Once the Dealer
Ledger table shows that toolbar, the filter panel's own Search/Reset/Export
row directly underneath "Include Details" is visually and functionally
duplicative — two separate search boxes and two separate export entry
points on one page.

## Current implementation observations

- `DealerLedgerFilterComponent`'s Search button calls
  `DealerLedgerListComponent.onSearch()`, which maps the filter panel's full
  criteria (Dealer Code/Description/Company Code/Date Range/checkboxes) onto
  `DealerLedgerStore.search()` — a **server-side/store query**, re-fetching
  filtered data.
- `DataTableComponent`'s own search input (`onSearchInput`) is a
  **client-side substring filter** over whatever rows are already loaded
  (`filteredData()`) — it does not know about Dealer Code/Description/Company
  Code/Date Range/checkboxes, and cannot replace the filter panel's Search.
- `DataTableComponent`'s Export (`onExport`)/`exportAll` operates on
  currently loaded rows only, same feature as the filter panel's Export
  action (already unified per `specs/design/table/table-filter-export-integration.md`).
- So Export is a true duplicate today (both trigger the same underlying
  capability); Search is not a true duplicate — the table's search box
  filters loaded rows, the filter panel's Search re-queries the backend with
  structured criteria.

## Requirements

1. The `.dealer-ledger-filter__actions` row (Search, Reset, Export-format
   select, Export button) is removed from
   `dealer-ledger-filter.component.html`.
2. Export continues to be available from the table's own toolbar only (its
   existing Export menu, already wired to `ExportService` per the table
   spec) — the filter panel emits no separate export event.
3. Since the table's search box cannot perform the structured
   Dealer Code/Description/Company Code/Date Range/checkbox query, the
   filter panel's Search behavior is preserved but re-triggered
   automatically (debounced) whenever a filter field or checkbox changes,
   instead of requiring an explicit Search button click. This keeps
   structured search working with no visible action row.
4. Reset is preserved as a small, secondary control (e.g. a single "Reset
   filters" link/icon-button near "Include Details", not a full action row)
   so users can still clear filters back to the dealer-context defaults.
5. `DealerLedgerFilterComponent`'s public contract changes: the `searched`
   and `exported` outputs are removed (Export no longer originates here);
   `reset` is kept. A new debounced auto-search behavior replaces the
   explicit `searched` emit-on-click.

## Acceptance criteria

- No Search/Reset/Export button row appears below "Include Details".
- Changing any filter field or checkbox triggers a (debounced) search
  against the store, equivalent to today's explicit Search click.
- A Reset control remains available and clears filters/checkboxes back to
  defaults.
- Export happens only via the table's toolbar; exporting still respects the
  currently active filter criteria (rows the table has loaded), matching
  today's export behavior.
- `dealer-ledger-filter.component.spec.ts` and
  `dealer-ledger-list.component.spec.ts` are updated to reflect the removed
  action row and the new auto-search/reset-only contract.

## Open decisions

- Debounce duration for auto-search on filter change — TBD (e.g. 300–500ms,
  consistent with the table's own `SEARCH_DEBOUNCE_MS`).
- Exact placement/styling of the retained Reset control (inline with the
  "Include Details" legend vs. its own small row) — TBD.
- Whether date-range validation (`isDateRangeInvalid`) should suppress
  auto-search entirely while invalid (recommended: yes, matching today's
  guard on the Search button) — TBD confirmation.
