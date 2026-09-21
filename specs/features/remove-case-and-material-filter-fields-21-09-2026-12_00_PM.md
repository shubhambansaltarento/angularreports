# Remove Case and Material Fields from Parts Packing List Filter Form

## Context

The Parts Packing List filter form (`parts-packing-list-filter.component`) currently exposes four
range fields for "Case" and "Material":

- `caseFrom` / `caseTo`
- `materialFrom` / `materialTo`

These are defined in:

- Form: `src/app/features/parts-packing-list/filters/parts-packing-list-filter/parts-packing-list-filter.component.ts` (FormGroup controls)
- Template: `src/app/features/parts-packing-list/filters/parts-packing-list-filter/parts-packing-list-filter.component.html` (rendered, misleadingly, as `type="date"` inputs)
- Model: `src/app/features/parts-packing-list/models/parts-packing-list-filters.model.ts` (`PartsPackingListFilters` interface)
- Service: `src/app/features/parts-packing-list/services/parts-packing-list.service.ts` — client-side post-fetch filtering only:
  - `caseFrom`/`caseTo` filters against row field `case_number`
  - `materialFrom`/`materialTo` filters against row field `part_number`

These fields are not sent to the real `fetchDatabricksdata` API — they only filter rows already
fetched into the browser.

## Requirement

Remove the Case and Material filter fields entirely from the Parts Packing List feature:

1. Remove `caseFrom`, `caseTo`, `materialFrom`, `materialTo` form controls and their template
   markup (labels + inputs) from `parts-packing-list-filter.component.ts`/`.html`.
2. Remove the corresponding properties from `PartsPackingListFilters`.
3. Remove the `inRange` calls against `case_number` and `part_number` in
   `parts-packing-list.service.ts`, and the `inRange` helper if it becomes unused.
4. Remove any references to `caseFrom`/`caseTo`/`materialFrom`/`materialTo` in `submit()` payload
   emission and any consumer of `PartsPackingListFilters`.
5. No change to `dateFrom`/`dateTo`, `invoiceNumber`, or `deliveryNumber` fields — these remain.

## Out of scope

- No change to the API contract or Databricks fetch behavior (these fields were never sent to the
  API).
- No change to other reports' filter forms.

## Acceptance criteria

- Case and Material labels/inputs no longer render in the Parts Packing List filter form.
- `PartsPackingListFilters` no longer declares `caseFrom`, `caseTo`, `materialFrom`, `materialTo`.
- Client-side filtering in `parts-packing-list.service.ts` no longer references these fields.
- Existing date-range, invoice number, and delivery number filtering continue to work unchanged.
- No compile errors or unused-code lint warnings introduced by the removal.
