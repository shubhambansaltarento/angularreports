import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DealerLedgerStore } from '../../store/dealer-ledger.store';

/**
 * Dealer Ledger detail page — lazy-loaded route target for a single dealer's ledger.
 *
 * TODO: Resolve/load the selected dealer's ledger entries via the store and render detail content.
 */
@Component({
  selector: 'app-dealer-ledger-detail',
  imports: [],
  templateUrl: './dealer-ledger-detail.component.html',
  styleUrl: './dealer-ledger-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerDetailComponent {
  private readonly store = inject(DealerLedgerStore);

  // TODO: bind to the :dealerCode route param, e.g.
  // readonly dealerCode = input.required<string>();

  // TODO: select the corresponding ledger entry/entries from the store
}
