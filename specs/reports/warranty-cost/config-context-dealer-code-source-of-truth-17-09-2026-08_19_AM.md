# Warranty Cost Report — Use the Config API's `context` Directly as the `/data` Request's Dealer Code, Not the Form's Echoed Value

**Created:** 2026-09-17 08:19 AM

## Status

Implemented.

## Purpose

The screenshot shows the exact same symptom seen once before during
this build (previously diagnosed, in that instance, as a stale dev
server): the Dealer Code/Description fields display the mocked
fallback values (`"DLR-001"` / `"Northgate Motors — Authorized
Dealer"`) instead of the real config API's `context`
(`{ "dealerCode": "10015", "dealerDescription": "PAWAN SARKAR
AUTOMOBILES" }`), and submitting returns "0 records" — because the
`/data` request was sent with the mock dealer code, which doesn't
exist in the real backend's data.

This time, the root cause is a genuine timing bug in the code, not a
stale build: `WarrantyCostReportListComponent.onSearch()` builds the
`/data` request's `dealerCode` from the **form's currently displayed
value** (`value.dealerCode`, echoed back from
`WarrantyCostReportFilterComponent`'s read-only `ReportSearchBarComponent`
fields) rather than from the config signal directly. Dealer Code/
Description are never user-editable for this report
(`readonlyDealerFields="true"`) — they exist purely to display
`config().context`. Routing them through the form/effect/output
round-trip introduces an avoidable race: if the user clicks "Show
Report" before `WarrantyCostReportListComponent`'s async `getConfig()`
call has resolved and propagated all the way through
`ReportSearchBarComponent`'s `effect()`-driven form patch, the
submitted value is still whatever the form was initialized with (the
mocked fallback), even though `this.config()` itself may already hold
the real response.

## Root cause

- `WarrantyCostReportListComponent.onSearch(value)`
  (`warranty-cost-report-list.component.ts:58-60`) calls
  `this.toFilters(value)`, which takes `dealerCode`/`dealerDescription`
  straight from the emitted `CommonReportSearchFilters` — itself
  sourced from `WarrantyCostReportFilterComponent.onSubmit()` →
  `this.searchBar().value()` → the `ReportSearchBarComponent`'s
  reactive form's current value.
- That form's Dealer Code/Description are populated by
  `ReportSearchBarComponent`'s constructor `effect()`, which patches
  the form whenever `initialValue()` (an `@Input`) changes —
  `WarrantyCostReportFilterComponent.initialValue` is a `computed()`
  reading `this.config()` (an `@Input` bound from the parent's
  `config` signal) with a mock fallback. This is a **three-hop**
  relay (parent `config` signal → filter's `initialValue` computed →
  `ReportSearchBarComponent`'s `initialValue` input → its internal
  `effect()` → form patch → `searchBar().value()` on submit) for a
  field that is never actually edited by the user — every hop is an
  opportunity for a timing gap between "the real config has loaded"
  and "the submitted value reflects it."
- Since Dealer Code/Description are `readonlyDealerFields`, there is
  no legitimate reason for the submitted request to ever differ from
  `config()?.context` once config has loaded — the form's echoed value
  is not user intent, it's just a display relay.

## Scope

- `WarrantyCostReportListComponent.onSearch()`/`toFilters()` — read
  `dealerCode`/`dealerDescription` directly from
  `this.config()?.context` (falling back to the emitted form value
  only if config genuinely hasn't loaded yet, matching
  `DealerContextService`'s own fallback precedent), instead of trusting
  the form-echoed `value.dealerCode`/`value.dealerDescription`.
- Out of scope: `ReportSearchBarComponent`/`WarrantyCostReportFilterComponent`'s
  display logic — the *displayed* text prefill mechanism (config →
  computed → input → effect → form) is unchanged and still correct for
  what the user *sees*; this spec only changes what value is actually
  sent to `/data`, decoupling it from the display relay's timing.
- Out of scope: Dealer Ledger's identical architecture — not
  reported as exhibiting this symptom; not modified by this spec
  unless a similar report surfaces the same race there.

## Requirements

1. `POST /reports/WARRANTY_COST/data`'s `parameters.dealerCode` always
   reflects the real config API's `context.dealerCode` once config has
   loaded — regardless of whether the read-only display fields have
   visually/reactively caught up to it yet at the moment Submit is
   clicked.
2. If Submit is somehow clicked before config has loaded at all (edge
   case — the config fetch normally completes long before a human can
   click), the request falls back to whatever the form currently shows
   (today's behavior), rather than sending an empty/undefined
   `dealerCode`.
3. No change to what the user visually sees in the Dealer Code/
   Description fields, or to any other field (Company Code, Claim
   Date) — this is scoped to closing the dealer-identity race only.

## Acceptance criteria

- With a mocked config response, clicking Submit sends the config's
  `context.dealerCode`/`context.dealerDescription` in the `/data`
  request — verified even when the emitted form value differs from
  the config (simulating the race directly, not just hoping timing
  cooperates in a real E2E run).
- `warranty-cost-report-list.component.spec.ts` gains a test:
  `store.search()`'s `dealerCode` argument matches `config().context.dealerCode`
  even when the `searched` event's `dealerCode` differs (simulated
  stale form value).
- Manually verified against the live backend: submitting Warranty
  Cost Report for the real dealer (`10015`) returns real rows, not "0
  records."

## Open decisions

- None — this is a direct "read from the authoritative source instead
  of an echoed relay" fix with no ambiguity.
