# Dealer Ledger — Spec 22: Include Details — Force Left Alignment (Fix Legend/Flex Stacking)

**Created:** 2026-09-16 16:08 IST

## Status

Proposed.

## Purpose

"Include Details" and its checkboxes are currently rendering stacked
vertically (legend on its own line, each "With X Details" checkbox on its
own line below), instead of the single left-aligned line intended by
`include-details-compact-single-line-16-09-2026-01_59_PM.md`/`include-details-spread-layout-16-09-2026-02_14_PM.md`
(spread was later reverted to a normal left-aligned gap — see the most
recent change to `.dealer-ledger-filter__checkbox-group`).

## Root cause (probable)

`.dealer-ledger-filter__checkbox-group` is a `<fieldset>` with
`display: flex`, and its `<legend>` is a direct child alongside a wrapper
`<div class="dealer-ledger-filter__checkbox-options">`. Several browsers
(notably Safari and older Chromium/Firefox versions) do **not** treat
`<legend>` as a normal flex item even when its parent `<fieldset>` has
`display: flex` — `<legend>` is special-cased to always render as its own
block-level line, pushing any flex/grid layout applied to the fieldset onto
a new line below it. This is a long-standing, well-documented CSS quirk
with `fieldset`/`legend` and flex/grid containers, not something fixable by
adjusting `flex-wrap`/`align-items` alone.

## Scope

- Restructure the "Include Details" markup/CSS so the label and checkboxes
  reliably render on one left-aligned line across browsers, without relying
  on `<legend>` participating in a flex layout.
- Preserve accessibility: the checkbox group must still be programmatically
  associated with a group label (e.g. via `<fieldset>`/`<legend>`, or
  `role="group"` + `aria-labelledby` if `<legend>` is dropped from the flex
  container entirely).
- Out of scope: any change to which checkboxes exist or their
  toggle/selection-count behavior (unchanged from
  `include-details-compact-single-line-16-09-2026-01_59_PM.md`).

## Requirements

1. "Include Details" (with its "(N selected)" suffix) and all five
   checkboxes render on a single line, left-aligned, at desktop widths —
   verified in at least Chrome and Safari (the browsers most affected by
   the legend/flex quirk).
2. The fix does not regress the compact font size
   (`include-details-compact-single-line-16-09-2026-01_59_PM.md`) or the removed
   background/border (`remove-include-details-background-16-09-2026-02_09_PM.md`).
3. Accessibility is preserved: the group's accessible name is still
   programmatically associated with its checkboxes (screen-reader
   testable), whichever markup approach is chosen (see Open decisions).
4. At narrow/phone widths, the existing overflow-x/wrap fallback behavior
   (per Spec 9) continues to apply once the base left-alignment bug is
   fixed.

## Acceptance criteria

- "Include Details (N selected)" and the five checkboxes appear on one
  line, left-aligned, with no vertical stacking, in Chrome and Safari.
- Checkbox toggle/selection-count behavior is unchanged.
- No accessibility regression: the checkbox group's label is still
  associated with it for assistive technology.

## Open decisions

- Markup approach: (a) keep `<fieldset>`/`<legend>` for semantics, but move
  the legend visually inline via `legend { float: left; }` (the classic fix
  for this exact quirk) rather than relying on flex; or (b) replace
  `<fieldset>`/`<legend>` with a plain `<div role="group" aria-labelledby="...">`
  and a `<span id="...">` label, which participates in flex normally with no
  special-casing — default assumption is (b), since it sidesteps the quirk
  entirely rather than patching around it, at the minor cost of losing the
  native `<fieldset>`/`<legend>` semantics (mitigated by explicit
  `role="group"`/`aria-labelledby`).
