export type DealerLedgerTransactionType =
  | 'Invoice'
  | 'Payment'
  | 'Credit Note'
  | 'Debit Note'
  | 'Adjustment';

export type DealerLedgerStatus = 'Posted' | 'Pending' | 'Reconciled' | 'Disputed';

/**
 * Table-row view model for a single Dealer Ledger entry.
 *
 * Confirmed field set: Dealer Code, Dealer Name, Invoice Number, Invoice Date, Transaction
 * Type, Debit, Credit, Balance, Branch, State, City, Status. `id` is a synthetic row
 * identifier (not a business field) used for table trackBy/selection.
 *
 * Extends `Record<string, unknown>` to satisfy the generic, reusable Data Table's `T`
 * constraint (see `shared/ui/data-table`) — required for this row shape to be usable with
 * that component, with no change to its own fields.
 */
export interface DealerLedgerRow extends Record<string, unknown> {
  id: string;
  dealerCode: string;
  dealerName: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO 8601 date
  transactionType: DealerLedgerTransactionType;
  debit: number;
  credit: number;
  balance: number;
  branch: string;
  state: string;
  city: string;
  status: DealerLedgerStatus;
}
