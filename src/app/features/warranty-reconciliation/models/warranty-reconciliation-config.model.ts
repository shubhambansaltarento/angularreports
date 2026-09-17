/**
 * Real config shape returned by `GET reports/WARRANTY_RECONCILLATION/config`, confirmed via
 * direct API testing — dealer-ledger-style-page-17-09-2026-08_37_AM.md. Mirrors
 * `WarrantyCostConfig` exactly — there is no date-range parameter in this report's
 * `parameters[]` at all.
 */
export interface WarrantyReconciliationConfigContext {
  dealerCode: string;
  dealerDescription: string;
}

export interface WarrantyReconciliationConfigParameterOption {
  value: string;
  label: string;
}

export interface WarrantyReconciliationConfigParameter {
  name: string;
  label: string;
  control: 'TEXT' | 'SELECT' | string;
  dataType: string | null;
  required: boolean;
  defaultValue: string | null;
  options: WarrantyReconciliationConfigParameterOption[] | null;
  layout: { row: number; span: number } | null;
  multiple: boolean | null;
  lookup: unknown | null;
}

export interface WarrantyReconciliationConfigColumn {
  field: string;
  label: string;
  dataType: string;
  align: 'left' | 'right' | 'center' | string;
  sortable: boolean;
  defaultVisible: boolean;
  visible: boolean;
}

export interface WarrantyReconciliationConfigColumnGroup {
  key: string;
  label: string;
  visibleWhen: unknown | null;
  columns: WarrantyReconciliationConfigColumn[];
}

export interface WarrantyReconciliationConfig {
  reportCode: string;
  title: string;
  configVersion: string;
  context: WarrantyReconciliationConfigContext;
  parameters: WarrantyReconciliationConfigParameter[];
  columnGroups: WarrantyReconciliationConfigColumnGroup[];
  export: { formats: string[] };
  paging: { defaultPageSize: number; maxPageSize: number };
}
