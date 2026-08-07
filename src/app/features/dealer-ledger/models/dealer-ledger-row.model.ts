export type DealerLedgerDocType = 'Invoice' | 'Payment' | 'Credit Note' | 'Debit Note' | 'Adjustment';

/**
 * Table-row view model for a single Dealer Ledger entry, per the confirmed column set:
 * Dealer Code, Doc. Type, Doc. Reference No., Doc. Date, Assignment, CCA, Text Dec.,
 * Narration/Veh. Description, Debit Amount, Credit Amount, Dealer Name, Dealer Address,
 * Currency, Text, QNT., Amt. `id` is a synthetic row identifier (not a business field)
 * used for table trackBy/selection.
 *
 * Extends `Record<string, unknown>` to satisfy the generic, reusable Data Table's `T`
 * constraint (see `shared/ui/data-table`) — required for this row shape to be usable with
 * that component, with no change to its own fields.
 */
export interface DealerLedgerRow extends Record<string, unknown> {
  id: string;
  dealerCode: string;
  dealerName: string;
  dealerAddress: string;
  docType: DealerLedgerDocType;
  docReferenceNo: string;
  docDate: string; // ISO 8601 date
  assignment: string;
  cca: string;
  textDec: string;
  narrationVehDescription: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  text: string;
  qnt: number;
  amt: number;
}
