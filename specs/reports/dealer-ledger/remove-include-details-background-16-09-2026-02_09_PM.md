# Dealer Ledger — Spec 11: Remove Include Details Background Color

**Created:** 2026-09-16 14:09 IST

## Status

Proposed.

## Scope

This document specifies removing the card-style background/border treatment
from the "Include Details" checkbox group
(`dealer-ledger-filter.component.scss`, `.dealer-ledger-filter__checkbox-group`),
introduced by `match-table-design-16-09-2026-01_52_PM.md`.

## Current implementation observations

- `.dealer-ledger-filter__checkbox-group` currently sets
  `background: #fafbff;` and `border: 1px solid #e0e0e0; border-radius: 12px;`
  around the legend and checkboxes.

## Requirements

1. The "Include Details" checkbox group no longer has a background fill.
2. The border/rounded-card treatment is also removed, so the checkboxes sit
   directly on the page background like plain form content, not inside a
   visually distinct card.
3. The existing compact sizing (`font-size: 0.8rem`, `flex-wrap: nowrap`,
   single-line layout) from `include-details-compact-single-line-16-09-2026-01_59_PM.md`
   is unaffected — only the background/border/card styling is removed.

## Acceptance criteria

- "Include Details" renders with no background color or border box around
  it.
- Font size and single-line layout remain as specified in Spec 9.
- No functional change to checkbox toggling/selection-count behavior.

## Open decisions

- None.
