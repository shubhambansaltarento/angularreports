/** Computed totals for a Warranty Cost statement — the reference PDF's summed columns plus the yellow-highlighted summary block. */
export interface WarrantyCostSummary {
  totalNdpRate: number;
  totalExcise: number;
  totalSalesTax: number;
  totalLabour: number;
  totalOctroi: number;
  totalServiceTax: number;
  totalCost: number;
  partsValue: number;
  totalFreight: number;
  totalDemurrage: number;
  totalValue: number;
}
