/**
 * Real config shape returned by `GET {baseUrl}reports/WARRANTY_COST/config`, confirmed live
 * (this endpoint exists — the plain `/warranty-cost/config` path does not, which earlier led
 * to the mistaken assumption that no config endpoint exists for this report at all).
 */
export interface WarrantyCostConfigContext {
  dealerCode: string;
  dealerDescription: string;
}

export interface WarrantyCostConfigParameter {
  name: string;
  label: string;
  defaultValue: unknown;
}

export interface WarrantyCostConfig {
  reportCode: string;
  title: string;
  configVersion: string;
  context: WarrantyCostConfigContext;
  parameters: WarrantyCostConfigParameter[];
}
