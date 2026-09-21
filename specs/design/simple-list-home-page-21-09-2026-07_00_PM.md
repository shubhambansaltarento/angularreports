# Design — Spec: Simple Top-to-Bottom Reports List, No Icons

**Created:** 21-09-2026 07:00 PM IST

## Status

Implemented.

## Purpose

Reports Home previously rendered a branded header ("TVS 🐎 Dealer Reports") and a responsive
grid of icon cards, one per report (`branded-icon-card-grid-redesign-18-09-2026-12_34_PM.md`).
The user asked for a much simpler page: a plain "TVS Dealer Reports" heading and every report
listed top-to-bottom, with no icon.

## Requirement

1. `reports-home.component.html`: replace the `<header>`'s brand spans (TVS/🐎/Dealer Reports)
   with a single `<h1>TVS Dealer Reports</h1>`.
2. Replace the `row-cols-*` Bootstrap card grid with a plain vertical list
   (`.reports-home__list` → `.reports-home__row` per report), each row just a link showing the
   report's title and description — no icon, no card chrome/shadow.
3. `reports-home.component.ts`: remove `REPORT_CARD_STYLE_BY_ID`/`DEFAULT_CARD_STYLE`/
   `cardStyle()` — no longer needed with icons gone.
4. `reports-home.component.scss`: replace the grid/card/icon rules with simple row styling — a
   bottom border per row, title in one weight, description muted beneath it.

## Acceptance criteria

- The header renders only "TVS Dealer Reports" as plain text — no icon/emoji.
- Every report in `REPORTS_CATALOG` renders as its own row, top to bottom, in catalog order.
- No report row has an icon of any kind.
