# Table — Reset Does Not Restart Pagination at Page 1

**Created:** 2026-09-16 17:39 IST

## Status

Implemented — decision (b) (public `resetPagination()` method via `viewChild`).

## Purpose

Clicking the table header's Reset control (per
`reset-in-table-header-16-09-2026-01_59_PM.md`) clears filters and re-fetches an
unfiltered result set, but the table's pagination does not correctly
restart — the reported symptom is "Reset is not adding the pagination
again." Root-caused below: `DataTableComponent` has no mechanism to detect
"the whole dataset was replaced" (as Reset does) versus "the same dataset
was just re-sorted/re-filtered in place" — it only ever *reduces* the
current page (a clamp, when the new page count is smaller), never resets
it back to page 1 on a wholesale data replacement.

## Root cause

- `DataTableComponent`'s only page-adjusting logic beyond explicit
  Prev/Next/page-number clicks is this effect:
  ```ts
  effect(() => {
    if (this.isServerPaginated()) return;
    const total = this.totalPages();
    if (this.currentPage() > total) {
      this.currentPage.set(total);
    }
  });
  ```
  This only fires when the *current* page number would now be out of
  range (e.g. was on page 4, new data only supports 2 pages) — it clamps
  down to the last valid page. It never resets to page 1 for any other
  case.
- When Dealer Ledger's Reset control fires
  (`DealerLedgerFilterComponent.resetFilters()` → `DealerLedgerListComponent.onReset()`
  → `DealerLedgerStore.reset()`), the store fetches a brand-new, unfiltered
  result set and replaces `data()` entirely. If the user was on, say, page 2
  of a small filtered result before Reset, and the unfiltered result set
  also has 2+ pages, the clamp effect never fires (current page is still
  "in range") — so the table silently stays on page 2 of the *new* data
  instead of restarting at page 1, which is the expected behavior for "the
  underlying result set was replaced," not merely re-paginated.
- More generally, `DataTableComponent` has no input/signal distinguishing
  "this is a fresh dataset (start over at page 1)" from "this is the same
  dataset, differently sorted/filtered (preserve position when still
  valid)" — every data change is treated identically, via the clamp-only
  effect.

## Scope

- `DataTableComponent`'s client-side pagination state (`currentPage`) —
  ensuring it deterministically restarts at page 1 whenever the consumer
  signals a wholesale dataset replacement (e.g. Reset), not just when the
  current page happens to fall out of range.
- `DealerLedgerTableComponent`/`DealerLedgerListComponent`'s wiring of the
  Reset action, to communicate "restart pagination" to the table.
- Out of scope: server-side pagination mode (`totalCount`/`page` inputs,
  per `spec-table-server-side-pagination.md`) — Dealer Ledger no longer
  uses it (`api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md`), and this
  spec is about the client-side pagination path specifically.

## Requirements

1. `DataTableComponent` gains a way to be told "reset pagination to page
   1" independent of the clamp-down effect — e.g. a `resetPageTrigger`
   input (any value change resets `currentPage` to 1) or a public method
   the consumer can call via a template reference/`viewChild`. Default
   assumption: an input the consumer increments/toggles on Reset (simplest,
   consistent with this codebase's existing input-driven patterns) — see
   Open decisions for the exact mechanism.
2. `DealerLedgerTableComponent` forwards this trigger, driven by its
   existing `reset` output's *source* event (the table header's Reset
   click) — i.e. clicking Reset both clears filters (existing behavior)
   and now explicitly resets the table to page 1.
3. The existing clamp-down effect (for organic dataset shrinkage — e.g.
   sorting/searching down to fewer rows) is unaffected — it continues to
   handle the "still on this dataset, but it got smaller" case.
4. This does not change server-side pagination mode's behavior at all
   (already governed entirely by the consumer's own `page` input in that
   mode).

## Acceptance criteria

- Navigate to page 2+ of the Dealer Ledger table (with enough rows loaded
  to have multiple pages), click Reset in the table header: the table
  shows page 1 of the newly-fetched, unfiltered result set — not
  whatever page number was previously active.
- Sorting or the debounced/Submit-driven search changing the row count
  while already on page 1 continues to work exactly as today (no
  regression to the existing clamp-down behavior).
- `data-table.component.spec.ts` gains a test: starting on page 2 of a
  dataset, triggering "reset pagination," then replacing `data` with a
  differently-sized dataset — the table shows page 1, not a clamped-down
  version of the old page number.

## Open decisions

- Exact mechanism for the "reset to page 1" signal: (a) a plain input
  (e.g. `resetPageTrigger: input<unknown>()`, watched via `effect()`,
  where the consumer passes a changing value — a counter, a new object
  reference, etc. — to trigger it), or (b) exposing a public
  `resetPagination()` method the consumer calls via `viewChild` (mirroring
  how `DealerLedgerListComponent` already calls
  `filter().resetFilters()` via `viewChild`) — default assumption is (b),
  a public method, since this codebase already uses the `viewChild`-method
  pattern for exactly this kind of one-shot consumer-triggered action
  (`resetFilters()`), rather than introducing a new "trigger via changing
  input value" convention.
