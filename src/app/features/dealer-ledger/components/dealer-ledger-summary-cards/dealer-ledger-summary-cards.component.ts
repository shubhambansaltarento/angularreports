import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DealerLedgerSummary } from '../../models/dealer-ledger-summary.model';

interface DealerLedgerSummaryCardItem {
  key: string;
  label: string;
  value: number;
  format: 'currency' | 'number';
  /** Explains the aggregate on hover — these are computed values, not raw fields. */
  tooltip: string;
}

/**
 * Aggregate summary cards for the current Dealer Ledger result set (Total Debit, Total
 * Credit, Closing Balance, Entry Count) — sourced from `DealerLedgerResponse.summary`,
 * which the mock backend computes over the full filtered/searched set, not just one page.
 *
 * Renders as a `<dl>` (label/value pairs are a description list, semantically) with a
 * loading skeleton in place of the cards while `loading()` is true and no summary has
 * loaded yet, and `aria-busy` on the group for the same state.
 */
@Component({
  selector: 'app-dealer-ledger-summary-cards',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './dealer-ledger-summary-cards.component.html',
  styleUrl: './dealer-ledger-summary-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerSummaryCardsComponent {
  readonly summary = input<DealerLedgerSummary | null>(null);
  readonly loading = input(false);

  /** Fixed placeholder count for the loading skeleton — matches the number of real cards. */
  protected readonly skeletonIndexes = [0, 1, 2, 3];

  protected readonly cards = computed<DealerLedgerSummaryCardItem[]>(() => {
    const summary = this.summary();
    if (!summary) return [];

    return [
      {
        key: 'totalDebit',
        label: 'Total Debit',
        value: summary.totalDebit,
        format: 'currency',
        tooltip: 'Sum of all debit amounts in the current filtered result set',
      },
      {
        key: 'totalCredit',
        label: 'Total Credit',
        value: summary.totalCredit,
        format: 'currency',
        tooltip: 'Sum of all credit amounts in the current filtered result set',
      },
      {
        key: 'closingBalance',
        label: 'Closing Balance',
        value: summary.closingBalance,
        format: 'currency',
        tooltip: 'Net movement (Total Debit minus Total Credit) for the current filtered result set',
      },
      {
        key: 'entryCount',
        label: 'Entries',
        value: summary.entryCount,
        format: 'number',
        tooltip: 'Number of ledger entries in the current filtered result set',
      },
    ];
  });
}
