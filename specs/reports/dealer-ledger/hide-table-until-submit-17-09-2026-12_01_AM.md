# Dealer Ledger — Spec 29: Hide the Table Entirely Until Submit Is Clicked

**Created:** 2026-09-17

## Status

Implemented. `DealerLedgerStore.hasSearched` flips `true` as soon as a
request is issued (Requirement 1's "no skeleton before submit" reading
— resolves the Open decision in favor of request-issued, not
response-received, so the first fetch's own loading skeleton is visible
once revealed).

## Purpose

Spec 25 stopped the *automatic data fetch* on page load, but the table's
own header ("Dealer Ledger Entries", "0 records"), column headers, and
"No ledger entries match the current filters." empty-state body still
render immediately — before the user has ever clicked Submit. The
reported symptom: the full table skeleton (header bar, column row, empty
message, pagination footer) is visible with zero data, which reads as a
completed-but-empty search rather than "no search has been run yet."

Per this request: **until Submit is clicked, the table section (title,
column headers, empty-state body, footer) must not render at all.**
Only after the first Submit does the table (with its data, or its
genuine "no matches" empty state if the search legitimately returns zero
rows) appear.

## Root cause

- `DataTableComponent.isEmpty` (`data-table.component.ts:297`) is
  `!this.loading() && this.resolvedTotalCount() === 0` — true both
  "before any search has ever run" and "a real search ran and matched
  zero rows." The component has no way to distinguish these two cases;
  it only knows about `data`/`loading`, not whether a search has ever
  been submitted.
- `DealerLedgerListComponent`'s template
  (`dealer-ledger-list.component.html`) always renders
  `<app-dealer-ledger-table>` unconditionally — there is no
  "has the user submitted yet" gate at the list-page level either.
- `DealerLedgerStore` has no signal representing "has at least one
  search/fetch been requested" — `loading`/`data`/`error` alone cannot
  distinguish "never searched" (data: `[]`, loading: `false`) from
  "searched, zero matches" (also data: `[]`, loading: `false`).

## Scope

- `DealerLedgerStore` gains a new piece of state — e.g. `hasSearched`
  (or equivalent) — set the first time `search()`/`reset()` fetches, and
  exposed as a readonly signal. Never reset back to `false` once true
  (Reset still counts as "has searched," per no-data-until-submit-16-09-2026-05_01_PM's existing
  precedent that Reset performs a real fetch).
- `DealerLedgerListComponent`'s template gates the entire
  `<app-dealer-ledger-table>` element behind this signal (e.g.
  `@if (store.hasSearched()) { <app-dealer-ledger-table ... /> }`) —
  nothing in the table's own header/body/footer renders before the
  first Submit.
- Out of scope: `DataTableComponent` itself — this is a Dealer-Ledger-
  specific "not yet searched" concept, not a generic table capability;
  the shared table's existing `isEmpty`/empty-state behavior is
  unchanged and still applies for a genuine zero-row *result*.
- Out of scope: the filter panel, toolbar, and error banner — these
  continue to render before the first Submit exactly as today.

## Requirements

1. Before the first Submit (and before any Reset, which also performs a
   fetch), the Dealer Ledger page shows only the toolbar and filter
   panel — no table title, column headers, empty-state message, or
   pagination footer.
2. The first Submit click reveals the table, in whatever state its
   result warrants (populated, or a genuine "no matches" empty state if
   the filters legitimately match nothing).
3. Once revealed, the table stays visible for all subsequent
   Submit/Reset/error cycles on that page visit — it does not
   disappear again after the first reveal, even if a later search
   returns zero rows or errors.
4. A failed first-Submit fetch (`store.error()` set) still counts as
   "has searched" — the table area is not left hidden forever if the
   very first request fails; the existing error banner is shown instead
   (or alongside, per whatever the current error-banner/table layout
   already does).

## Acceptance criteria

- On page load, no "Dealer Ledger Entries" heading, column headers, or
  "No ledger entries match the current filters." text is present in the
  DOM.
- Clicking Submit (regardless of whether it returns 0 or more rows)
  makes the table appear, matching today's existing populated/empty
  rendering for that result.
- `dealer-ledger-list.component.spec.ts` gains tests: the table is
  absent before the first Submit, and present after.
- `dealer-ledger.store.spec.ts` (or store tests) gains a test for the
  new "has searched" signal transitioning to `true` on first
  `search()`/`reset()`/`load()` call and staying `true` thereafter.

## Open decisions

- Exact signal name/placement — default assumption: a `hasSearched`
  readonly signal on `DealerLedgerStore`, set to `true` inside
  `applyResponse()` (or right when a request is issued, if "has
  searched" should include the loading state) — resolve during
  implementation based on whether the loading skeleton itself should
  also be gated (see Requirement 1: no table skeleton before Submit
  means the loading state during the *first* fetch should also stay
  hidden, so `hasSearched` should likely flip `true` as soon as the
  first request is issued, not only once its response arrives, so the
  loading skeleton for the very first fetch can still be shown once
  revealed — needs confirmation against Requirement 1's literal "no
  skeleton before submit" wording versus "no skeleton before the first
  request exists at all").
