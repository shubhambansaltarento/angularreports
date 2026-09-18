/**
 * Raw row shape returned by `POST /warranty-cost/fetch-data-bricks-data` — a flat array of
 * rows, snake_case fields, confirmed live —
 * html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md. Dates (`doc_date`/`order_date`/
 * `ref_date`) are numeric `YYYYMMDD` strings, not ISO/`DD-MM-YYYY` like other reports.
 */
export interface WarrantyCostDatabricksRow {
  dealer?: string;
  dealer_name?: string;
  cn_memo_no?: string;
  doc_date?: string;
  order_num?: string;
  order_date?: string;
  dlr_ref_num?: string;
  ref_date?: string;
  item_no?: string;
  part_number?: string;
  description?: string;
  quantity?: number;
  plant?: string;
  ndp_rate?: number;
  excise?: number;
  sales_tax?: number;
  labour?: number;
  octroi?: number;
  service_tax?: number;
  tot_cost?: number;
  freight?: number;
  demurrage?: number;
  billing_doc?: string;
}
