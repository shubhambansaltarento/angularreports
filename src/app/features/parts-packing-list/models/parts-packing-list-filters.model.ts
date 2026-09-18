/**
 * Filter panel values for Parts Packing List, matching the reference SAP UI's Input
 * Parameters (Invoice Number/Delivery Number) and Filter Menu (Date Range/Case/Material)
 * sections. Only `dateFrom`/`dateTo` are sent to the real data API (as `fromDate`/`toDate`,
 * alongside the invisible `dealerCode`) — the rest are applied as client-side filters over
 * the fetched rows, since the confirmed `fetchDatabricksdata` contract does not accept them
 * (parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md, Open decisions).
 */
export interface PartsPackingListFilters {
  invoiceNumber?: string;
  deliveryNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  caseFrom?: string;
  caseTo?: string;
  materialFrom?: string;
  materialTo?: string;
}
