# Dealer Ledger — Spec 9: Include Details — Smaller Font, Single Line

**Created:** 2026-09-16 13:59 IST

## Status

Proposed.

## Scope

This document specifies two visual fixes to the "Include Details" checkbox
group in the Dealer Ledger filter panel
(`dealer-ledger-filter.component.html`/`.scss`,
`.dealer-ledger-filter__checkbox-group`):

1. The legend/label and checkbox option text render at a smaller font size —
   currently too large relative to the rest of the filter panel.
2. The legend and all five checkbox options ("With OE/SP/AC/EV/ACWSH
   Details") render on a single line, rather than wrapping across multiple
   lines.

## Current implementation observations

- `.dealer-ledger-filter__checkbox-group` uses `flex-wrap: wrap`, so at
  narrower widths the five checkbox options already wrap onto multiple
  lines; combined with the browser default `<legend>` font size (larger than
  body text, unstyled today), the whole block reads as oversized.
- No explicit `font-size` is set on `.dealer-ledger-filter__checkbox-group`,
  its `legend`, or `.dealer-ledger-filter__checkbox` today — sizing is
  whatever the browser/Bootstrap defaults produce.

## Requirements

1. The "Include Details" legend text and the five checkbox labels use a
   smaller, consistent font size (e.g. matching the rest of the filter
   panel's body text, not the browser's larger default `<legend>` size).
2. "Include Details" and all five checkbox options fit on a single
   horizontal line at typical desktop widths — `flex-wrap` is set to
   `nowrap` (or the container allows horizontal scroll/compresses spacing)
   rather than wrapping.
3. At narrow/phone widths (~400px), where five options plus the legend
   cannot realistically fit on one line without being unreadable, the
   container may scroll horizontally within its own bounded region rather
   than wrap — the page itself must not gain horizontal scroll.

## Acceptance criteria

- "Include Details" and its five checkboxes render at a visibly smaller,
  consistent font size than before.
- At desktop widths, the legend and all five checkboxes appear on one line.
- At phone widths, the row either fits (with tighter spacing) or scrolls
  horizontally within its own container, without breaking the page layout.
- No functional change to checkbox toggling/selection-count behavior.

## Open decisions

- Exact font size value (e.g. `0.8rem`/`0.85rem`, matching
  `.dealer-ledger-filter__checkbox-count`'s existing `0.8rem`) — TBD, default
  assumption is to align with that existing smaller size already used
  in the component for consistency.
- Whether narrow-width behavior is "horizontal scroll within the fieldset"
  or "allow wrap only below a specific breakpoint" — TBD.
