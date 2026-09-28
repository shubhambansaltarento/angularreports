# Shared Data Table — Spec: Lock the First and Last Columns; Middle Columns Freely Reorderable

**Created:** 28-09-2026 01:35 PM IST

## Status

Implemented. Middle columns are swapped by dragging one header onto another; the Columns panel's ↑/↓ buttons also work within the middle.

## Purpose

In every report's table, the **first and last columns must stay where they are**. Every column in between can change places with any other middle column, for example 2nd ↔ 4th, 3rd ↔ 5th, or 2nd → 4th.

"Middle" means every column except the first and last. For a 7-column table, columns 1 and 7 are locked, and columns 2 to 6 can all swap with each other.

Example for a 6-column table `A B C D E F`:

| Action                     | Result          | Allowed? |
| -------------------------- | --------------- | -------- |
| Swap 2nd and 4th (B ↔ D)   | `A D C B E F`   | Yes      |
| Swap 3rd and 5th (C ↔ E)   | `A B E D C F`   | Yes      |
| Move 2nd to 4th place      | `A C D B E F`   | Yes      |
| Move 1st anywhere (A)      | —               | No, locked |
| Move last anywhere (F)     | —               | No, locked |
| Move a middle column to 1st or last place | — | No, those slots are locked |

### Example (one table, same rule everywhere)

The rule is built once into the shared `DataTableComponent`, so every table that uses it behaves the same way. No report sets anything up. For example, a table with the columns `Dealer Code | Dealer City | Invoice Number | Delivery Number | Case Number | Part Number | Part Description | Quantity`:

- **Dealer Code** (first) and **Quantity** (last) are locked.
- The six columns in between can swap freely. For example Dealer City ↔ Delivery Number (2nd ↔ 4th), Invoice Number ↔ Case Number (3rd ↔ 5th), or Part Description moved up to 2nd.
- Nothing can move in front of Dealer Code or after Quantity.

Any other table follows the same rule with its own first and last columns.

### Scope

The change is made only in the shared `DataTableComponent` (`src/app/shared/ui/data-table/`) and its Columns panel, with no report-specific code. It therefore applies to every table built on that component. Today that is Dealer Ledger, Goods Acknowledgement, Parts Packing List, Warranty Reconciliation, and the search-only placeholder table (PQM, VOR Print, Warranty Labour Tax Invoice). The Warranty Cost Report is a printed statement, not the shared data table, so it is not affected.

## Current state

- Columns are reordered only from the toolbar's **Columns** panel (`DataTableColumnSettingsComponent`), using ↑ / ↓ buttons per column (`moveUp` / `moveDown` → `onMoveColumnUp` / `onMoveColumnDown`). Each click moves a column one place.
- **Any** column can move, including the first and last. ↑ is only disabled on the first row, ↓ only on the last.
- Each column also has a pin selector (Unpinned / Pin left / Pin right). Pinning a middle column sends it to the far left or far right, ahead of or after the first and last columns.
- Order, visibility, width and pin state are saved per `tableId` in local storage and restored on the next visit.
- Header drag-and-drop does not exist today.

## Requirements

1. **Locked columns.** The first and last columns the table shows **by default** (the `columns` input's order, skipping columns that are hidden by default) are locked. A hidden-by-default column is always a middle column, even if the user shows it later. Locked columns:
   - They always render first and last.
   - Always stay visible: their show/hide checkbox is disabled.
   - Can't be dragged: their headers aren't draggable, and nothing can be dropped on them.
   - Their ↑ and ↓ buttons in the Columns panel are disabled.
   - Show a lock icon next to their name in the Columns panel, and a "Locked column" tooltip on the header.
   - Keep any pin their own column definition gives them (for example a report that pins its first column so it stays visible while scrolling).
2. **Middle columns are freely reorderable** among themselves:
   - **Drag to swap:** drag a middle column's header and drop it on another middle column's header, and the two swap places (for example dropping the 2nd on the 4th gives `A D C B E F`). While dragging, the header being dragged is faded and the drop target has a dashed outline. Middle headers show a grab cursor and a "Drag onto another column to swap places" tooltip.
   - ↑ is disabled for the 2nd column (it can't move into the 1st slot), and ↓ is disabled for the second-to-last column (it can't move into the last slot).
   - Any middle column can reach any middle position, so every swap in the Purpose table is possible.
3. **No pinning from the Columns panel.** The table no longer shows the pin selector (`showPinControls` is `false`), because pinning a middle column would push it past a locked one. Any pin saved on a middle column from before this change is ignored. The reusable `DataTableColumnSettingsComponent` still supports pinning for other uses (`showPinControls` defaults to `true`).
4. **Saved order is corrected on load.** If a saved order from before this change has the first or last column somewhere else, the table puts them back in place when it loads. The saved relative order of the middle columns is kept.
5. **Restore Default** still resets everything to the report's default order, with the locked columns in place.
6. **Export** (Excel/PDF) uses the same column order the user sees, so the locked columns come first and last there too.
7. The locked columns are chosen automatically (first and last of the default order) with no per-report setup. A report can still opt out or pick different columns if that is ever needed (see Open decisions).
8. Sorting, search, pagination, hide/show of middle columns and column resizing are unchanged. Starting a column resize never turns into a column drag.

## Acceptance criteria

- In every listed report, the first and last columns cannot be moved from the Columns panel: their ↑/↓ and pin controls are disabled and marked locked.
- A middle column cannot be moved into the first or last position.
- In every table built on the shared component, the first column stays first and the last column stays last whatever the user does. This works without any report passing a new input.
- For the example table above, Dealer Code and Quantity stay locked, and Dealer City ↔ Delivery Number and Invoice Number ↔ Case Number can each be swapped.
- In a 6-column table, 2nd ↔ 4th and 3rd ↔ 5th can each be done by dragging headers, and the table and export reflect the new order.
- Dropping a middle column on a locked header, or dragging a locked header, changes nothing.
- A saved order with the first or last column moved (older local storage) loads with them back in place and the middle order kept.
- Restore Default returns the report's default order.
- Unit tests in `data-table.component.spec.ts` and `data-table-column-settings.component.spec.ts` cover the rules above. Full `ng test` and `ng build` pass.

## Decisions made

1. **How users reorder:** drag a header onto another to swap them, as asked. The Columns panel's ↑/↓ buttons are kept and limited to the middle columns.
2. **Locked is about position only:** locked columns don't become sticky when scrolling sideways, unless the report's own column definition pins them.
3. **Locked columns can't be hidden.**
4. **Pinning:** removed from the table's Columns panel (Requirement 3).
5. **Per-report override:** none. Every table locks its own first and last default-visible columns.
6. **Columns built from API data:** the lock follows the column order the table receives, so tables that build columns from the API's field order lock whatever comes first and last.

## Open decisions

None.
