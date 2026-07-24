export type DealerLedgerColumnDataType = 'text' | 'number' | 'date' | 'currency' | 'boolean';

export type DealerLedgerColumnPin = 'start' | 'end' | null;

/**
 * Column definition for the Dealer Ledger table, per the Enterprise Data Table
 * Specification's `ColumnDefinition` contract (§7.1/§9), scoped to this feature.
 *
 * TODO: Confirm the final column set once the Dealer Ledger business requirements are specified.
 */
export interface DealerLedgerColumn {
  key: string;
  headerLabel: string;
  dataType: DealerLedgerColumnDataType;
  sortable: boolean;
  filterable: boolean;
  hidden: boolean;
  pinned: DealerLedgerColumnPin;
  order: number;
  width?: number;
}
