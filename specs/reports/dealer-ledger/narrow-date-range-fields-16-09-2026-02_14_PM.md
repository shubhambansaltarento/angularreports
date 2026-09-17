# Dealer Ledger — Spec 14: Narrower Date From / Date To Fields

**Created:** 2026-09-16 14:14 IST

## Status

Proposed.

## Scope

This document specifies reducing the width of the Date From/Date To fields
in the Dealer Ledger filter panel, which currently take up half the row
width each (per `single-line-identity-fields-16-09-2026-01_59_PM.md`'s `col-md-6`/`col-6`
split) — wider than a date value needs.

## Current implementation observations

- `ReportSearchBarComponent`'s `stacked` layout gives Date From and Date To
  each `col-md-6` (half the row), so together they fill the entire row width
  even though a `<input type="date">` value only needs a small fixed width.

## Requirements

1. Date From and Date To render narrower than the current half-row split —
   sized to fit a date value comfortably, not stretched to fill available
   row width.
2. Date From and Date To remain on the same row, next to each other (per
   `single-line-identity-fields-16-09-2026-01_59_PM.md`), just narrower — leaving unused
   space in the row rather than stretching to fill it.
3. At narrow/phone widths, the fields may still take a wider proportion (or
   full width) if needed for usability/touch targets — this narrowing
   applies primarily at desktop/tablet widths.

## Acceptance criteria

- Date From and Date To visibly take up noticeably less horizontal space
  than before, sitting close together rather than stretched across the row.
- Both fields remain usable and their labels stay associated correctly.
- No change to date-range validation behavior
  (`isDateRangeInvalid`)/auto-search debounce.

## Open decisions

- Exact width (e.g. `col-md-3`/`col-md-2` vs. a fixed `max-width` in
  rem/px) — TBD, default assumption is a Bootstrap column narrower than
  half (e.g. `col-md-3` each) rather than a hardcoded pixel width, staying
  consistent with the rest of the grid-based layout.
