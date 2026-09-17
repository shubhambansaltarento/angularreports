# Table — Export Panel Redesign: Radio Buttons, Icons, and a Dealer-Ledger Filename Format

**Created:** 2026-09-17 06:35 AM

## Status

Implemented. Export-trigger Open decision resolved as (a), a separate
explicit "Export" button. Bootstrap Icons integrated via
`node_modules/bootstrap-icons/font/bootstrap-icons.css` in
`angular.json`'s `styles` array (font asset confirmed emitted to the
build output) — `bi-file-earmark-excel`/`bi-file-earmark-pdf` for
Excel/PDF, `bi-filetype-csv`/`bi-printer` for CSV/Print (every
`ExportFormat` has an icon). Filename fallback/sanitization resolved
exactly as proposed (segment omitted when dealer name is empty;
non-`[A-Za-z0-9 _-]` characters replaced with `_`); date/time built
with a small native helper, no new date library.

## Purpose (2) — Exported Filename Format (Dealer Ledger)

When exporting from inside Dealer Ledger, the exported file's name
should follow this pattern:

```
{DEALER_LEDGER}_{DEALER_NAME}_{dd-mm-yyyy-h:mm-a.m./p.m.}-report.xls  (or .pdf)
```

e.g. `DEALER_LEDGER_PAWAN SARKAR AUTOMOBILES_17-09-2026-06:35-a.m.-report.xls`.

### Current implementation (2)

- `DataTableComponent.onExport()` (`data-table.component.ts:505-528`)
  derives the export filename purely from `const filename = this.tableId();`
  — for Dealer Ledger, `tableId="dealer-ledger"`
  (`dealer-ledger-table.component.html:2`), so today's file is just
  `dealer-ledger.xlsx`/`dealer-ledger.pdf` (extension appended by
  `ExportService.exportToExcel()`/`exportToPdf()`) — no dealer
  name/timestamp/report-key involved at all.
- `DataTableComponent` has no input for overriding/composing the
  export filename beyond `tableId()`/`title()` — this needs a new
  mechanism, since the desired format is Dealer-Ledger-specific
  (report key, dealer name) and the shared table has no notion of
  either.
- The dealer's name (`dealerDescription`) is available today via
  `DealerLedgerConfig.context.dealerDescription`
  (`DealerLedgerListComponent.config()`), but is not currently passed
  down to `DealerLedgerTableComponent` at all — only `rows`/`loading`/
  `resetDisabled`/`exportFormats`/`effectiveColumns` are.
- `DEALER_LEDGER_REPORT_KEY` (`dealer-ledger.constants.ts`) is the
  existing constant for `"DEALER_LEDGER"`, already used for API calls
  — reusable here instead of inventing a new literal.

### Scope (2)

- `DataTableComponent` gains an optional filename-override input (e.g.
  `exportFilename: input<string | null>(null)`) — when present, used
  instead of `tableId()` as the export's base filename; `null`
  (default) preserves today's behavior for every other table.
- `DealerLedgerTableComponent` gains a `dealerName` input (or receives
  the whole config context) and computes the Dealer-Ledger-specific
  filename (`DEALER_LEDGER_{dealerName}_{timestamp}-report`), passing
  it to the shared table via the new `exportFilename` input.
- `DealerLedgerListComponent`'s template passes `config()?.context.dealerDescription`
  (or equivalent) down to the table.
- Out of scope: any other report's filename format — the shared
  table's default (`tableId()`) is unchanged for every consumer that
  doesn't supply `exportFilename`.

### Requirements (2)

1. Exporting from the Dealer Ledger table (any format) produces a file
   named `DEALER_LEDGER_{dealer name}_{dd-mm-yyyy-h:mm-a.m./p.m.}-report.{ext}`,
   with the correct extension for the chosen format.
2. The timestamp reflects the moment of export (not the report's data
   date range), formatted as day-month-year plus 12-hour time with
   `a.m.`/`p.m.`.
3. If the dealer name is unavailable (config not yet loaded, or the
   field is empty), the filename degrades gracefully — e.g. falling
   back to `DEALER_LEDGER_{timestamp}-report` rather than producing a
   malformed name with an empty segment (see Open decisions for the
   exact fallback and any character-sanitization needed for filesystem-
   unsafe characters in the dealer name, e.g. slashes).
4. Every other table using the shared `DataTableComponent` keeps its
   existing `tableId()`-based filename — this is opt-in via the new
   input, not a default-behavior change.

### Acceptance criteria (2)

- Exporting to Excel/PDF from Dealer Ledger produces a filename
  matching the specified pattern, with the actual current dealer name
  and a real timestamp.
- Exporting from any other (hypothetical/future) table not supplying
  `exportFilename` still uses `tableId()` as before — no regression.
- `dealer-ledger-table.component.spec.ts` gains a test asserting the
  computed filename shape (e.g. via a fixed/mocked date and a known
  dealer name).
- `data-table.component.spec.ts` gains a test confirming
  `exportFilename`, when provided, overrides `tableId()` as the export
  base name.

### Open decisions (2)

- Exact fallback when dealer name is missing — default assumption:
  `DEALER_LEDGER_{timestamp}-report` (segment omitted entirely, not
  left as an empty `__`).
- Whether/how to sanitize the dealer name for filesystem-unsafe
  characters (e.g. `/`, `\`, `:`) — dealer names are real-world business
  names and could plausibly contain punctuation; default assumption:
  strip/replace any character outside `[A-Za-z0-9 _-]` with `_`, to
  guarantee a valid filename on every OS without needing per-platform
  logic.
- Exact date-time formatting function/library — this repo has no
  existing date-formatting utility beyond `toIsoDate()` (dealer-ledger.service.ts,
  a narrow DD-MM-YYYY→ISO parser, not a formatter) — default
  assumption: a small dedicated helper (native `Date` +
  `Intl.DateTimeFormat` or manual padding) rather than adding a new
  date library dependency for one filename.

## Purpose (1) — Export Panel Redesign

Redesign the shared table's Export popup from its current
dropdown-plus-buttons layout to a radio-button layout:

```
Scope
(•) All Filtered Rows   ( ) Current Page

Format
(•) [xls icon] Excel   ( ) [pdf icon] PDF
```

- Scope becomes two radio buttons instead of a `<select>` dropdown —
  "All Filtered Rows" first/selected by default, "Current Page"
  second.
- Format becomes radio buttons (one per available format, with a
  Bootstrap icon next to each) instead of one button-per-format that
  immediately triggers export — the first format radio is selected by
  default.
- Overall font size in the panel is smaller.

## Current implementation

- Scope: `<select class="form-select form-select-sm" [value]="exportScope()" (change)="onExportScopeChange($event)">`
  (`data-table.component.html:66-71`) with two `<option>`s
  ("Current page" / "All filtered rows") — `exportScope` defaults to
  `'all'` (`data-table.component.ts:154-158`, per
  `column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md`).
- Format: one `<button class="btn btn-sm btn-outline-secondary" (click)="onExport(format)">`
  per format in `visibleExportFormats()` (`data-table.component.html:73-77`)
  — clicking a format button *immediately* performs the export using
  the current `exportScope()`; there is no separate "confirm/export"
  action today. `EXPORT_FORMAT_LABELS`
  (`data-table.component.ts:36-41`) supplies each format's display
  text ("CSV", "Excel", "Print", "PDF") — no icons currently.
- Dealer Ledger's config restricts `exportFormats` to `['excel', 'pdf']`
  (`EXPORT_FORMAT_BY_BACKEND_NAME` in `dealer-ledger-list.component.ts`),
  matching the screenshot's Excel/PDF-only panel.
- No icon library beyond plain Bootstrap 5 CSS is installed
  (`package.json` has `bootstrap` but not `bootstrap-icons`) — Bootstrap
  Icons is a separate, official companion package
  (`bootstrap-icons` on npm) that would need to be added as a new
  dependency to use real Bootstrap icon glyphs, per this request's "icon
  from bootstrap."

## Scope

- `data-table.component.html`/`.ts`/`.scss` — replace the Scope
  `<select>` with two radio inputs, and replace the per-format export
  buttons with per-format radio inputs (each with a Bootstrap icon) —
  see Open decisions for how the actual export action is now
  triggered, since format selection is no longer itself the trigger.
- `package.json` — add `bootstrap-icons` as a dependency (needed for
  real Bootstrap icon glyphs; see Open decisions for the exact icon
  names for Excel/PDF and how they're wired into the Angular build,
  since this project has no existing icon-font/SVG-sprite usage to
  follow as precedent).
- Reduce the export panel's overall font size.
- Out of scope: the Columns picker (already addressed in prior specs)
  and any change to `ExportFormat`/`EXPORT_FORMAT_LABELS`'s underlying
  values — only the panel's presentation and interaction model change.

## Requirements

1. Scope renders as two radio buttons — "All Filtered Rows" and
   "Current Page" — with "All Filtered Rows" selected by default
   (matching today's `'all'` default), in a native, keyboard-accessible
   radio group (shared `name` attribute).
2. Format renders as radio buttons — one per `visibleExportFormats()`
   entry — each showing a Bootstrap icon alongside its label (e.g. an
   Excel-file icon for `excel`, a PDF-file icon for `pdf`), with the
   first available format selected by default.
3. Selecting a scope or format radio only changes the current
   selection state — it does not immediately trigger an export (unlike
   today's format buttons). A separate, explicit action is needed to
   perform the export using the currently-selected scope + format (see
   Open decisions for its exact control).
4. Panel text (scope/format labels) renders at a smaller font size
   than today's default Bootstrap sizing.
5. No change to what an export actually contains for a given
   scope/format combination — `onExport()`'s row-selection/column
   logic is unaffected, only how the user selects scope/format and
   triggers the action.

## Acceptance criteria

- Opening the Export panel shows Scope as two radio buttons ("All
  Filtered Rows" pre-selected) and Format as radio buttons with icons
  (the first pre-selected), all at a visibly smaller font size than
  before.
- Changing the scope or format radio does not, by itself, produce an
  export — an explicit action (per the resolved Open decision) is
  needed.
- Triggering that action exports exactly the rows/format the selected
  radios indicate, matching today's `onExport()` behavior for that
  combination.
- `data-table.component.spec.ts`'s existing export tests
  (`column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md`'s
  default-scope/explicit-current-page tests, and the
  columns-plus-CSV/PDF export tests) are updated to the new
  radio-button + explicit-trigger interaction model.

## Open decisions

- **How export is now triggered**, since format selection alone can no
  longer trigger it (Requirement 3): (a) add a single "Export" button
  below the two radio groups, using the currently-selected format
  (closest to a normal "form" interaction — default assumption, since
  it's the least surprising pattern once format is a passive selection
  rather than an action), or (b) keep each format as an
  immediately-triggering control but render it as a "radio-styled"
  button (visually a radio, behaviorally a trigger) — rejected as a
  default, since real radio inputs that also instantly submit are
  confusing/inaccessible (a screen reader user tabbing through radios
  wouldn't expect arrow-key navigation between them to fire an export
  the moment focus lands on a new option). Confirm before
  implementation: default assumption is (a).
- **Exact Bootstrap Icons glyphs and integration approach**: Bootstrap
  Icons ships either as an icon font (`bootstrap-icons.css` +
  `bootstrap-icons.woff2`) or individual SVGs — default assumption:
  add the `bootstrap-icons` npm package and its font-based CSS (`<i class="bi bi-file-earmark-excel"></i>`
  for Excel, `bi bi-file-earmark-pdf` for PDF), the simplest
  integration requiring only a global stylesheet import, no per-icon
  SVG inlining/build tooling. Needs confirmation this repo's build
  (esbuild-based Angular CLI) resolves the icon font asset correctly
  from `node_modules` — to be verified during implementation, not
  assumed.
- Whether "Print" and "CSV" formats (not shown in the Dealer Ledger
  screenshot, but supported generically by `ExportFormat`) also need
  icons for other, future consumers of this shared table — default
  assumption: yes, assign an icon to every `ExportFormat` value for
  consistency, even though only `excel`/`pdf` are exercised by Dealer
  Ledger today.
