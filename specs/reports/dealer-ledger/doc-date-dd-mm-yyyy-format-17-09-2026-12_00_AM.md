# Dealer Ledger — Doc. Date Crashes the Table (Backend Sends DD-MM-YYYY); Remove Summary Cards

**Created:** 2026-09-17

## Status

Implemented.

## Purpose (2) — Remove the Summary Cards section

The Dealer Ledger list page currently renders a row of four summary
cards above the table — "Total Debit", "Total Credit", "Closing
Balance", "Entries" (`DealerLedgerSummaryCardsComponent`). This section
is to be removed from the Dealer Ledger output entirely; the page goes
straight from the filter panel to the table.

### Scope (2)

- `dealer-ledger-list.component.html` — remove the
  `<app-dealer-ledger-summary-cards>` element (and its surrounding
  layout, if the removal leaves an empty wrapper).
- `dealer-ledger-list.component.ts` — remove the `imports` entry for
  `DealerLedgerSummaryCardsComponent` and any inputs/computeds fed only
  to it (verify nothing else depends on them first).
- `DealerLedgerSummaryCardsComponent` itself (and its spec) — delete the
  component outright, since Dealer Ledger was its only consumer (verify
  via a repo-wide reference search before deleting).
- Out of scope: the underlying data the cards were computed from (e.g.
  any totals already present on `DealerLedgerStore`/the `/data` response)
  — only the presentational section is removed, not necessarily the
  store state it read from, unless that state has no other consumer
  either (verify before deleting store fields).

### Acceptance criteria (2)

- The Dealer Ledger list page no longer renders the Total
  Debit/Total Credit/Closing Balance/Entries cards, in any state
  (loading, empty, populated, error).
- No dangling unused imports, inputs, or dead code left behind in
  `dealer-ledger-list.component.ts`/`.html`.
- Full test suite still passes with the component's own spec file
  removed (no orphaned references to
  `DealerLedgerSummaryCardsComponent` elsewhere, e.g. in
  `dealer-ledger-list.component.spec.ts`).

## Purpose (1) — Doc. Date crash

The Dealer Ledger table throws at render time whenever a row has a
`docDate` and the "Doc. Date" cell renders:

```
ERROR RuntimeError: NG02100: InvalidPipeArgument: 'NG02311: Unable to
convert "17-06-2026" into a date' for pipe '_DatePipe'
    at DealerLedgerTableComponent_ng_template_1_Template
    (dealer-ledger-table.component.html:16:39)
```

This is a hard crash (Angular's `RuntimeError`), not a cosmetic glitch —
it breaks the whole table render whenever the backend returns any row
with a doc date.

## Root cause

- `DealerLedgerRow.docDate` (`dealer-ledger-row.model.ts:21`) is typed
  and commented as `string; // ISO 8601 date`, and
  `DealerLedgerService`'s response mapping (`dealer-ledger.service.ts:117`)
  passes the backend's raw string straight through unchanged:
  `docDate: row.docDate ?? row.postingDate ?? ''`.
- The real backend does not send ISO 8601 (`YYYY-MM-DD`) — it sends
  `DD-MM-YYYY` (e.g. `"17-06-2026"`), confirmed by the exact string in
  the crash.
- The cell template (`dealer-ledger-table.component.html:16`) pipes this
  value directly through Angular's built-in `DatePipe`:
  `{{ $any(row).docDate | date }}`. `DatePipe` only accepts a `Date`
  object, a timestamp number, or an ISO 8601 string — it has no
  understanding of `DD-MM-YYYY`, and `"17-06-2026"` is not valid ISO 8601
  (ISO would read `2026-06-17`), so it throws `NG02311` synchronously
  during change detection, which Angular escalates to the fatal
  `NG02100` `RuntimeError` shown above.
- This was masked until now because the mock data generator
  (`dealer-ledger-data.generator.ts:74`, `randomDateWithinDays(90)`)
  produces genuine ISO strings, and the one existing table spec test
  (`dealer-ledger-table.component.spec.ts:13`) hardcodes an ISO date
  (`'2024-01-15'`) — neither exercises the real backend's format.

## Scope

- `DealerLedgerService`'s response mapping, or the table's cell
  template — wherever the `DD-MM-YYYY` → parseable-`Date` conversion is
  most appropriate — to normalize `docDate` before it ever reaches
  `DatePipe`.
- Any other date-typed field the backend may return in the same
  `DD-MM-YYYY` shape (currently only `docDate`/`postingDate` are
  date-formatted in the table; no other field is piped through `date`).
- Out of scope: changing what `DealerLedgerRow.docDate` displays as
  (still "Doc. Date" formatted for on-screen display via `DatePipe`) —
  this is purely a parsing/normalization fix, not a display-format
  change.

## Fix approach

Parse the backend's `DD-MM-YYYY` string into a real `Date` (or an ISO
string) at the boundary — in `DealerLedgerService`'s response mapping,
the same place that already reconciles other backend/row-model
mismatches — rather than teaching the table's cell template to
understand multiple date formats. This keeps `DealerLedgerRow.docDate`
usable by `DatePipe` (and by the existing `dealer-ledger-mock.service.ts`
string-comparison date filtering, which requires this fix not break
lexical `dateFrom`/`dateTo` comparison — see Open decisions) without
scattering format-parsing logic into the template.

A defensive fallback (invalid/unparseable date string) must not crash
the table — render the raw string as-is (with a console warning) rather
than throwing, consistent with `toDealerLedgerColumns`'s existing
"skip and warn, never throw on unrecognized backend data" precedent.

## Acceptance criteria

- A row with `docDate: "17-06-2026"` (or any valid `DD-MM-YYYY` value)
  renders as a correctly formatted date in the "Doc. Date" column, with
  no `NG02100`/`NG02311` error.
- `dealer-ledger.service.spec.ts` gains a test asserting a `DD-MM-YYYY`
  backend date is normalized to a value `DatePipe` can render without
  throwing.
- `dealer-ledger-mock.service.ts`'s `dateFrom`/`dateTo` filtering
  (currently lexical `string` comparison against `row.docDate`) is
  verified to still behave correctly after this change — updated
  in lockstep if the stored format changes.
- An unparseable `docDate` value degrades to displaying the raw string
  (not a crash).

## Open decisions

- Where exactly to normalize: convert `docDate` to a true ISO 8601
  string in `DealerLedgerService.toRow()`-equivalent mapping (keeps
  `DealerLedgerRow.docDate: string` and its ISO comment accurate, and
  keeps `dealer-ledger-mock.service.ts`'s existing lexical date-range
  comparison working unchanged, since ISO strings sort lexically same as
  chronologically) — default assumption, since it fixes the root cause
  once, at the boundary, rather than in every consumer.
