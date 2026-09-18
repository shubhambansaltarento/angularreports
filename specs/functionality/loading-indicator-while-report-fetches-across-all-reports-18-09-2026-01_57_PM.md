# All Reports — Spec: Loading Indicator While the Report Fetches

**Created:** 2026-09-18 13:57 IST

## Status

Implemented.

## Purpose

Two related checks, requested together:

1. **Table stays hidden/cleared on landing until Submit** — verified
   already implemented and tested for all four reports (Dealer Ledger,
   Warranty Cost Report, Warranty Reconciliation, Parts Packing List):
   each page gates its table/viewer on
   `store.hasSearched() && store.data().length > 0` (Warranty Cost on
   `store.hasSearched() && store.statement()?.dealerGroups.length > 0`),
   and every store's `hasSearched`/data signal defaults to
   `false`/empty — confirmed via grep across all four `*-list.component.html`
   files; no code change needed for this part.
2. **No visible loading indicator while the Show Report/Submit click is
   in flight** — genuinely missing. `DataTableComponent` accepts a
   `loading` input (used by Dealer Ledger/Warranty Reconciliation/Parts
   Packing List) but the table itself is hidden until `hasSearched()`
   *and* at least one row exists, so its internal skeleton is invisible
   during the very first fetch or a refetch that returns zero rows —
   nothing tells the user a fetch is in progress. Warranty Cost Report
   has no table at all (it's a statement/viewer) and had no loading
   affordance whatsoever.

## Scope

- A new shared, reusable loading indicator, `shared/ui/loading-indicator/`
  (spinner + "Loading report..." text) — domain-agnostic, like every
  other `shared/ui/*` component.
- Each of the four report list pages renders it whenever `store.loading()`
  is `true`, and hides the table/viewer while it's showing (so a refetch
  doesn't show stale rows and a spinner at the same time).
- Out of scope: `DataTableComponent`'s own internal skeleton-row loading
  state (unchanged) — this is a page-level, above-the-table indicator, not
  a replacement for it.

## Requirements

1. New `LoadingIndicatorComponent`: a small spinner + "Loading report..."
   text, no inputs required (a `message` input with that default, for any
   future reuse with different copy).
2. Each of the four report list pages' template changes its table/viewer
   condition from `@if (store.hasSearched() && ...)` to a three-way
   branch: `@if (store.loading()) { <app-loading-indicator /> } @else if (store.hasSearched() && ...) { <!-- table/viewer --> }`.
3. No store changes — `loading()` already exists on every report's store
   and is already set `true` on fetch start / `false` on
   completion/error, per each store's existing `tap()`/`applyResponse()`
   logic.

## Acceptance criteria

- Clicking Show Report/Submit on any of the four reports immediately
  shows the loading indicator; it disappears and the table/viewer (or
  nothing, if zero rows) appears once the response arrives.
- The loading indicator and the table/viewer never render at the same
  time.
- A new spec covers `LoadingIndicatorComponent`; each report's own
  `*-list.component.spec.ts` gets a case asserting the indicator shows
  when `store.loading()` is `true` and the table/viewer is absent then.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

None.
