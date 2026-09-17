# Dealer Ledger — Spec 3: Page Padding

**Created:** 2026-09-16 13:46 IST

## Status

Proposed.

## Scope

This document specifies adding consistent outer padding around the Dealer
Ledger list page (`src/app/features/dealer-ledger/pages/dealer-ledger-list`),
so its content (toolbar, filters, summary cards, table) does not sit flush
against the browser/viewport edges.

## Current implementation observations

- `dealer-ledger-list.component.scss` sets `:host { display: block; }` and
  lays out its sections with `.dealer-ledger-list { display: flex;
  flex-direction: column; gap: 1rem; }` — no horizontal or vertical padding is
  applied to the page container itself.
- Child sections (toolbar, filter panel, summary cards, table) each manage
  their own internal spacing, but nothing currently reserves space between
  the page's content and the surrounding viewport/layout shell.

## Requirements

1. The Dealer Ledger list page's root container has padding on all sides
   (top, right, bottom, left), so its content is visually inset from the
   viewport/app-shell edges rather than flush against them.
2. Padding uses Bootstrap spacing utilities (`.p-*`) or a design-token/
   variable-driven value, per `specs/design/design.md`'s "Spacing" guidance —
   not a one-off hardcoded pixel value.
3. Padding remains usable at typical desktop widths and does not cause
   horizontal overflow/scrolling at phone width (~400px) — reduce padding at
   narrow widths if needed rather than keeping a fixed large value.
4. This is scoped to the Dealer Ledger list page only; other feature pages
   are not modified by this spec (though the same treatment may be proposed
   for them separately later).

## Acceptance criteria

- The Dealer Ledger list page's content has visible breathing room from the
  viewport edges on all sides at desktop widths.
- No horizontal scrollbar/content clipping is introduced at narrow (~400px)
  widths.
- Existing `dealer-ledger-list.component.spec.ts` DOM/structure assertions
  continue to pass.

## Open decisions

- Exact padding value/scale (e.g. Bootstrap `p-3`/`p-4` vs. a custom spacing
  token) — TBD pending the shared spacing-token decision tracked in
  `specs/design/design.md`.
- Whether this same page-padding treatment should be generalized to a shared
  page-shell/layout component so every report page gets it consistently,
  instead of being applied per-page — TBD.
