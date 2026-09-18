/**
 * Real `GET /parts-packing-list/config` response shape — confirmed live. Unlike Dealer
 * Ledger/Warranty reports, there is no `context`/`export` section: this report's own UI
 * never shows Dealer Code/Name (parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md),
 * so this config is fetched (and logged) but nothing in it drives the rendered UI.
 */
export interface PartsPackingListConfigParameter {
  name: string;
  label: string;
  dataType: string;
  required: boolean;
}

export interface PartsPackingListConfig {
  reportCode: string;
  title: string;
  parameters: PartsPackingListConfigParameter[];
}
