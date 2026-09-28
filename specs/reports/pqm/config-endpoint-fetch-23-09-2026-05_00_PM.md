# PQM/VOR Print/Warranty Labour Tax Invoice — Spec: Fetch Config on Page Entry

**Created:** 23-09-2026 05:00 PM IST

## Status

Implemented.

## Purpose

Every other report fetches its config once on page entry via the generic, report-keyed
`GET {baseUrl}reports/{reportKey}/config` endpoint (`ReportApiService`). PQM, VOR Print, and
Warranty Labour Tax Invoice previously fetched nothing at all — the shared
`ReportSearchOnlyPageComponent` had no report key and no config call. The user asked to wire up
the same config fetch for these three reports' real endpoints:

- `GET /api/v1/reports/WARRANTY_LABOUR_TAX_INVOICE/config`
- `GET /api/v1/reports/VOR_PRINT/config`
- `GET /api/v1/reports/PQM/config`

## Requirement

1. `ReportConfig` (`shared/models/report-config.model.ts`) gets a new optional `reportKey?:
   string` field — the `ReportApiService`'s dynamic path segment, set only for reports whose
   config endpoint is actually being called.
2. `PQM_REPORT_CONFIG`/`VOR_PRINT_REPORT_CONFIG`/`WARRANTY_LABOUR_TAX_INVOICE_REPORT_CONFIG`
   each set `reportKey` to `'PQM'`/`'VOR_PRINT'`/`'WARRANTY_LABOUR_TAX_INVOICE'` respectively.
3. `app.routes.ts`'s `SEARCH_ONLY_REPORT_CONFIGS` route mapping passes `reportKey:
   config.reportKey` through route `data`, alongside the existing `title`/`description`.
4. `ReportSearchOnlyPageComponent` gets a new `reportKey` input. In its constructor, an
   `effect()` (input signals aren't guaranteed to be set at constructor-body-execution time, so
   this reacts to the signal rather than reading it directly) calls
   `ReportApiService.getConfig(key)` once when `reportKey()` resolves to a value, mirroring
   every other report's `getConfig()` pattern: logs the request and response/error to the
   console, and stores the raw response in a `config` signal. No table/store exists yet for
   this page to bind the response into further — this is the same foundational step other
   reports took before their own dedicated page/store existed.

## Acceptance criteria

- Navigating to PQM, VOR Print, or Warranty Labour Tax Invoice issues exactly one
  `GET /api/v1/reports/<KEY>/config` request on page load, to the correct key for that report.
- The response (or a fetch failure) is logged to the console, matching every other report's
  `getConfig()` logging convention.
- No other report's config-fetch behavior changes — `reportKey` is optional and only these
  three configs set it today.
