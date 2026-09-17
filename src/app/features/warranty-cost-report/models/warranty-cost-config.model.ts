/**
 * Real config shape returned by `GET reports/WARRANTY_COST/config`, confirmed via direct
 * API testing — api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md. Richer than
 * `DealerLedgerConfig`: structured `parameters[]` (control/layout/validation metadata) and
 * `columnGroups[]` (per-column dataType/format/aggregate), rather than Dealer Ledger's
 * flatter shape.
 */
export interface WarrantyCostConfigContext {
  dealerCode: string;
  dealerDescription: string;
}

export interface WarrantyCostConfigParameterOption {
  value: string;
  label: string;
}

export interface WarrantyCostConfigParameter {
  name: string;
  label: string;
  control: 'TEXT' | 'SELECT' | 'DATE_RANGE' | string;
  dataType: string | null;
  required: boolean;
  defaultValue: string | null;
  options: WarrantyCostConfigParameterOption[] | null;
  /** Only populated for `control: 'DATE_RANGE'` parameters (e.g. `claimDate`). */
  validation: {
    minDate?: string;
    /** Literal `"$TODAY"` — resolved client-side, not a real ISO date. */
    maxDate?: string;
    maxRangeDays?: number;
    requireBothBounds?: boolean;
  } | null;
  layout: { row: number; span: number } | null;
  multiple: boolean | null;
  lookup: unknown | null;
}

export interface WarrantyCostConfigColumn {
  field: string;
  label: string;
  dataType: string;
  format: string | null;
  align: 'left' | 'right' | 'center' | string;
  sortable: boolean;
  aggregate: 'SUM' | null;
  columnType: string;
  editable: boolean;
  editValidation: unknown | null;
  action: unknown | null;
  displayHints: Record<string, unknown>;
  defaultVisible: boolean;
  visible: boolean;
}

export interface WarrantyCostConfigColumnGroup {
  key: string;
  label: string;
  visibleWhen: unknown | null;
  columns: WarrantyCostConfigColumn[];
}

export interface WarrantyCostConfig {
  reportCode: string;
  title: string;
  configVersion: string;
  context: WarrantyCostConfigContext;
  parameters: WarrantyCostConfigParameter[];
  columnGroups: WarrantyCostConfigColumnGroup[];
  export: { formats: string[] };
  paging: { defaultPageSize: number; maxPageSize: number };
}
