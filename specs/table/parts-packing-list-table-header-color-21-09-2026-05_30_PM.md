# Shared Data Table — Spec: Per-Report Table Header Color Override

**Created:** 21-09-2026 05:30 PM IST

## Status

Implemented.

## Purpose

The shared `DataTableComponent`'s header row uses an opaque `rgb(47, 92, 138)`
(`opaque-table-header-blue-21-09-2026-04_30_PM.md`). The user asked for Parts Packing List's
table header specifically to use a distinct color: `rgba(47, 92, 138, 0.7411764706)` — the
original translucent value, before it was made opaque everywhere else.

## Requirement

1. `data-table.component.scss`: introduce a `--data-table-header-color` CSS custom property on
   `:host`, defaulting to `rgb(47, 92, 138)` (the existing opaque color). Both header-background
   rules (`.data-table__table th` and `.data-table__table th.cdk-table-sticky`) read
   `background-color: var(--data-table-header-color)` instead of the literal color, so any
   consumer can override it.
2. `parts-packing-list-table.component.scss`: sets
   `--data-table-header-color: rgba(47, 92, 138, 0.7411764706)` on its own `:host` — custom
   properties inherit through the DOM regardless of Angular's view encapsulation, so this
   overrides the default for the `<app-data-table>` it wraps without touching the shared
   component's own styles.
3. No other report's table changes — every other consumer of `DataTableComponent` keeps the
   opaque default, since none of them set this property.

## Acceptance criteria

- Parts Packing List's table header renders `rgba(47, 92, 138, 0.7411764706)` — visibly more
  translucent than every other report's opaque table header.
- Every other report using the shared `DataTableComponent` is unaffected.
