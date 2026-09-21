/**
 * Real config shape returned by `GET {baseUrl}reports/PARTS_PACKING_LIST/config` — confirmed
 * live (the plain `/parts-packing-list/config` path also exists but returns a thinner shape
 * with no `context`/Company Code default; this generic, report-keyed endpoint is the real
 * source of truth, same as every other report). This report's own UI still never shows
 * Dealer Code/Name (parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md) — the
 * config is used only to source `dealerCode`/`companyCode` for the data request.
 */
export interface PartsPackingListConfigContext {
  dealerCode: string;
  dealerDescription: string;
}

export interface PartsPackingListConfigParameter {
  name: string;
  label: string;
  defaultValue: unknown;
}

export interface PartsPackingListConfig {
  reportCode: string;
  title: string;
  context: PartsPackingListConfigContext;
  parameters: PartsPackingListConfigParameter[];
}
