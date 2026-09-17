# Dealer Ledger — "Date Range" Label Alignment/Size, and a Small Grey "Show Report" Button

**Created:** 2026-09-17 06:15 AM

## Status

Implemented.

## Purpose

Three refinements following
`date-range-single-line-17-09-2026-06_10_AM.md`:

1. The "Date Range" label is too large relative to "From"/"To" and
   sits slightly above the date pickers instead of level with them —
   decrease its font size and add enough top margin/alignment so it
   lines up with the pickers.
2. The Submit button (Dealer Ledger's filter panel) should be smaller
   and use the monochrome grey/white default look — no colored
   ("primary" blue) button — consistent with
   `monochrome-redesign-and-column-picker-text-fix-17-09-2026-05_56_AM.md`'s
   table-wide monochrome direction.
3. Rename the button's label from "Submit" to "Show Report".

## Current implementation

- `.report-search-bar__date-range-label` (`report-search-bar.component.scss:56-59`)
  has no explicit `font-size` — it inherits Bootstrap's `.form-label`
  class size (from the `class="form-label report-search-bar__date-range-label"`
  in the template), which is larger than the `0.875rem` used by the
  adjacent "From"/"To" part-labels
  (`.report-search-bar__date-range-part-label`,
  `report-search-bar.component.scss:66-71`). The row container
  (`.report-search-bar__date-range { align-items: center; }`) centers
  items by their box height, but `.form-label`'s own margin/line-height
  (Bootstrap's default `margin-bottom: 0.5rem` intended for a
  label-above-input layout, not this inline one) throws off vertical
  alignment relative to the pickers.
- The Submit button
  (`dealer-ledger-filter.component.html:22-29`) is
  `class="dealer-ledger-filter__submit-button btn btn-sm btn-primary"`,
  labeled "Submit" — Bootstrap's blue "primary" variant, already
  `btn-sm` but with no further size reduction; `.dealer-ledger-filter__submit-button`
  (`dealer-ledger-filter.component.scss:50-52`) only sets
  `border-radius: 0`.
- `DealerLedgerFilterComponent.onSubmit()` (`dealer-ledger-filter.component.ts`)
  is the click handler — its name/behavior is a separate concern from
  the button's visible label text, per Scope below.

## Scope

- `report-search-bar.component.scss` — reduce
  `.report-search-bar__date-range-label`'s font size (roughly matching
  or slightly larger than the `0.875rem` "From"/"To" part-labels) and
  correct its vertical alignment (remove/override the inherited
  `.form-label` margin, add whatever top margin/line-height is needed
  so it visually sits level with the date pickers).
- `dealer-ledger-filter.component.html`/`.scss` — change the Submit
  button from `btn-primary` to a grey/monochrome variant (e.g.
  `btn-outline-secondary`, matching every button in the shared table
  per the monochrome spec), reduce its size further than the current
  `btn-sm` baseline, and change its visible label text from "Submit"
  to "Show Report".
- Out of scope: Submit's disabled state logic
  (`[disabled]="searchBar().isDateRangeInvalid()"`), its click handler
  (`onSubmit()`), and the handler/method's own internal name — only
  the button's visible label text changes, not the method name or any
  internal identifier.
- Out of scope: the "Include Details" checkboxes and Reset control
  (table header) — not mentioned in this request.

## Requirements

1. "Date Range"'s label text is visibly smaller than today (closer to
   the "From"/"To" part-label size) and vertically level with the
   date-picker inputs on the same line — not sitting above them.
2. The Submit button is visibly smaller than its current size.
3. The Submit button uses only grey/white — no blue/colored variant —
   matching the rest of the monochrome-redesigned table controls.
4. The button's visible text reads "Show Report" instead of "Submit".
5. No functional change — Submit's disabled-when-invalid-date-range
   behavior and click handling are unaffected; only the label text and
   visual styling change, not the method name (`onSubmit()`) or any
   other identifier.

## Acceptance criteria

- "Date Range" renders at a smaller font size, level with the "From"/
  "To" pickers on the same row (no visible vertical offset).
- The Submit button is smaller than before, grey/white (no blue), and
  reads "Show Report" instead of "Submit".
- Submit remains disabled exactly when
  `searchBar().isDateRangeInvalid()` is true, and clicking it while
  enabled still calls `onSubmit()` — `dealer-ledger-filter.component.spec.ts`'s
  existing behavioral tests continue to pass, updated only where they
  assert the old "Submit" button text or `btn-primary` class.

## Open decisions

- Exact reduced font size for "Date Range" — default assumption:
  `0.8125rem` (matching the table's own compact label sizing
  established in the monochrome/font-size specs), with `margin: 0` and
  a small `margin-top` (e.g. `0.1rem`–`0.15rem`) to visually
  center it against the pickers' height — to be confirmed visually
  during implementation.
- Exact Submit button sizing — default assumption: keep `btn-sm` but
  reduce `.dealer-ledger-filter__submit-button`'s own padding/font-size
  further (e.g. `padding: 0.2rem 0.6rem; font-size: 0.8125rem;`),
  matching the shared table's own reduced button sizing from
  `square-smaller-buttons-toolbar-order-and-cell-font-size-17-09-2026-06_00_AM.md`.
