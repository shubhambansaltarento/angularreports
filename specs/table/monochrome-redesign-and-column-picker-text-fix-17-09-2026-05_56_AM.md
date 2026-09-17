# Table — Monochrome (Black/Grey/White) Redesign, Small Buttons, and Invisible Column-Picker Text

**Created:** 2026-09-17 05:56 AM

## Status

Implemented.

## Purpose

Three related visual changes to the shared `DataTableComponent`:

1. The table's overall design should use only black, grey, and white —
   no color accents anywhere (toolbar, active page number, row hover,
   export buttons, etc.).
2. Every button in the table should be small and use only the
   grey/white default look — no colored button variants (e.g. no blue
   "primary" buttons).
3. Opening the Columns picker shows checkboxes with no visible column
   name text next to them — the text is there, but rendered in white,
   which is illegible against the picker's white background.

## Root cause

- **#3 (invisible column-picker text)** is a CSS inheritance bug:
  `.data-table__toolbar` (`data-table.component.scss:16-25`) sets
  `color: #fff` for its entire subtree (to make the blue/purple
  gradient header's own title/count/pill-button text readable). The
  Columns picker panel (`.data-table__column-menu-panel`) is rendered
  as a DOM descendant of `.data-table__toolbar-actions`, which is
  itself inside `.data-table__toolbar` — so despite the panel having
  its own opaque white background
  (`.data-table__column-menu-panel { background: #fff; ... }`), it
  never overrides `color`, and the column name
  (`<span class="form-check-label">{{ column.header }}</span>` in
  `data-table-column-settings.component.html:23`) inherits the
  ancestor's white text color, becoming invisible on the white panel.
  This is the same structural risk documented in
  `column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md` for
  z-index (a popup nested inside a colored, opaque toolbar), just
  manifesting as a color problem instead of a stacking problem.
- **#1/#2 (color accents)** — every non-monochrome value currently in
  `data-table.component.scss`/the template's Bootstrap classes:
  - Toolbar background: `linear-gradient(135deg, #5b7cf7 0%, #6d5bf7 100%)` (blue/purple).
  - Toolbar pill input/buttons: white-on-transparent styling designed
    specifically for that colored toolbar (`rgba(255,255,255,...)` throughout).
  - Row hover / even-row tint: `#fafbff` / `#f0f4ff` (pale blue).
  - Pagination hover: `#f0f4ff` (pale blue).
  - Active page number: `background: #5b6cf7; border-color: #5b6cf7; color: #fff;` (blue).
  - Export format buttons: `class="btn btn-sm btn-primary"` in
    `data-table.component.html:74` — Bootstrap's blue "primary" variant.
  - "Restore Default" link: `class="... btn btn-link ..."` in
    `data-table-column-settings.component.html:60` — Bootstrap's blue
    link-text color.
  - Every other button (`.data-table__pill-button`, column-settings'
    up/down buttons, "Clear search") already uses `btn-outline-secondary`,
    which is Bootstrap's grey outline variant — already
    monochrome-compatible, and already `btn-sm` (small) — no change
    needed for those specific buttons beyond removing the white-text
    overrides tailored to the (soon removed) colored toolbar.

## Scope

- `data-table.component.scss` — replace every blue/purple color value
  (toolbar gradient, pill input/button white-on-color styling, row
  hover/even tint, pagination hover, active page number) with a
  black/grey/white palette.
- `data-table.component.html` — change the export format buttons
  (`btn-primary` → a grey/white variant, e.g. `btn-outline-secondary`
  to match every other button in the table) and confirm every button
  is `btn-sm`.
- `data-table-column-settings.component.html`/`.scss` — change
  "Restore Default" (`btn-link` → a grey/monochrome equivalent, e.g.
  `btn-outline-secondary btn-sm` or a plain grey text button) and fix
  the column-name text color (either by giving the picker panel its
  own explicit `color` that isn't inherited from the toolbar, or —
  better — by the toolbar no longer setting a page-wide white
  `color` once it's no longer a colored background).
- Out of scope: any change to the table's layout/structure (columns,
  pagination mechanics, sorting, selection) — this is a visual/color
  change only.
- Out of scope: other components' styling (filter panel, summary
  cards, etc.) — scoped to the shared `DataTableComponent` and its
  `column-settings` sub-component only, per the request ("the table").

## Requirements

1. The table toolbar (title, count, search, Columns/Export/Reset
   buttons) uses a light grey or white background with dark grey/black
   text — no blue/purple gradient.
2. Every button in the table (toolbar pill buttons, column-settings
   up/down/pin controls, Restore Default, export format buttons, Clear
   search) is small (`btn-sm`, consistent with the existing sizing) and
   uses only grey/white — no Bootstrap `-primary`/`-link`/other colored
   variant classes remain.
3. Row hover, even-row striping, and pagination hover use a neutral
   light grey instead of the current pale blue.
4. The active page number uses a dark grey/black background with white
   text (or the inverse), not blue.
5. Opening the Columns picker (and the Export panel, which has the
   same nested-in-toolbar structure) shows every label in legible dark
   text against its white background, regardless of the toolbar's own
   color scheme — fixed at the root cause (the inherited `color`), not
   by patching every individual popup's text color as a workaround.
6. No functional behavior changes — this is styling only.

## Acceptance criteria

- Visually inspecting the table: no blue, purple, or any other hue is
  present anywhere in its toolbar, rows, pagination, or popups — only
  black, white, and shades of grey.
- Every button in the table (toolbar and popups) is visually small and
  styled identically in terms of color (grey border/text on white, or
  the equivalent monochrome default) — no button stands out as
  "colored" relative to the others.
- Opening the Columns picker shows every column name clearly legible.
- Opening the Export panel (same structural risk) shows its "Scope"
  label and format button labels clearly legible too — a design review
  should confirm nothing else nested in the toolbar has the same
  inherited-white-text problem.
- Existing `data-table.component.spec.ts`/`data-table-column-settings.component.spec.ts`
  tests (behavioral, not visual) continue to pass unchanged — no
  functional regression from a purely visual change.

## Open decisions

- Exact grey values (e.g. Bootstrap's default secondary-grey palette
  vs. custom hex values) — default assumption: reuse Bootstrap's
  existing `btn-outline-secondary`/neutral greys already used elsewhere
  in the table (`#d0d0d0`, `#e0e0e0`, `#eee`, `#fafafa`, `#555`, `#666`,
  `#999`) rather than introducing a new palette, for visual consistency
  with what's already there.
- Whether the toolbar keeps a subtle grey background or goes fully
  white with just a border/shadow for separation — default assumption:
  a light grey background (e.g. `#f5f5f5`/`#fafafa`, matching the
  table header row's existing `#fafafa`) with dark text, for enough
  contrast against the white page/card background without introducing
  a new dark app-wide theme.
