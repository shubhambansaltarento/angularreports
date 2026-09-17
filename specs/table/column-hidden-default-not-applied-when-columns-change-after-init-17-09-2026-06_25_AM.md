# Table — A Column's `hidden` Default Is Locked In at First Render, Ignoring a Later `columns` Change; Wider Picker, Smaller Restore Default

**Created:** 2026-09-17 06:25 AM

## Status

Implemented — Open decision (a): a per-column `hiddenIsExplicit` flag
on `TableColumnState`, set only by `onToggleColumnVisibility()`, and
re-synced on every `columns()` change (not special-cased to "first
real response"). Popup widened to `min-width: 20rem`; Restore Default
reduced to `padding: 0.2rem 0.6rem; font-size: 0.8125rem;`.

## Purpose (2) — Wider Columns Popup, Smaller "Restore Default" Button

Two additional, purely visual refinements to the same Columns picker:

1. Increase the popup panel's width — its current width is too narrow
   for longer column names/controls (e.g. "Doc. Reference No.", the
   pin `<select>`) to sit comfortably.
2. "Restore Default" should render as a small button, matching the
   compact sizing used throughout the rest of this redesign — it
   currently has no reduced padding/font-size of its own (only
   `btn btn-sm btn-outline-secondary` plus `align-self: flex-start`,
   `data-table-column-settings.component.scss:61-63`), unlike the
   toolbar/pagination buttons already shrunk in
   `square-smaller-buttons-toolbar-order-and-cell-font-size-17-09-2026-06_00_AM.md`.

### Current implementation (2)

- `.data-table__column-menu-panel` (`data-table.component.scss:87-100`)
  sets `min-width: 10rem`; the actual rendered width is effectively
  driven by `app-data-table-column-settings`'s own `:host { min-width: 16rem; }`
  (`data-table-column-settings.component.scss:3-6`) — both are
  candidates for the width increase.
- `.data-table-column-settings__restore`
  (`data-table-column-settings.component.scss:61-63`) only sets
  `align-self: flex-start` — no padding/font-size reduction, unlike
  every other button already shrunk elsewhere in this redesign.

### Scope (2)

- `data-table-column-settings.component.scss`'s `:host` min-width (and/or
  `data-table.component.scss`'s `.data-table__column-menu-panel`
  min-width) — increased.
- `.data-table-column-settings__restore` — reduced padding/font-size,
  matching the sizing already applied to
  `.dealer-ledger-filter__submit-button`/`.data-table__pill-button`
  (`padding: 0.2rem 0.5rem`–`0.6rem`, `font-size: 0.8125rem`).
- Out of scope: the Export panel's width (not mentioned in this
  request) and every other button already addressed by prior specs.

### Requirements (2)

1. The Columns popup renders noticeably wider than today, comfortably
   fitting the longest column names and the pin dropdown without
   visual crowding.
2. "Restore Default" is visually small, consistent with every other
   button in the table/picker.
3. No functional change — column reordering/pin/visibility toggling
   and Restore Default's click behavior are unaffected.

### Acceptance criteria (2)

- The Columns popup is visibly wider than before.
- "Restore Default" appears small, matching the sizing of nearby
  buttons (up/down/pin) rather than standing out as larger.
- Existing `data-table-column-settings.component.spec.ts` tests
  (behavioral, class-selector-based) continue to pass unchanged.

### Open decisions (2)

- Exact widened value — default assumption: `min-width: 20rem` for the
  column-settings host (up from `16rem`), leaving the outer
  `.data-table__column-menu-panel`'s `10rem` as a floor (it's already
  smaller than the host's own min-width, so the host's value is what
  actually governs rendered width today).

## Purpose (1) — Async `effectiveColumns` Locking In the Wrong `hidden` Default

"Text Dec." and "Narration Veh. Description" render as checked/visible
in the Columns picker (and visible in the grid) even though the
backend's `effectiveColumns` marks both `isDefault: false`
(effective-columns-shape-change-17-09-2026-05_41_AM.md), which
`toDealerLedgerColumns()` correctly maps to `hidden: true`
(column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md). This
spec root-causes and fixes why that mapped `hidden: true` never
actually takes effect for a Dealer Ledger table that's already
rendered once with the fallback default columns.

## Root cause

- `DataTableComponent.ngOnInit()` (`data-table.component.ts:354-362`)
  builds this table's *entire* `columnState` (visibility, order, width,
  pin — one array, one time) from whatever `this.columns()` resolves
  to **at that exact moment**:
  ```ts
  ngOnInit(): void {
    const defaultColumnState = this.buildDefaultColumnState(this.columns());
    ...
    this.columnState.set(persisted ? this.reconcileColumnState(defaultColumnState, persisted) : defaultColumnState);
  }
  ```
  This runs once, synchronously, on the table's first change-detection
  pass — there is no `effect()` or other reactive mechanism that
  rebuilds `columnState` if `this.columns()` itself later resolves to a
  *different* set of column definitions (different `hidden` defaults
  in particular).
- `DealerLedgerTableComponent.columns` (`dealer-ledger-table.component.ts:48-51`)
  is:
  ```ts
  protected readonly columns = computed(() => {
    const effectiveColumns = this.effectiveColumns();
    return effectiveColumns ? toDealerLedgerColumns(effectiveColumns) : DEALER_LEDGER_DEFAULT_COLUMNS;
  });
  ```
  `effectiveColumns()` is `null` until the first `/data` response
  resolves (an async HTTP call, triggered by Submit). So at the moment
  `DataTableComponent.ngOnInit()` runs (synchronously, as soon as the
  table is first rendered — which per
  `hide-table-until-submit-17-09-2026-12_01_AM.md` is exactly when the
  first Submit fires, i.e. the moment the request is issued, not when
  it resolves), `columns()` is still `DEALER_LEDGER_DEFAULT_COLUMNS` —
  the fallback set, none of whose entries declare `hidden: true`. The
  table's `columnState` locks in `hidden: false` for every column,
  Text Dec./Narration included.
- Moments later, the real `/data` response resolves,
  `store.effectiveColumns()` updates, and `DealerLedgerTableComponent.columns()`
  recomputes to the backend-driven set (Text Dec./Narration now
  `hidden: true`) — but `DataTableComponent` never re-reads this new
  `columns()` value into `columnState`; it only ever merges `columns()`
  definitions into the *existing* `columnState` entries for
  width/pin/header (`visibleColumns()`, `data-table.component.ts:171-186`),
  never for `hidden`. The stale `hidden: false` locked in at `ngOnInit`
  persists indefinitely (and even gets written to `localStorage`, per
  the existing persistence `effect()`, further cementing it — though
  the versioned-storage-key fix from
  `column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md` doesn't
  help here, since this isn't stale *cross-session* state — it happens
  fresh, within the same session, every single time).
- This is a strictly more general version of the bug that spec already
  fixed (stale persisted state overriding a fresh default) — this one
  happens even with zero prior persisted state, purely because the
  *initial in-memory* default was captured before the real data arrived.

## Scope

- `DataTableComponent`'s column-state initialization/update logic — it
  needs to react to `columns()` changing after `ngOnInit`, not just
  read it once, at least for the `hidden` flag driven by each
  definition's own default (order/width/pin are legitimately
  user-owned once set, and shouldn't be silently reset by a later
  `columns()` change — see Open decisions for exactly how much should
  re-sync vs. stay user-owned).
- Out of scope: `toDealerLedgerColumns()`/`effectiveColumns` mapping
  itself — already correct, per
  effective-columns-shape-change-17-09-2026-05_41_AM.md.
- Out of scope: the versioned-storage-key fix — that remains correct
  and necessary for its own (different) scenario; this spec addresses
  a same-session, no-persistence-involved case.

## Requirements

1. When `columns()` later resolves to a definition for a column key
   that wasn't previously known (e.g. the fallback set didn't include
   it, or its `hidden` default differs from what was captured at
   `ngOnInit`), and the user has not already made an explicit visible/
   hidden choice for that specific column in this table instance, the
   column's `hidden` state reflects the *latest* `columns()` definition
   — not whatever was true at first render.
2. Dealer Ledger's Text Dec./Narration Veh. Description columns render
   unchecked/hidden by default on a normal Submit flow (fallback
   columns render briefly or not at all, then the real
   `effectiveColumns`-driven state applies correctly once the response
   arrives).
3. A column the user has explicitly toggled (via the picker) keeps
   that choice even if `columns()` later changes — this fix must not
   make every backend response silently override a user's manual
   show/hide toggle.
4. No regression to the existing clamp/order/persistence behavior for
   columns whose `hidden` default hasn't changed.

## Acceptance criteria

- Reproduced in a test: mount `DataTableComponent` with an initial
  `columns` set where a column is NOT `hidden`, then (via a signal
  input change, simulating the async `effectiveColumns` arriving)
  change `columns` to a set where that same column IS `hidden: true` —
  the column ends up hidden, not stuck visible.
- A column the user manually re-shows after that stays shown even if
  `columns()` changes again afterward (no fighting the user's explicit
  choice).
- `dealer-ledger-table.component.spec.ts`/`data-table.component.spec.ts`
  gains a regression test for the async-arriving-`effectiveColumns`
  scenario specifically (fallback columns first, real
  `isDefault`-driven columns moments later, on the same table
  instance).

## Open decisions

- How to distinguish "the user explicitly chose this column's
  visibility" from "this column's `hidden` is just whatever the
  current default says" — needed so Requirement 1 (re-sync a changed
  default) and Requirement 3 (respect a manual toggle) don't conflict.
  Options: (a) track a separate "user has overridden hidden for this
  key" flag per `TableColumnState` entry, set only by
  `onToggleColumnVisibility()`, and only let a `columns()` change
  update `hidden` for keys without that flag; (b) re-derive `hidden`
  from `columns()` on every change unconditionally, accepting that a
  manual toggle could be overridden by a subsequent `columns()` change
  (simpler, but risks Requirement 3 in reports whose `columns()`
  recomputes more than once per session, like Dealer Ledger's own
  Submit-triggered re-fetches) — default assumption: (a), an explicit
  per-column override flag, since it cleanly satisfies both
  requirements without guessing based on timing.
- Whether this re-sync should happen on every `columns()` change, or
  only the very first time a table transitions from having no
  `effectiveColumns` to having one (Dealer Ledger's specific shape) —
  default assumption: react to every `columns()` change generically
  (not special-cased to "first real response"), since `DataTableComponent`
  has no domain knowledge of Dealer Ledger's fallback/real-response
  distinction and shouldn't need to.
