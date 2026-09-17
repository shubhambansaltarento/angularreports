# Table — Column Picker/Export Panel Z-Index, Stale Default Visibility, and Export Scope

**Created:** 2026-09-17 05:50 AM

## Status

Implemented — Open decision resolved as (c), a versioned storage key
(`data-table:${tableId}:columns:v2`).

## Purpose

The shared table's header controls have two related panel-rendering
problems and one export-behavior problem, reported from the Dealer
Ledger screenshot:

1. Column names are not visible next to each checkbox in the Columns
   popup — only the checkboxes themselves are legible.
2. The Columns popup renders visually behind/underneath the table (its
   header row is visible on top of the popup) — its z-index is too low.
3. Columns are showing as checked/visible regardless of their
   `isDefault` flag (effective-columns-shape-change-17-09-2026-05_41_AM.md)
   — expected: only `isDefault: true` columns should be checked/shown
   by default; `isDefault: false` columns should start unchecked/hidden.
4. The Export popup has the identical z-index problem as the Columns
   popup — it too can render behind/underneath the table.
5. Export defaults to exporting only the current page of rows, not the
   full filtered/sorted dataset — the expected default is to export
   everything the current filters/search/sort matched, across all
   pages, not just what's currently visible on screen.

## Root cause

- **#5 (export scope):** `DataTableComponent.exportScope` defaults to
  `signal<ExportScope>('currentPage')` (`data-table.component.ts:154`),
  and `onExport()` (`data-table.component.ts:484-489`) reads
  `this.exportScope() === 'currentPage' ? this.pagedData() : this.sortedData()`
  — so unless the user manually opens the Export panel and switches the
  "Scope" `<select>` (`data-table.component.html:66-72`) from "Current
  page" to "All filtered rows" *every time*, an export silently only
  contains the page currently on screen. The "All filtered rows" option
  already exists and works correctly (`sortedData()` — full
  filtered/sorted result set) — this is purely a wrong default, not a
  missing capability.
- **#2/#4 (z-index) causes #1 (invisible names):** `.data-table__column-menu-panel`
  (`data-table.component.scss:83-97`) has `z-index: 10`. The CDK table
  (`CdkTableModule`) renders its own header row, which Angular CDK
  gives its own stacking context once any sticky behavior or the
  browser's own table layout establishes one — in practice the panel
  paints *behind* the table's header cells, which have opaque
  backgrounds. The native checkbox `<input>` still visually reads as
  "on top" in some browsers due to form-control rendering quirks, but
  the adjacent `<span class="form-check-label">{{ column.header }}</span>`
  text (`data-table-column-settings.component.html:23`) is obscured by
  the table header painted above it. This is a single root cause, not
  two separate bugs: raising the panel's z-index fixes both #1 and #2.
- **#3 (stale default visibility):** `DataTableComponent.ngOnInit()`
  (`data-table.component.ts:350-360`) builds
  `defaultColumnState = buildDefaultColumnState(this.columns())` (which
  correctly reads each `TableColumn.hidden` — itself set from
  `isDefault` per effective-columns-shape-change-17-09-2026-05_41_AM.md's
  `toDealerLedgerColumns()`) but then, in the browser, calls
  `readPersistedColumnState()` and — if anything was ever persisted to
  `localStorage` under this `tableId` from an *earlier* session (e.g.
  before this table ever had an `isDefault` concept, or from a
  differently-shaped backend response) — **`reconcileColumnState()`
  keeps the persisted `hidden` value for every column key that still
  exists**, only falling back to the fresh default for brand-new keys
  (`data-table.component.ts:605-617`). So a returning user (or any
  session that already opened this table once) has their old
  "everything visible" persisted state silently overriding the
  backend's `isDefault: false` for `textDec`/`vehicleNarration`, making
  the picker show everything checked regardless of what the backend
  just said. This is a real, easily-reproduced bug — not
  speculation — given `localStorage` persistence is unconditional and
  keyed only by `tableId`, with no awareness of "the backend's default
  visibility for this column changed since last time."

## Scope

- `data-table.component.scss` — raise both `.data-table__column-menu-panel`'s
  and `.data-table__export-menu-panel`'s `z-index` above whatever the
  CDK table's header stacking context resolves to.
- `data-table.component.ts` — `reconcileColumnState()` (or the call
  site in `ngOnInit()`) needs a way to let a freshly-changed backend
  `isDefault`/`hidden` default take precedence over a stale persisted
  value, at least for columns the persisted state doesn't already
  reflect a deliberate user choice for (see Open decisions — this is
  the trickiest part, since the whole point of persistence is to
  remember the user's own toggle).
- `data-table.component.ts` — `exportScope`'s initial value, changed
  from `'currentPage'` to `'all'`.
- Out of scope: `data-table-column-settings.component.html`'s label
  markup itself — it already renders `column.header` correctly; the
  fix is entirely about what obscures it (z-index) and what state
  drives `hidden` (persistence reconciliation), not the template.
- Out of scope: removing the "Current page" export option — the user
  can still explicitly choose it; only the *default* changes.

## Requirements

1. The column name renders legibly next to each checkbox in the
   picker, never obscured by the table underneath.
2. `.data-table__column-menu-panel` (and, for consistency,
   `.data-table__export-menu-panel`, which has the identical `z-index: 10`
   and the identical structural risk of rendering behind the table) has
   a `z-index` high enough to always paint above the table's own
   header/rows/sticky columns, regardless of scroll position.
3. On the *first* time a table's `effectiveColumns` response supplies
   `isDefault` values (i.e. nothing meaningful was persisted yet, or
   what's persisted was never driven by real `isDefault` data), a
   column with `isDefault: false` starts unchecked/hidden, and a column
   with `isDefault: true` starts checked/visible.
4. Once the user has explicitly toggled a column's visibility via the
   picker, that choice persists across reloads exactly as today — this
   spec does not regress the existing "remember the user's manual
   choice" behavior; it only fixes the case where the *backend's own
   default* was never actually respected due to older/unrelated
   persisted state silently taking precedence.
5. Exporting (any format) with no explicit scope change exports every
   row matching the current filters/search/sort — not just the rows on
   the currently-visible page.
6. The user can still explicitly select "Current page" from the Scope
   dropdown to export only the visible page, when that's actually what
   they want — this spec only changes the *default*, not the option's
   availability or behavior.

## Acceptance criteria

- Opening the Columns picker shows each column's name in full,
  legible, and not covered by the table underneath — including when
  the panel overlaps the table's sticky header.
- With a fresh (no persisted state) table, an `effectiveColumns`
  response containing `isDefault: false` for a column renders that
  column unchecked in the picker and hidden in the grid.
- `data-table-column-settings.component.spec.ts`/`data-table.component.spec.ts`
  gains a regression test confirming the picker's checkbox state
  matches `!column.hidden` and that `hidden` correctly reflects
  `isDefault: false` on first load.
- A test simulating stale persisted column state (all visible) followed
  by a response where the column definitions' `hidden` defaults have
  changed confirms the resolution chosen in the Open decision below.
- Opening the Export panel shows "All filtered rows" pre-selected in
  the Scope dropdown; clicking any export format button with no prior
  interaction with that dropdown exports every filtered/sorted row, not
  just the current page.
- `data-table.component.spec.ts` gains/updates a test asserting
  `onExport()`'s default scope exports `sortedData()` (all rows), not
  `pagedData()` (current page only), absent any explicit scope change.
- The Export panel is fully visible above the table, matching the
  Columns panel's fix.

## Open decisions

- **How to reconcile a changed backend default against stale persisted
  state** — options:
  (a) Persist a version/hash of the column definitions' own default
  `hidden` values alongside the column state; if it doesn't match the
  current definitions' hash, treat the persisted `hidden` values as
  stale and reset to the fresh defaults (preserves order/pin/width
  choices but not stale hidden flags) — most correct, moderate
  complexity.
  (b) Drop persistence of the `hidden` flag entirely for Dealer Ledger
  specifically (still persist order/width/pin), always deriving
  visibility fresh from `isDefault` every load — simplest, but the user
  loses their manual show/hide choice across reloads, which may not be
  acceptable per Requirement 4.
  (c) One-time invalidation: since this behavior is new, clear any
  existing `data-table:dealer-ledger:columns` persisted entry once
  (e.g. bump a version suffix in the storage key) so every current user
  starts fresh with correct `isDefault`-driven defaults, and normal
  persistence (including future manual toggles) resumes working as
  today from that point forward — simplest fix that satisfies both
  Requirement 3 (immediate) and Requirement 4 (going forward), at the
  cost of a one-time loss of any previously-made manual column choices.
  Default assumption: (c), since it's the lowest-risk fix that directly
  resolves the reported symptom without a lasting behavior change to
  persistence itself — confirm before implementing.
