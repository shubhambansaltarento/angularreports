/**
 * Real response shape returned by `POST reports/WARRANTY_RECONCILLATION/data`, confirmed via
 * direct API testing — api-integration-17-09-2026-08_37_AM.md. Every field optional,
 * mirroring `WarrantyCostApiResponseRow`'s own convention.
 */
export interface WarrantyReconciliationApiResponseRow {
  dealerCode?: string;
  dealerName?: string;
  /** `DD-MM-YYYY` string, e.g. `"02-06-2026"` — normalized via `toIsoDate()` before display. */
  reconciliationDate?: string;
}

export interface WarrantyReconciliationEffectiveColumn {
  columnName: string;
  isDefault: boolean;
  isVisible: boolean;
}

export interface WarrantyReconciliationApiResponsePaging {
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

export interface WarrantyReconciliationApiResponse {
  reportCode: string;
  configVersion: string;
  effectiveColumns: WarrantyReconciliationEffectiveColumn[];
  rows: WarrantyReconciliationApiResponseRow[];
  /** Always `{}` — this report has no summary/aggregate row. */
  totals: Record<string, never>;
  paging: WarrantyReconciliationApiResponsePaging;
  meta: { generatedAt: string; dataAsOf: string; queryMs: number };
}
