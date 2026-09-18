# All Reports — Spec: Dismissible/Auto-Dismissing Alerts + Hide Table When Empty

**Created:** 2026-09-18 12:23 IST

## Status

Proposed.

## Purpose

Two cross-cutting UX fixes, applicable to every report that has its own
error banner and result table — currently Dealer Ledger, Warranty Cost
Report, Warranty Reconciliation, and Parts Packing List (each independently
renders `@if (store.error(); as error) { <div class="*-list__error" role="alert"> ... }`,
confirmed via a grep across all four `*-list.component.html` files):

1. Every warning/error alert banner should have a close ("×") button, and
   should also auto-dismiss on its own after a few seconds — not stay on
   screen indefinitely until the user manually retries or navigates away.
2. When a search/report returns zero rows, the table should not render at
   all (not even its own empty-state message) — the whole result table
   disappears, the same way it's hidden entirely before the first
   search (hide-table-until-submit-17-09-2026-12_01_AM.md's existing
   `store.hasSearched()` gate), rather than showing an empty shell.

## Scope

- A shared, reusable alert/banner component (new — no such component
  exists yet; each report currently hand-rolls its own `<div role="alert">`
  markup) that accepts a message, renders a close button, and auto-dismisses
  after a fixed delay.
- Every report's own list page swaps its hand-rolled error `<div>` for this
  shared component.
- Every report's own list page's table-rendering condition changes from
  "show once `hasSearched()`" to "show once `hasSearched()` **and** there is
  at least one row" — an empty result set after search hides the table
  entirely instead of rendering `DataTableComponent`'s own empty-state
  message.
- Out of scope: changing what triggers an error in the first place, or the
  Retry action's behavior once clicked (only how/whether the banner itself
  disappears).

## Requirements

1. New shared component, e.g. `shared/ui/dismissible-alert/dismissible-alert.component.ts`:
   - Inputs: `message` (string), `autoDismissMs` (number, sensible default
     TBD — see Open decisions).
   - Output: `dismissed` (emitted when closed, whether by the × button or
     the auto-dismiss timer), so the consuming page can clear its own
     `store.error()`-backed state if needed.
   - Renders a close ("×") button (`aria-label="Dismiss"` or similar) and
     starts an internal timer on init that emits `dismissed` after
     `autoDismissMs`, clearing the timer if dismissed manually first.
   - Keeps `role="alert"` for accessibility, matching every current
     hand-rolled banner.
2. Each of the four report list pages (`dealer-ledger-list`,
   `warranty-cost-report-list`, `warranty-reconciliation-list`,
   `parts-packing-list-list`) replaces its own `<div class="*__error" role="alert">`
   block with this shared component, still wired to `store.error()`
   /`store.refresh()` (Retry stays a separate, explicit action — the alert
   dismissing does not itself retry).
3. Each of the four stores' `error` signal is cleared when the shared
   component emits `dismissed`, so a dismissed error doesn't reappear on
   the next unrelated render.
4. Each of the four report list pages' table-rendering condition changes
   from `@if (store.hasSearched())` to `@if (store.hasSearched() && store.data().length > 0)`
   (or equivalent) — after a search that returns zero rows, no table
   (header, toolbar, empty-state message, pagination footer) renders at
   all.

## Acceptance criteria

- Every report's alert banner shows a close button; clicking it removes
  the banner immediately.
- Every report's alert banner disappears on its own after the fixed delay
  if the user takes no action.
- After a search that returns zero matching rows, the report's table is
  completely absent from the page (not an empty-state message inside a
  rendered table shell).
- The table still renders normally once a search returns at least one row,
  and still stays hidden before the first search, unchanged from existing
  behavior.
- Each of the four reports' existing `*-list.component.spec.ts` files are
  updated for the new alert component and the empty-result hide-table
  behavior; a new spec covers the shared `DismissibleAlertComponent` itself
  (close button, auto-dismiss timer, `dismissed` output).
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

- Exact auto-dismiss delay (5s? 8s?) is unspecified — default assumption:
  a single shared constant (e.g. `5000`ms), consistent across every
  report, not configurable per-call unless a future report needs
  otherwise.
- Whether the shared alert component should also replace the Retry
  button's current plain `<button>` styling, or only wrap the message +
  close button, leaving each report's own Retry button next to it
  untouched — default assumption: only the message/close/auto-dismiss
  behavior is shared; each report keeps its own Retry button rendered
  alongside (not inside) the shared component, unchanged.
- Whether `DataTableComponent`'s own `emptyStateMessage`/empty-state
  rendering becomes entirely dead code once every consumer gates on row
  count, or should remain for some future consumer that still wants an
  empty-state shell — default assumption: leave `DataTableComponent`
  itself unchanged (it still supports an empty state if a future consumer
  wants it); this spec only changes what each report's *page* passes into
  its `@if`.
