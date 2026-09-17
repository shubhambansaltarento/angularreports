# Dealer Ledger — Spec 13: Include Details — Label Left, Checkboxes Right

**Created:** 2026-09-16 14:14 IST

## Status

Proposed. Refines `include-details-compact-single-line-16-09-2026-01_59_PM.md` and
`remove-include-details-background-16-09-2026-02_09_PM.md`.

## Scope

This document specifies the horizontal arrangement of the "Include Details"
row: the "Include Details" label sits at the far left, and the five
checkboxes ("With OE/SP/AC/EV/ACWSH Details") are pushed to the far right of
the same line, with space between them — matching the provided reference
image, where the label and the checkbox group sit at opposite ends of a
full-width row.

## Current implementation observations

- `.dealer-ledger-filter__checkbox-group` (per Spec 9/11) is
  `display: flex; flex-wrap: nowrap; align-items: center; gap: 0.75rem;`
  with no background/border (Spec 11) — the legend and all five checkboxes
  sit left-aligned, bunched together with a fixed gap, not spread across the
  row.
- The reference image shows "Include Details" at the left edge and the
  checkboxes at the right edge of the same full-width row, with empty space
  between them.

## Requirements

1. "Include Details" and the checkbox group occupy opposite ends of the same
   row (label far left, checkboxes far right), using the full available
   width of the filter panel.
2. The five checkboxes remain on a single line next to each other (their own
   internal spacing per Spec 9), only their position as a group moves to the
   row's right edge.
3. This remains a `<fieldset>`/`<legend>` pair for accessibility — only the
   layout (flex `justify-content: space-between`) changes, not the markup's
   semantic structure.
4. At narrow/phone widths, where the label and all five checkboxes cannot
   fit spread across one line, the row may wrap (label above, checkboxes
   below) or the checkbox group may scroll horizontally within its own
   bounded region — the page itself must not gain horizontal scroll.

## Acceptance criteria

- At desktop widths, "Include Details" appears at the left edge and the
  checkbox group appears at the right edge of the same row.
- The five checkboxes remain single-line and legible per Spec 9's sizing.
- No functional change to checkbox toggling/selection-count behavior.
- No page-level horizontal scrollbar is introduced at narrow widths.

## Open decisions

- None.
