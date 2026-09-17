import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Header for the Dealer Ledger page — just a centered title
 * (header-center-align-single-row-identity-fields-17-09-2026-06_05_AM.md). Previously also
 * showed a live entry count; removed entirely per that spec, not merely hidden.
 */
@Component({
  selector: 'app-dealer-ledger-toolbar',
  imports: [],
  templateUrl: './dealer-ledger-toolbar.component.html',
  styleUrl: './dealer-ledger-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerToolbarComponent {
  readonly title = input('Dealer Ledger');
}
