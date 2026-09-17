# Table — Verify Forward/Backward Pagination Loads the Correct Records at Page Size 10

**Created:** 2026-09-17

## Status

Investigated — no defect found in `DataTableComponent`'s client-side
pagination path. Regression coverage added since none previously
existed for row *identity* while paging (only row *count* was
asserted).

## Findings

- New tests (`data-table.component.spec.ts`) clicking through pages
  1→2→3→4→3→2→1 and non-sequentially (1→3→2→4→1) on the 40-row demo
  dataset, asserting the exact visible product numbers at every step,
  both pass against the existing implementation unmodified —
  `goToPage()`/`goToNextPage()`/`goToPreviousPage()`/`pagedData()` all
  slice the correct rows for every page in both directions.
- The suspected `DealerLedgerRow.id` candidate (checklist item 5) was
  ruled out: `id: \`${page}-${index}\`` uses `index` as this row's
  position within the *entire* (non-paginated,
  `api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md`) response array,
  and `page` is a constant for the whole session (Dealer Ledger never
  calls a page-changing method) — so every row in a given response gets
  a distinct id (`dealer-ledger.service.spec.ts` now asserts this for a
  40-row response). `trackByKey="id"` is therefore stable, not a source
  of CDK row-reuse/misrender across pages.
- No reproduction of the reported symptom was found in the generic
  table's client-side pagination path itself. If it recurs, the next
  place to look is real backend data — e.g. duplicate rows *within* a
  single API response (which would make two different "pages" show
  overlapping content correctly, per the frontend's own slicing, but
  still look wrong to a user) — not the frontend's pagination logic.

## Purpose

Reported symptom: with page size 10, navigating forward/backward through
pages (Prev/Next and/or direct page-number clicks) does not load records
properly — implying the rows shown for a given page number are
sometimes wrong (stale, duplicated, or from a different page than the
one currently marked active). This spec is to pin down exactly which
step in the pagination pipeline is wrong, backed by real test evidence,
and fix it — not to guess.

This follows `spec-table-default-page-size-10.md` (which established
page size 10 for 40 rows / 4 pages) and
`spec-table-reset-pagination.md` (which fixed the page-1-restart-on-
Reset case). This spec is specifically about *manual* forward/backward
navigation once a dataset is loaded — clicking Next, Previous, and
page-number buttons repeatedly — continuing to slice the correct rows
each time.

## Scope

- `DataTableComponent`'s client-side pagination path only
  (`currentPage`, `goToPreviousPage()`, `goToNextPage()`, `goToPage()`,
  `pagedData()`, `pageNumbers()`) — the same "not paginated server-side"
  mode Dealer Ledger uses
  (`api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md`).
- Out of scope: server-side pagination mode (`totalCount`/`page`
  inputs) — this is a distinct code path already covered by
  `spec-table-server-side-pagination.md`.

## Investigation checklist (do this before changing any code)

Reproduce with a real, deterministic dataset (e.g. the existing 40-row
demo host used by `spec-table-default-page-size-10.md`'s tests) and
confirm which of these actually reproduce the reported symptom, since
`goToPage()`/`goToNextPage()`/`goToPreviousPage()`/`pagedData()` all
read as correct on inspection (each clamps `target` to
`[1, totalPages()]` via `Math.min(Math.max(1, page), totalPages())`,
and `pagedData()` slices from `(effectiveCurrentPage() - 1) * pageSize()`):

1. Click Next repeatedly from page 1 to page 4, then Previous back to
   page 1 — assert the exact row set shown at each step matches
   `rows[(page-1)*10 .. page*10)` of the known 40-row dataset (not just
   the *count* of 10 rows, which the existing
   `spec-table-default-page-size-10.md` tests already assert, but the
   *identity* of which 10 rows — this is the gap: no existing test
   checks row identity while navigating back and forth, only forward).
2. Click a page-number button directly (e.g. jump 1 → 3 → 2) — assert
   correct row identity at each jump, not just sequential Next/Previous.
3. Check whether `effectiveCurrentPage()` and `currentPage` can
   desync — e.g. does anything else write to `currentPage` mid-
   navigation (the clamp-down `effect()`, `resetPagination()`,
   search/clear-search resetting to page 1) in a way that could race
   with a Prev/Next click and silently jump the page back before the
   click's own `goToPage()` call takes effect?
4. Check the CDK table's `trackByFn`/`trackByKey` usage — if two
   different rows across pages coincidentally track equal (e.g.
   `trackByKey` unset, falling back to *index within the page* per
   `trackByFn`'s `: index` fallback), Angular could reuse/misrender DOM
   nodes across a page change rather than fully re-rendering, which
   would look like "wrong records loaded" without the underlying
   `pagedData()` slice actually being wrong. This is a strong candidate
   given `trackByFn`'s fallback to `index` (not a stable per-row key)
   when `trackByKey` is unset or a row lacks that key — Dealer Ledger
   does set `trackByKey="id"`, but any consumer that doesn't would hit
   this.
5. Confirm whether the symptom is specific to Dealer Ledger (real
   backend data, real column config) or reproducible in the shared
   table's own generic demo host — if only Dealer Ledger, the bug may
   be upstream (e.g. `id` not actually unique across rows from
   `DealerLedgerService.toDealerLedgerRow()`, which builds
   `id: \`${page}-${index}\`` — since the API is not paginated
   (`spec23`), `page` is always the same value for the whole result set
   in a single response, so `id` degrades to just `index` — this is
   plausibly the real root cause: `id` is not tied to anything
   dataset-stable, so if `pagedData()`/CDK re-slices while
   `trackByKey="id"` resolves to `${page}-${index}` where `index` is
   the row's position within the *full, unpaginated* `rows` array from
   the API response, not its position within the current page — need
   to verify against the real `id` values `toDealerLedgerRow` produces).

## Requirements

1. Identify and document (in this spec, updating this section once
   confirmed) the actual root cause from the investigation checklist
   above — do not fix speculatively.
2. Fix whichever layer is actually wrong (candidates: `trackByFn`
   fallback, `DealerLedgerRow.id` generation, a `currentPage` race, or
   a `pagedData()`/`effectiveCurrentPage()` computation bug — to be
   narrowed down by the investigation, not assumed).
3. No regression to `spec-table-default-page-size-10.md`'s existing
   page-size/page-count assertions or
   `spec-table-reset-pagination.md`'s reset-to-page-1 behavior.

## Acceptance criteria

- A new `data-table.component.spec.ts` test: build a 40-row dataset
  with distinguishable content (e.g. `Product 1`..`Product 40`,
  already the pattern used by `buildDemoProducts`), click Next three
  times (page 1 → 4), then Previous three times (page 4 → 1), and at
  every single step assert the exact set of visible row labels matches
  the expected slice for that page number — not just the row count.
- Same again via direct page-number clicks in a non-sequential order
  (e.g. 1 → 3 → 2 → 4 → 1).
- If the root cause is traced to `DealerLedgerRow.id` (see
  investigation checklist item 5), a `dealer-ledger.service.spec.ts`
  test asserting every row in a multi-row response gets a distinct,
  stable `id`.

## Open decisions

- None yet — pending the investigation checklist's findings, which
  should replace this section (and the "candidates" language in
  Requirement 2) with the confirmed root cause before implementation
  begins.
