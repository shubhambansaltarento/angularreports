# Reports Home — Spec: Remove Goods Acknowledgement From the Reports List

**Created:** 21-09-2026 08:00 PM IST

## Status

Implemented.

## Purpose

Goods Acknowledgement should no longer appear as an entry on the Reports Home page's list of
reports (`REPORTS_CATALOG`, rendered top-to-bottom by
`simple-list-home-page-21-09-2026-07_00_PM.md`).

## Requirement

- `src/app/features/reports-home/reports.registry.ts`: remove the
  `GOODS_ACKNOWLEDGEMENT_REPORT_CONFIG` entry from `REPORTS_CATALOG`, and its now-unused
  import.
- The Goods Acknowledgement feature itself (route, page component, config file) is **not**
  deleted — only its listing on the home page is removed. Its route
  (`app.routes.ts`'s `GOODS_ACKNOWLEDGEMENT_FEATURE_PATH` lazy route) stays intact, so a direct
  deep link still works; it's simply no longer discoverable from the home page's list.

## Out of scope

- Deleting the Goods Acknowledgement feature folder, route, or any of its code — this spec only
  removes it from the home page's list of reports.

## Acceptance criteria

- Reports Home no longer shows a "Goods Acknowledgement" row.
- Every other report in `REPORTS_CATALOG` still renders, in the same order as before, minus
  Goods Acknowledgement.
- Navigating directly to Goods Acknowledgement's route still works (feature code unchanged).
