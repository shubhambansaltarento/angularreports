# Dealer Ledger — Shorter Date Pickers, Grey-Filled "Show Report" Button

**Created:** 2026-09-17 06:18 AM

## Status

Implemented — Open decisions resolved as: light grey background
(`#e9ecef`, darkening to `#dde1e4` on hover) on `btn-outline-secondary`
rather than switching to `btn-secondary`; date pickers reduced to
`padding: 0.2rem 0.5rem; font-size: 0.8125rem;`.

## Purpose

Two refinements following
`date-range-label-grey-show-report-button-17-09-2026-06_15_AM.md`:

1. The Date From/Date To picker inputs are taller than needed — reduce
   their height.
2. The "Show Report" button currently has a white/transparent
   background (Bootstrap's `btn-outline-secondary` default, filled
   grey only on hover) — give it a grey background by default, not
   white.

## Current implementation

- The date-picker inputs (`report-search-bar.component.html:84,86`)
  use plain `class="form-control"` — Bootstrap's default (non-small)
  form-control sizing, `padding: 0.375rem 0.75rem` with normal
  line-height, taller than the compact sizing used elsewhere in this
  redesign (e.g. the shared table's own inputs/buttons, per
  `square-smaller-buttons-toolbar-order-and-cell-font-size-17-09-2026-06_00_AM.md`).
  No `.report-search-bar` rule currently overrides this for the date
  inputs specifically (only `.report-search-bar__date-range-inputs .form-control`
  sets `width`/`min-width`, not height/padding).
- The "Show Report" button
  (`dealer-ledger-filter.component.html:24`) is
  `class="dealer-ledger-filter__submit-button btn btn-sm btn-outline-secondary"`
  — Bootstrap's `btn-outline-secondary` renders a transparent/white
  background with a grey border and grey text by default, filling
  solid grey only on `:hover`/`:active`. Per this request, the
  *default* (non-hover) state should already have a grey background.

## Scope

- `report-search-bar.component.scss` — reduce the date-picker inputs'
  height (via smaller padding, or applying Bootstrap's
  `.form-control-sm` sizing) — scoped to
  `.report-search-bar__date-range-inputs input[type="date"]`
  specifically, not every `.form-control` in the component (Dealer
  Code/Description/Company Code inputs are unaffected, per this
  request being about "date pickers" only).
- `dealer-ledger-filter.component.html`/`.scss` — give
  `.dealer-ledger-filter__submit-button` a grey background by default
  (not just on hover) — either by switching to Bootstrap's filled
  `btn-secondary` (grey fill, white text) or by overriding
  `btn-outline-secondary`'s background directly with a light/medium
  grey and dark text, consistent with the monochrome palette
  established in `monochrome-redesign-and-column-picker-text-fix-17-09-2026-05_56_AM.md`
  (see Open decisions for exactly which grey/text-color pairing).
- Out of scope: any other button in the table/filter panel (Reset,
  Columns, Export, etc.) — only the "Show Report" button is called out
  in this request.

## Requirements

1. The Date From/Date To picker inputs render visibly shorter than
   today.
2. The "Show Report" button has a grey background in its normal
   (non-hover, non-disabled) state — not white/transparent.
3. The button's disabled state remains visually distinguishable (per
   Bootstrap's existing disabled styling, e.g. reduced opacity) from
   its enabled grey-background state.
4. No functional change — date input behavior (typing/selecting a
   date, `dateFrom`/`dateTo` binding) and Submit's click/disabled logic
   are unaffected.

## Acceptance criteria

- The Date From/Date To inputs are visibly shorter than the Dealer
  Code/Description/Company Code inputs (or than their own previous
  height) — a height reduction is visually confirmed.
- "Show Report" shows a grey background at rest, without needing to
  hover over it.
- Submit remains disabled exactly when
  `searchBar().isDateRangeInvalid()` is true; existing
  `dealer-ledger-filter.component.spec.ts` tests (which locate the
  button by `.dealer-ledger-filter__submit-button`, not text/class
  variant) continue to pass unchanged.

## Open decisions

- Exact grey shade/approach for "Show Report": (a) switch to
  Bootstrap's filled `btn-secondary` (its own default grey/white-text
  look), or (b) keep `btn-outline-secondary`'s grey border/dark text
  but add a custom light-grey `background` (e.g. `#e9ecef` or `#f0f0f0`,
  matching greys already used elsewhere in this redesign) so it reads
  as "grey-filled" without full Bootstrap `btn-secondary` styling —
  default assumption: (b), a light grey background with the existing
  dark border/text, since it stays visually consistent with the softer
  monochrome palette used throughout this redesign rather than
  Bootstrap's darker default `btn-secondary` grey.
- Exact reduced height for the date pickers — default assumption:
  match the shared table's own compact input sizing
  (`padding: 0.2rem 0.5rem`, per
  `square-smaller-buttons-toolbar-order-and-cell-font-size-17-09-2026-06_00_AM.md`'s
  `.data-table__pill-input`), applied only to the two date inputs.
