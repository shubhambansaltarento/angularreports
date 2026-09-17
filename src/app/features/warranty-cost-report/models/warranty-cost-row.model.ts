/**
 * Table-row view model for a single Warranty Cost entry, per the real column set
 * confirmed live: Dealer Code, Dealer Name, Order Date, Quantity —
 * column-schema-changed-to-order-date-quantity-17-09-2026-08_14_AM.md. `id` is a
 * synthetic row identifier (not a business field) used for table trackBy.
 *
 * Extends `Record<string, unknown>` to satisfy the generic, reusable Data Table's `T`
 * constraint (see `shared/ui/data-table`), matching Dealer Ledger's own row model.
 */
export interface WarrantyCostRow extends Record<string, unknown> {
  id: string;
  dealerCode: string;
  dealerName: string;
  orderDate: string; // ISO 8601 date
  quantity: number;
}
