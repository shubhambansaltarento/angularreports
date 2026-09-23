# Parts Packing List — Spec: Invoice/Delivery Number Inputs Match the Date Inputs' Height

**Created:** 23-09-2026 02:30 PM IST

## Status

Implemented.

## Purpose

Even after `fields-aligned-in-one-line-23-09-2026-02_00_PM.md` unified the label-to-input gap,
the Invoice Number/Delivery Number inputs still sat slightly higher than Date From/Date To's
inputs. A native `<input type="date">` renders a few pixels taller than a plain text input with
identical padding/font-size, because the browser's own calendar-picker control adds its own
height on top of the CSS box model — matching padding alone isn't enough.

## Requirement

- `TypeaheadInputComponent`'s compact input (`.typeahead-input--compact input`) gets an
  explicit `height: 2rem` plus `margin-top: 0.5rem` — the height alone still left it sitting
  slightly above the date inputs' baseline; the `margin-top` was confirmed against the real
  rendered page in DevTools before being applied here. `[compact]="true"` is only used by Parts
  Packing List today, so this doesn't affect any other report.
- `parts-packing-list-filter.component.scss`'s `.form-control-sm` (Date From/Date To's class)
  gets a matching explicit `height: 2rem`.

## Acceptance criteria

- Invoice Number, Delivery Number, Date From, and Date To inputs all render at the same height
  and sit flush on the same line, with the "Show Report" button aligned to their shared bottom
  edge (via the existing `align-items: flex-end` on the filter row).
