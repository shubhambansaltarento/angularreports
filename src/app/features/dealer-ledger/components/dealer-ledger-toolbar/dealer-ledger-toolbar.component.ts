import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReportDealerIdentityComponent } from '../../../../shared/ui/report-dealer-identity/report-dealer-identity.component';
import { ReportHeaderBarComponent } from '../../../../shared/ui/report-header-bar/report-header-bar.component';

/**
 * Header for the Dealer Ledger page — a blue report header bar
 * (legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md) plus a centered title
 * (header-center-align-single-row-identity-fields-17-09-2026-06_05_AM.md), plus the small
 * left-aligned dealer identity line (dealer-identity-line-below-header-bar-21-09-2026-05_00_PM.md).
 * Previously also showed a live entry count; removed entirely per that spec, not merely
 * hidden.
 */
@Component({
  selector: 'app-dealer-ledger-toolbar',
  imports: [ReportHeaderBarComponent, ReportDealerIdentityComponent],
  templateUrl: './dealer-ledger-toolbar.component.html',
  styleUrl: './dealer-ledger-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerToolbarComponent {
  readonly title = input('Dealer Ledger');
  readonly dealerCode = input('');
  readonly dealerName = input('');
}
