/**
 * Table-row view model for Goods Acknowledgement — per the confirmed column set
 * (Invoice No., Shipment No., Date, plus row selection). Deliberately minimal: no
 * business fields beyond these are populated with mock data, since the report's full
 * data shape is not yet confirmed (see `goods-acknowledgement.config.ts`).
 *
 * Extends `Record<string, unknown>` to satisfy the generic, reusable Data Table's `T`
 * constraint (see `shared/ui/data-table`).
 */
export interface GoodsAcknowledgementRow extends Record<string, unknown> {
  id: string;
  invoiceNumber: string;
  shipmentNumber: string;
  date: string; // ISO 8601 date
}
