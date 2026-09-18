# App — Favicon (Horse Icon) and "TVS Dealer Reports" Page Title

**Created:** 2026-09-18 12:40 IST

## Status

Implemented.

## Purpose

Match the browser tab's icon/title to the Reports Home page's new branded
header (branded-icon-card-grid-redesign-18-09-2026-12_34_PM.md, "TVS 🐎 Dealer
Reports"): a horse-mark favicon and a "TVS Dealer Reports" page title,
superseding the earlier temporary bicycle-glyph favicon/"TVS Reports" title
(favicon-bicycle-icon-17-09-2026-07_12_AM.md — that spec's file was never
actually present in this branch; this change starts fresh from the
Angular-CLI-default `favicon.ico` still in place).

## Implementation

- `public/favicon.svg` — a simple horse-silhouette SVG (hand-authored path,
  since Bootstrap Icons has no horse glyph), filled red (`#e21e26`) to
  match the Reports Home header's horse mark and the TVS brand red.
- `src/index.html`:
  - `<link rel="icon">` changed from `type="image/x-icon"
    href="favicon.ico"` to `type="image/svg+xml" href="favicon.svg"`.
  - `<title>` changed from "Reports" to "TVS Dealer Reports".
- `public/favicon.ico` (the Angular CLI default) is left in place,
  unreferenced — not deleted, in case of rollback.

## Scope

- Out of scope: any other branding/theming beyond the tab icon/title —
  this does not touch the Reports Home page itself (already covered by
  branded-icon-card-grid-redesign-18-09-2026-12_34_PM.md).

## Open decisions

- This horse silhouette is hand-authored, not a real TVS brand asset (same
  caveat as the Reports Home header's 🐎 emoji placeholder) — replace both
  with the real logo/horse-mark file once available.
