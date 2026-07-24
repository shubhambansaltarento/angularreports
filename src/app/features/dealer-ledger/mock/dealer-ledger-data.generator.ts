import { DealerLedgerRow, DealerLedgerStatus, DealerLedgerTransactionType } from '../models/dealer-ledger-row.model';
import { DealerLedgerSummary } from '../models/dealer-ledger-summary.model';

interface DealerMaster {
  dealerCode: string;
  dealerName: string;
  branch: string;
  state: string;
  city: string;
}

/**
 * Fixed dealer master data — code/name/branch/state/city stay constant per dealer.
 * Only transaction-specific fields (invoice number/date/type/amounts/status) are
 * randomized per generated row, so the mock data reads like a real dealer network
 * rather than 50 unrelated one-off dealers.
 */
const DEALER_MASTER_POOL: readonly DealerMaster[] = [
  { dealerCode: 'DLR-001', dealerName: 'Northgate Motors', branch: 'West Branch', state: 'Maharashtra', city: 'Mumbai' },
  { dealerCode: 'DLR-002', dealerName: 'Southbay Auto Group', branch: 'South Branch', state: 'Karnataka', city: 'Bengaluru' },
  { dealerCode: 'DLR-003', dealerName: 'Lakeside Dealership', branch: 'North Branch', state: 'Delhi', city: 'New Delhi' },
  { dealerCode: 'DLR-004', dealerName: 'Highway Auto Hub', branch: 'South Branch', state: 'Tamil Nadu', city: 'Chennai' },
  { dealerCode: 'DLR-005', dealerName: 'Metro Motors', branch: 'West Branch', state: 'Gujarat', city: 'Ahmedabad' },
  { dealerCode: 'DLR-006', dealerName: 'Prime Auto Dealers', branch: 'South Branch', state: 'Telangana', city: 'Hyderabad' },
  { dealerCode: 'DLR-007', dealerName: 'Sunrise Motors', branch: 'East Branch', state: 'West Bengal', city: 'Kolkata' },
  { dealerCode: 'DLR-008', dealerName: 'Capital Vehicles', branch: 'North Branch', state: 'Rajasthan', city: 'Jaipur' },
  { dealerCode: 'DLR-009', dealerName: 'Horizon Auto', branch: 'North Branch', state: 'Uttar Pradesh', city: 'Lucknow' },
  { dealerCode: 'DLR-010', dealerName: 'Elite Motors', branch: 'South Branch', state: 'Kerala', city: 'Kochi' },
  { dealerCode: 'DLR-011', dealerName: 'Coastal Motors', branch: 'West Branch', state: 'Maharashtra', city: 'Pune' },
  { dealerCode: 'DLR-012', dealerName: 'Summit Auto Group', branch: 'South Branch', state: 'Karnataka', city: 'Mysuru' },
];

const TRANSACTION_TYPES: readonly DealerLedgerTransactionType[] = [
  'Invoice',
  'Payment',
  'Credit Note',
  'Debit Note',
  'Adjustment',
];

const STATUSES: readonly DealerLedgerStatus[] = ['Posted', 'Pending', 'Reconciled', 'Disputed'];

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDateWithinDays(daysBack: number): string {
  const offsetMs = Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - offsetMs).toISOString().slice(0, 10);
}

/** Credit-natured transaction types reduce a dealer's outstanding balance; the rest increase it. */
function isCreditNatured(transactionType: DealerLedgerTransactionType): boolean {
  return transactionType === 'Payment' || transactionType === 'Credit Note';
}

/**
 * Generates realistic, internally-consistent mock Dealer Ledger rows. Dealer master data
 * is fixed per dealer; `balance` is a genuine running total per dealer ordered by invoice
 * date (not an unrelated random number), so the mock data behaves like a real ledger.
 */
export function generateDealerLedgerRows(count = 50): DealerLedgerRow[] {
  const draftRows: DealerLedgerRow[] = Array.from({ length: count }, (_, index) => {
    const dealer = randomItem(DEALER_MASTER_POOL);
    const transactionType = randomItem(TRANSACTION_TYPES);
    const amount = randomAmount(500, 50000);
    const isCredit = isCreditNatured(transactionType);

    return {
      id: `row-${index + 1}`,
      dealerCode: dealer.dealerCode,
      dealerName: dealer.dealerName,
      invoiceNumber: `INV-${(100000 + index).toString()}`,
      invoiceDate: randomDateWithinDays(90),
      transactionType,
      debit: isCredit ? 0 : amount,
      credit: isCredit ? amount : 0,
      balance: 0, // computed by computeRunningBalances below
      branch: dealer.branch,
      state: dealer.state,
      city: dealer.city,
      status: randomItem(STATUSES),
    };
  });

  return computeRunningBalances(draftRows);
}

function computeRunningBalances(rows: DealerLedgerRow[]): DealerLedgerRow[] {
  const byDealer = new Map<string, DealerLedgerRow[]>();
  for (const row of rows) {
    const group = byDealer.get(row.dealerCode) ?? [];
    group.push(row);
    byDealer.set(row.dealerCode, group);
  }

  for (const group of byDealer.values()) {
    group.sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate));
    let runningBalance = 0;
    for (const row of group) {
      runningBalance += row.debit - row.credit;
      row.balance = Math.round(runningBalance * 100) / 100;
    }
  }

  return rows;
}

/**
 * Computes the aggregate summary for a given set of rows (typically the currently
 * filtered/searched result set, not just the current page — an aggregate should
 * reflect the whole matching set, per the Enterprise Reporting Engine Specification's
 * shared Aggregation contract).
 *
 * TODO: Confirm the intended meaning of "closing balance" across a multi-dealer result
 * set with product — computed here as net movement (total debit - total credit) for the
 * current scope, not any single dealer's own running balance.
 */
export function computeDealerLedgerSummary(rows: DealerLedgerRow[]): DealerLedgerSummary {
  const totals = rows.reduce(
    (acc, row) => ({
      totalDebit: acc.totalDebit + row.debit,
      totalCredit: acc.totalCredit + row.credit,
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
