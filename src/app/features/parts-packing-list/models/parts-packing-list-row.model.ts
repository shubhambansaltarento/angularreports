/**
 * Table-row view model for Parts Packing List. Unlike every other report's row model,
 * this one has no fixed field list beyond the synthetic `id` (trackBy) — every other key
 * is whatever the real `fetchDatabricksdata` response's first row happened to contain,
 * per parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md's dynamic-columns
 * requirement. Confirmed real fields include `dealer_code`, `dealer_name`, `dealer_city`,
 * `invoice_number`, `delivery_number`, `case_number`, `carton_box`, `part_number`,
 * `part_description`, `quantity` — but this type does not hardcode them.
 */
export interface PartsPackingListRow extends Record<string, unknown> {
  id: string;
}
