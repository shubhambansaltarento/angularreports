/**
 * Real response shape returned by `POST reports/DEALER_LEDGER/data`
 * (data-api-response-mapping-16-09-2026-03_00_PM.md) — distinct from the app's internal
 * `DealerLedgerResponse`, which `DealerLedgerService.getEntries()` maps this onto.
 *
 * Each row only carries whatever fields the backend actually populated for it — not
 * every field in `effectiveColumns` — so every field here is optional.
 */
export interface DealerLedgerApiResponseRow {
  dealerCode?: string;
  dealerName?: string;
  dealerAddress?: string;
  docType?: string;
  docReferenceNo?: string;
  docDate?: string;
  postingDate?: string;
  assignment?: string;
  cca?: string;
  textDec?: string;
  vehicleNarration?: string;
  debit?: number;
  credit?: number;
  currency?: string;
  text?: string;
  qnt?: number;
  amt?: number;
  runningBalance?: number;
  /** Present only when the matching "Include Details" checkbox was checked — backend-adds-checkbox-support-16-09-2026-05_24_PM.md. */
  oeRefNo?: string;
  spRefNo?: string;
  acRefNo?: string;
  evRefNo?: string;
  acwshRefNo?: string;
  cblRefNo?: string;
}

export interface DealerLedgerApiResponseTotals {
  debit: number;
  credit: number;
}

export interface DealerLedgerApiResponsePaging {
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

/**
 * One entry in the `/data` response's `effectiveColumns` — a currently-applicable column
 * key plus whether it should be visible by default in the column picker
 * (effective-columns-shape-change-17-09-2026-05_41_AM.md). Replaced the earlier flat
 * `string[]` shape.
 */
export interface DealerLedgerEffectiveColumn {
  columnName: string;
  isDefault: boolean;
}

export interface DealerLedgerApiResponse {
  reportCode: string;
  configVersion: string;
  effectiveColumns: DealerLedgerEffectiveColumn[];
  rows: DealerLedgerApiResponseRow[];
  totals: DealerLedgerApiResponseTotals;
  paging: DealerLedgerApiResponsePaging;
}
