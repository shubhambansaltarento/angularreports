# Design — Spec: "Show Report" Button Color/Size Across All Reports

**Created:** 23-09-2026 03:00 PM IST

## Status

Implemented.

## Purpose

The "Show Report" button (or its equivalent Show-Report/Submit action) had three different
looks depending on the report: dark grey (`btn-secondary`, Dealer Ledger), opaque report blue
(`rgb(47, 92, 138)`, Parts Packing List/Warranty Cost Report), and a plain light grey
(`btn-outline-secondary`, Warranty Reconciliation). The user asked for a single, consistent
translucent blue — `rgba(47, 92, 138, 0.7411764706)`, the same value already used for
`.html-pdf-viewer__title`'s toolbar background (`standardize-report-blue-to-rgba-21-09-2026-04_00_PM.md`)
— with a small font size, across every report.

## Requirement

For each report's Show Report button:

- **Dealer Ledger** (`dealer-ledger-list.component`): drop `btn-secondary`; add
  `background-color`/`border-color: rgba(47, 92, 138, 0.7411764706)`, white text, and
  `font-size: 0.8125rem`. Hover darkens to `rgba(37, 74, 111, 0.7411764706)`.
- **Parts Packing List** (`parts-packing-list-list.component`): change its existing opaque
  `rgb(47, 92, 138)` background/border/hover to the translucent
  `rgba(47, 92, 138, 0.7411764706)` / `rgba(37, 74, 111, 0.7411764706)`, and add
  `font-size: 0.8125rem`.
- **Warranty Cost Report** (`warranty-cost-report-list.component`): same change as Parts
  Packing List — opaque → translucent, plus `font-size: 0.8125rem`.
- **Warranty Reconciliation** (`warranty-reconciliation-filter.component`, whose own
  `__submit-button` already had `font-size: 0.8125rem`): drop `btn-outline-secondary`; change
  its plain grey `#e9ecef`/`#dde1e4` background to the same translucent blue/hover pair, with
  white text.

## Acceptance criteria

- Every report's Show Report (or equivalent Submit) button renders the identical
  `rgba(47, 92, 138, 0.7411764706)` background with white text and `font-size: 0.8125rem`.
- No report's Show Report button uses `btn-secondary`/`btn-outline-secondary` or any other
  color.
