# Parts Packing List — Spec: Remove Card "Well" Background, Center-Align

**Created:** 2026-09-18 12:20 IST

## Status

Implemented.

## Purpose

Follow-up to
remove-section-labels-narrower-card-default-button-18-09-2026-12_19_PM.md:
drop the card's white background/border/shadow ("well" styling) entirely —
the filter panel now sits directly on the page background, no boxed
container — and center it horizontally on the page instead of sitting flush
left.

## Requirements

1. `.parts-packing-list-list__card` loses its `background`, `border`,
   `border-radius`, and `box-shadow` — it becomes a plain layout container
   (kept only for its `max-width`/flex/gap, i.e. `padding` may also go
   since there's no visible box left to pad).
2. The (now un-boxed) content is centered horizontally within the page —
   `margin: 0 auto` on the `max-width`-constrained container (or an
   equivalent centering approach), so it doesn't sit flush against the
   left edge.
3. The page title stays left-aligned *within* that centered container
   (only the container itself is centered on the page, not each line of
   text inside it) — matching the reference mockups' left-aligned title.
4. Breadcrumb, error banner, and table below remain unaffected/unboxed
   (they already were).

## Acceptance criteria

- No visible white box/border/shadow around the filter panel.
- The filter panel + title + Show Report button sit centered on the page
  horizontally, with equal whitespace on both sides at wide viewport
  widths.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

None — straightforward style removal/centering.
