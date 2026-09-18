/**
 * Internal row shape for a single Warranty Cost statement line item — mirrors the reference
 * PDF's table columns exactly (SL NO/CN MEMO NO./DOC DATE/ORDER NUM/ORDER DATE/DLR REF NUM/
 * REF DATE/PART NUMBER+DESCRIPTION/QUANTITY/NDP RATE/EXCISE/SALES TAX/LABOUR/OCTROI/SERVICE
 * TAX/TOT COST), per html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md. Not a
 * `Record<string, unknown>` — unlike every table-backed report, this is not consumed by
 * `shared/ui/data-table`.
 */
export interface WarrantyCostRow {
  dealerCode: string;
  dealerName: string;
  cnMemoNo: string;
  docDate: string; // DD.MM.YYYY, display-ready
  orderNum: string;
  orderDate: string; // DD.MM.YYYY, display-ready
  dlrRefNum: string;
  refDate: string; // DD.MM.YYYY, display-ready
  partNumber: string;
  description: string;
  quantity: number;
  ndpRate: number;
  excise: number;
  salesTax: number;
  labour: number;
  octroi: number;
  serviceTax: number;
  totCost: number;
  freight: number;
  demurrage: number;
}
