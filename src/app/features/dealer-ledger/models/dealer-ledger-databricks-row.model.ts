/**
 * Raw row shape returned by `GET /dealer-ledger/fetchDatabricksdata` — a flat array of
 * rows straight from the Databricks-backed source, with no pagination/summary wrapper
 * and no `effectiveColumns`. Distinct from `DealerLedgerApiResponseRow` (the
 * `reports/DEALER_LEDGER/data` contract); `DealerLedgerService` maps this onto the app's
 * internal `DealerLedgerRow` instead.
 */
export interface DealerLedgerDatabricksRow {
  dealer_code?: string;
  dealer_name?: string;
  dealer_address?: string;
  credit_control_area?: string | null;
  sort_grp?: number;
  doc_type?: string | null;
  doc_reference_no?: string | null;
  line_item?: number | null;
  doc_date?: string | null;
  post_date?: string | null;
  assignment?: string | null;
  narration_veh_descr?: string | null;
  text_f?: string | null;
  currency?: string | null;
  debit_amount?: number | null;
  credit_amount?: number | null;
  vehicle_text?: string | null;
  amount?: number | null;
  running_balance?: number | null;
}
