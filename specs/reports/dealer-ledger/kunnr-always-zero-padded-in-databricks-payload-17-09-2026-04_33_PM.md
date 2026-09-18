# Dealer Ledger — Spec: `kunnr` Always Zero-Padded in Databricks Payload

**Created:** 2026-09-17 16:33 IST

## Status

Implemented.

## Purpose

The real `fetchDatabricksdata` endpoint's `kunnr` parameter expects a
10-digit, zero-padded SAP customer number (e.g. `0000010015`), but the
filter panel's Dealer Code field holds the plain, unpadded code (e.g.
`10015`) — sourced from config/dealer context, or typed by whatever the user
enters. Since the "Show Report" button now always submits the live filter
form (single-show-report-button-replaces-embedded-submit-17-09-2026-04_31_PM.md),
the zero-padding must happen once, centrally, at the API-call boundary — not
be the caller's responsibility.

## Requirements

1. `DealerLedgerService.toDatabricksParams()` always prefixes
   `filters.dealerCode` with a `00000` constant (`KUNNR_PREFIX`) when
   building the `kunnr` query parameter — regardless of where the filter
   value came from (config default, dealer context fallback, or manual user
   entry).
2. This padding applies unconditionally whenever `dealerCode` is present; no
   caller (list component, store) needs its own padding logic.

## Acceptance criteria

- A filter panel Dealer Code of `10015` results in `kunnr=0000010015` in the
  actual HTTP request to `fetchDatabricksdata`.
- `dealer-ledger.service.spec.ts` asserts `kunnr` is always the filter's
  `dealerCode` value prefixed with `00000`.
- Full suite (`ng test`, 196/196) and `ng build` pass.

## Open decisions

None — straightforward, matches the real backend's documented `kunnr` shape
confirmed via manual `curl` testing against the local backend.
