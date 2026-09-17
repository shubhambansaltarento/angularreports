# App — Temporary Favicon (Bootstrap Icons Bicycle Glyph) and Page Title

**Created:** 2026-09-17 07:12 AM

## Status

Implemented.

## Purpose

1. Replace the app's placeholder Angular-CLI-default `favicon.ico`
   with Bootstrap Icons' `bicycle` glyph, as a temporary favicon until
   the real TVS logo asset is available (the user intends to supply
   that file directly later — this is an explicit interim choice, not
   the final branding).
2. Change the browser tab title from the generic "Reports" to
   "TVS Reports".

## Implementation

- `public/favicon.svg` — the Bootstrap Icons `bicycle.svg` glyph
  (`node_modules/bootstrap-icons/icons/bicycle.svg`), recolored to
  `#212529` (matching the app's established monochrome palette from
  `monochrome-redesign-and-column-picker-text-fix-17-09-2026-05_56_AM.md`)
  instead of `currentColor`, since a static favicon has no ambient
  text color to inherit.
- `src/index.html` — `<link rel="icon">` changed from
  `type="image/x-icon" href="favicon.ico"` to
  `type="image/svg+xml" href="favicon.svg"`; `<title>` changed from
  "Reports" to "TVS Reports".
- `public/favicon.ico` (the old Angular default) is left in place,
  unreferenced — not deleted, in case of a later rollback; safe to
  remove whenever the real logo replaces this temporary one.

## Scope

- Out of scope: any other branding/theming — this is a single-icon
  swap, not a broader design change.
- Follow-up (not part of this change): once the user provides the
  actual TVS logo file, replace `public/favicon.svg` (or add a
  PNG/ICO alongside it) with the real asset and update `index.html`
  accordingly — tracked as future work, not a re-opened item here.
