# Dealer Ledger — Date Range as a Single Line ("Date Range: From [picker] To [picker]")

**Created:** 2026-09-17 06:10 AM

## Status

Implemented (second attempt). The first attempt used `col-lg-4`/
`col-md-6`, which was too narrow and caused wrapping; this version
uses a full-width `col-12` field with `flex-wrap: nowrap` on both the
field itself and the inputs group, plus a fixed `min-width` on each
date input, so "Date Range   From [picker]   To [picker]" reliably
stays on one line.

## Purpose

Today, "Date From" and "Date To" render as two separate, independently
labeled fields (each with its own label above its own date-picker
input), placed side by side. Change this to a single unified control,
on one line: a single "Date Range" label, followed by "From" and its
date picker, then "To" and its date picker — all inline, e.g.:

```
Date Range   From [date picker]   To [date picker]
```

## Current implementation

- `ReportSearchBarComponent`'s template
  (`report-search-bar.component.html:75-83`):
  ```html
  <div class="report-search-bar__field col-6" ...>
    <label class="form-label" for="report-search-bar-date-from">Date From</label>
    <input id="report-search-bar-date-from" type="date" class="form-control" formControlName="dateFrom" />
  </div>

  <div class="report-search-bar__field col-6" ...>
    <label class="form-label" for="report-search-bar-date-to">Date To</label>
    <input id="report-search-bar-date-to" type="date" class="form-control" formControlName="dateTo" />
  </div>
  ```
  Each is its own `.report-search-bar__field` (label-above-input,
  matching every other field in this component), placed in adjacent
  Bootstrap grid columns — visually side by side today, but as two
  separate labeled boxes, not one combined "Date Range" line.
- `dateFrom`/`dateTo` are the same `FormControl`s as today
  (`ReportSearchBarFormControls`) — this is a presentation-only change,
  not a data-model change.
- `isDateRangeInvalid()`'s validation message ("Date From" must not be
  after "Date To") and its trigger logic are unaffected by this
  reshaping, per Scope below.

## Scope

- `report-search-bar.component.html`/`.scss` — replace the two
  separate `Date From`/`Date To` field blocks with one combined block:
  a single "Date Range" label, then inline "From"/`dateFrom` picker/
  "To"/`dateTo` picker, all on one line.
- Out of scope: the underlying `FormControl`s, `isDateRangeInvalid()`
  validation logic, `defaultDateRange()`
  (`dealer-ledger-default-date-range.ts`) prefill behavior — unchanged,
  this is purely a layout/label change.
- Out of scope: any other report currently using
  `ReportSearchBarComponent` (none exist yet besides Dealer Ledger,
  confirmed by search) — but since this is the shared component,
  implementation should keep the change generically reasonable rather
  than Dealer-Ledger-specific markup, consistent with the component's
  existing "domain-agnostic" design.

## Requirements

1. "Date From" and "Date To" no longer render as two separate labeled
   boxes — they render as one row: a "Date Range" label, then "From"
   next to its date-picker input, then "To" next to its date-picker
   input, all on a single line.
2. Both date-picker inputs remain independently focusable/editable
   native `<input type="date">` controls, functionally unchanged.
3. Each date input keeps an accessible name distinguishing it from the
   other (e.g. "From"/"To" as real `<label>` text associated via
   `for`/`id`, not just visual text) — the shared "Date Range" heading
   alone is not a sufficient accessible name for either individual
   input.
4. The existing "Date From must not be after Date To" validation
   message still appears in the same circumstances as today, in a
   layout that makes sense next to the new single-line control.
5. No change to the date range's default prefill value or to
   `isDateRangeInvalid()`'s logic.

## Acceptance criteria

- The Date Range control renders as one line: "Date Range" label,
  "From" + its picker, "To" + its picker — not two separate boxed
  fields.
- Typing/selecting a date in either picker still updates
  `dateFrom`/`dateTo` exactly as today (`report-search-bar.component.spec.ts`'s
  existing form-control tests continue to pass, updated only for any
  changed `id`/selector if needed).
- Setting Date From after Date To still shows the existing validation
  message.
- `report-search-bar.component.spec.ts` gains/updates a test asserting
  the single "Date Range" label text is present and both "From"/"To"
  inputs are independently identifiable (by `id`/accessible name) on
  one row.

## Open decisions

- Exact markup for "From"/"To" — as real `<label>` elements (each
  labeling its own input, satisfying Requirement 3 for free) vs. plain
  `<span>` text plus an `aria-label` on each input — default
  assumption: real `<label for="...">` elements for "From"/"To",
  since that's the simplest way to keep each input's accessible name
  distinct without extra `aria-label` bookkeeping.
- Whether "Date Range" is a `<label>`, `<legend>` (if wrapped in a
  `<fieldset>`), or a plain heading-like span — default assumption: a
  plain `<span>`/text label (not a form-bound `<label for>`, since it
  doesn't correspond to a single control) preceding the From/To pair,
  consistent with this component's existing lack of `<fieldset>`
  usage elsewhere.
