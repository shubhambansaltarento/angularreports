# Parts Packing List — Spec: Dealer Code + Company Code Sourced From Config

**Created:** 2026-09-18 12:03 IST

## Status

Proposed.

## Purpose

`PartsPackingListListComponent` currently sources `dealerCode` invisibly
from `DealerContextService` (the mocked dealer-identity stand-in), per
parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md's Open
decisions, since the config response had no `context`/dealer-code value at
the time. The config API is expected to start returning a real Dealer Code
(and a Company Code), matching the pattern already established by Dealer
Ledger/Warranty reports (config-context-dealer-code-source-of-truth-17-09-2026-08_19_AM.md)
— once it does, Parts Packing List should read both from config instead of
the mock dealer context, and pad the dealer code the same way Dealer
Ledger's `kunnr` is padded
(kunnr-always-zero-padded-in-databricks-payload-17-09-2026-04_33_PM.md).

## Current config response (confirmed via curl at spec time)

```
curl -s "http://localhost:8080/parts-packing-list/config"
{"reportCode":"PARTS_PACKING_LIST","title":"Parts Packing List","parameters":[{"name":"dealerCode","label":"Dealer Code","dataType":"STRING","required":true},{"name":"fromDate","label":"From Date","dataType":"DATE","required":true},{"name":"toDate","label":"To Date","dataType":"DATE","required":true}]}
```

As of this spec, the response still only *declares* `dealerCode` as a
required parameter (name/label/dataType) — it carries no actual dealer code
value (no `context.dealerCode`, no `parameters[].defaultValue`) and no
Company Code parameter at all. This spec's requirements below describe the
target behavior once the backend adds these; until then, the current
`DealerContextService` fallback remains in place (see Open decisions).

## Requirements

1. Once the config response carries a real Dealer Code (via a
   `context.dealerCode` field, matching Dealer Ledger's shape, or a
   `dealerCode` parameter's `defaultValue` — whichever the backend actually
   ships), `PartsPackingListListComponent`/`PartsPackingListService` reads
   it from there instead of `DealerContextService`.
2. That config-sourced dealer code is zero-padded with the same `00000`
   prefix used for Dealer Ledger's `kunnr`
   (kunnr-always-zero-padded-in-databricks-payload-17-09-2026-04_33_PM.md) before
   being sent as `dealerCode` in the `fetch-data-bricks-data` POST body —
   i.e. the padding happens once, centrally, in `PartsPackingListService`,
   not left to each caller.
3. Once the config response also carries a Company Code (its own
   `context.companyCode` or a `companyCode` parameter's `defaultValue`),
   that value is included in the `fetch-data-bricks-data` request body
   alongside `dealerCode`/`fromDate`/`toDate` — exact field name TBD (see
   Open decisions), since the currently-confirmed request contract
   (`{"dealerCode":"1","fromDate":"2026-01-01","toDate":"2026-01-31"}`) has
   no company code field yet.
4. Parts Packing List's own UI still shows neither Dealer Code nor Company
   Code (unchanged from parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md)
   — both remain invisible, config-sourced values.

## Acceptance criteria

- Once the backend's `/parts-packing-list/config` response includes a real
  dealer code (and company code), the app sources both from that response,
  not `DealerContextService`.
- The `fetch-data-bricks-data` POST body's `dealerCode` is always the
  config value prefixed with `00000` (e.g. config `10015` ->
  `"0000010015"`), mirroring Dealer Ledger's `kunnr` padding exactly.
- `parts-packing-list.service.spec.ts`/`parts-packing-list-list.component.spec.ts`
  are updated to assert the padded, config-sourced dealer code and the
  new company-code field once its name is confirmed.
- Full suite (`ng test`) and `ng build` pass.

## Open decisions

- The exact shape of the config response once it does carry a real dealer
  code — `context: { dealerCode, dealerDescription }` (Dealer Ledger's
  shape) vs. `parameters[].defaultValue` (Warranty Cost's Company Code
  shape) — TBD until the backend change ships; this spec's implementation
  should re-check the live config response before finalizing which shape
  to parse.
- The field name for Company Code in the `fetch-data-bricks-data` request
  body (`companyCode`? `bukrs`, matching Dealer Ledger's query-param name?)
  — TBD until confirmed via `curl` against the updated backend.
- Whether Company Code arrives as its own top-level config field or a
  `parameters` entry (`{"name":"companyCode", ...}`) alongside the existing
  `dealerCode`/`fromDate`/`toDate` parameters — TBD.
