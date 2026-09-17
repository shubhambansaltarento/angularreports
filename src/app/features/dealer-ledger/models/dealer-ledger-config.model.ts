/**
 * Typed subset of the `reports/DEALER_LEDGER/config` API response actually consumed by
 * the UI (per map-config-response-to-ui-16-09-2026-02_41_PM.md) — the full response also carries
 * `columnGroups`, `paging`, `dateRangeConstraints`, etc., which are not yet wired to
 * anything and are intentionally left untyped/unused here.
 */
export interface DealerLedgerConfigContext {
  dealerCode: string;
  dealerDescription: string;
}

export interface DealerLedgerConfigParameter {
  name: string;
  label: string;
  defaultValue: unknown;
}

export interface DealerLedgerConfigExport {
  /** Backend format names, e.g. `"XLSX"`, `"PDF"`, `"CSV"`, `"PRINT"`. */
  formats: string[];
}

export interface DealerLedgerConfig {
  /** Echoed back on every data request — data-api-request-contract-16-09-2026-02_48_PM.md. */
  configVersion: string;
  context: DealerLedgerConfigContext;
  parameters: DealerLedgerConfigParameter[];
  export: DealerLedgerConfigExport;
}
