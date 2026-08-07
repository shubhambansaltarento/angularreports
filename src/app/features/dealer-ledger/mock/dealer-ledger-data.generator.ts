import { DealerLedgerDocType, DealerLedgerRow } from '../models/dealer-ledger-row.model';
import { DealerLedgerSummary } from '../models/dealer-ledger-summary.model';

interface DealerMaster {
  dealerCode: string;
  dealerName: string;
  dealerAddress: string;
  currency: string;
}

/**
 * Fixed dealer master data — code/name/address/currency stay constant per dealer. Only
 * transaction-specific fields are randomized per generated row, so the mock data reads
 * like a real dealer network rather than unrelated one-off dealers.
 */
const DEALER_MASTER_POOL: readonly DealerMaster[] = [
  { dealerCode: 'DLR-001', dealerName: 'Northgate Motors', dealerAddress: 'West Branch, Mumbai, Maharashtra', currency: 'INR' },
  { dealerCode: 'DLR-002', dealerName: 'Southbay Auto Group', dealerAddress: 'South Branch, Bengaluru, Karnataka', currency: 'INR' },
  { dealerCode: 'DLR-003', dealerName: 'Lakeside Dealership', dealerAddress: 'North Branch, New Delhi, Delhi', currency: 'INR' },
  { dealerCode: 'DLR-004', dealerName: 'Highway Auto Hub', dealerAddress: 'South Branch, Chennai, Tamil Nadu', currency: 'INR' },
  { dealerCode: 'DLR-005', dealerName: 'Metro Motors', dealerAddress: 'West Branch, Ahmedabad, Gujarat', currency: 'INR' },
  { dealerCode: 'DLR-006', dealerName: 'Prime Auto Dealers', dealerAddress: 'South Branch, Hyderabad, Telangana', currency: 'INR' },
  { dealerCode: 'DLR-007', dealerName: 'Sunrise Motors', dealerAddress: 'East Branch, Kolkata, West Bengal', currency: 'INR' },
  { dealerCode: 'DLR-008', dealerName: 'Capital Vehicles', dealerAddress: 'North Branch, Jaipur, Rajasthan', currency: 'INR' },
  { dealerCode: 'DLR-009', dealerName: 'Horizon Auto', dealerAddress: 'North Branch, Lucknow, Uttar Pradesh', currency: 'INR' },
  { dealerCode: 'DLR-010', dealerName: 'Elite Motors', dealerAddress: 'South Branch, Kochi, Kerala', currency: 'INR' },
  { dealerCode: 'DLR-011', dealerName: 'Coastal Motors', dealerAddress: 'West Branch, Pune, Maharashtra', currency: 'INR' },
  { dealerCode: 'DLR-012', dealerName: 'Summit Auto Group', dealerAddress: 'South Branch, Mysuru, Karnataka', currency: 'INR' },
];

const DOC_TYPES: readonly DealerLedgerDocType[] = ['Invoice', 'Payment', 'Credit Note', 'Debit Note', 'Adjustment'];

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinDays(daysBack: number): string {
  const offsetMs = Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - offsetMs).toISOString().slice(0, 10);
}

/** Credit-natured doc types reduce a dealer's outstanding balance; the rest increase it. */
function isCreditNatured(docType: DealerLedgerDocType): boolean {
  return docType === 'Payment' || docType === 'Credit Note';
}

/**
 * Generates realistic, internally-consistent mock Dealer Ledger rows. Dealer master data
 * is fixed per dealer; `amt` is a genuine running total per dealer ordered by doc date
 * (not an unrelated random number), so the mock data behaves like a real ledger.
 */
export function generateDealerLedgerRows(count = 50): DealerLedgerRow[] {
  const draftRows: DealerLedgerRow[] = Array.from({ length: count }, (_, index) => {
    const dealer = randomItem(DEALER_MASTER_POOL);
    const docType = randomItem(DOC_TYPES);
    const amount = randomAmount(500, 50000);
    const isCredit = isCreditNatured(docType);

    return {
      id: `row-${index + 1}`,
      dealerCode: dealer.dealerCode,
      dealerName: dealer.dealerName,
      dealerAddress: dealer.dealerAddress,
      docType,
      docReferenceNo: `DOC-${(100000 + index).toString()}`,
      docDate: randomDateWithinDays(90),
      assignment: `ASG-${randomInt(1000, 9999)}`,
      cca: `CCA-${randomInt(10, 99)}`,
      textDec: docType,
      narrationVehDescription: `${docType} — Vehicle/Spares transaction`,
      debitAmount: isCredit ? 0 : amount,
      creditAmount: isCredit ? amount : 0,
      currency: dealer.currency,
      text: `${docType} for ${dealer.dealerName}`,
      qnt: randomInt(1, 20),
      amt: 0, // computed by computeRunningAmounts below
    };
  });

  return computeRunningAmounts(draftRows);
}

function computeRunningAmounts(rows: DealerLedgerRow[]): DealerLedgerRow[] {
  const byDealer = new Map<string, DealerLedgerRow[]>();
  for (const row of rows) {
    const group = byDealer.get(row.dealerCode) ?? [];
    group.push(row);
    byDealer.set(row.dealerCode, group);
  }

  for (const group of byDealer.values()) {
    group.sort((a, b) => a.docDate.localeCompare(b.docDate));
    let runningAmount = 0;
    for (const row of group) {
      runningAmount += row.debitAmount - row.creditAmount;
      row.amt = Math.round(runningAmount * 100) / 100;
    }
  }

  return rows;
}

/**
 * Computes the aggregate summary for a given set of rows (typically the currently
 * filtered/searched result set, not just the current page — an aggregate should
 * reflect the whole matching set, per the Enterprise Reporting Engine Specification's
 * shared Aggregation contract).
 */
export function computeDealerLedgerSummary(rows: DealerLedgerRow[]): DealerLedgerSummary {
  const totals = rows.reduce(
    (acc, row) => ({
      totalDebit: acc.totalDebit + row.debitAmount,
      totalCredit: acc.totalCredit + row.creditAmount,
      entryCount: acc.entryCount + 1,
    }),
    { totalDebit: 0, totalCredit: 0, entryCount: 0 },
  );

  return {
    totalDebit: Math.round(totals.totalDebit * 100) / 100,
    totalCredit: Math.round(totals.totalCredit * 100) / 100,
    closingBalance: Math.round((totals.totalDebit - totals.totalCredit) * 100) / 100,
    entryCount: totals.entryCount,
  };
}

/** Generated once per module load — the in-memory "database" backing the mock service. */
export const DEALER_LEDGER_MOCK_ROWS: DealerLedgerRow[] = generateDealerLedgerRows(50);
