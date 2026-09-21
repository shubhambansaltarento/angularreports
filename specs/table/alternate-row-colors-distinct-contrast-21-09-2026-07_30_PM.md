# Shared Data Table — Spec: Higher-Contrast Alternating Row Colors

**Created:** 21-09-2026 07:30 PM IST

## Status

Implemented.

## Purpose

`alternate-row-colors-white-and-light-grey-21-09-2026-07_15_PM.md` documented the shared
table's white/light-grey striping. On Dealer Ledger's real data (multi-line addresses, dense
columns), that grey (`#f5f7fa`) was too close to white to read as a visible stripe against
white cell backgrounds and light `#dee2e6` borders — confirmed against a Dealer Ledger
screenshot where alternating rows were not visually distinguishable.

## Requirement

1. `data-table.component.scss`: darken the even-row background from `#f5f7fa` to `#e9ecef`,
   and the hover background from `#eef2f7` to `#dde3e8` — a clearly visible grey against white
   odd rows and the table's borders, still applied via the same
   `.data-table__table tr[cdk-row]:nth-child(even)` rule (no selector change — the striping
   mechanism itself was correct, only the color's contrast needed to increase).
2. Add a regression test (`data-table.component.spec.ts`) asserting the first two body rows'
   computed `background-color` differ and the even row isn't transparent — guards against this
   silently regressing back to a too-subtle color.

## Acceptance criteria

- Dealer Ledger (and every other report using the shared table) shows a clearly visible
  alternating white/grey row pattern, distinguishable at a glance, not just on close
  inspection.
- The existing test suite continues to pass, plus the new computed-style regression test.
