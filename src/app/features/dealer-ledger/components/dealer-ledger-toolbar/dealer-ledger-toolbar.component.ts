import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Header/toolbar for the Dealer Ledger page — title and current record count.
 *
 * The count region is `role="status"`/`aria-live="polite"` so assistive tech announces
 * changes (e.g. "42 entries" after a search) without the user needing to re-focus it, and
 * shows a loading skeleton (rather than a layout-shifting text swap) while `loading()` is true.
 *
 * TODO: Add export/print/refresh actions (Button/export-menu primitives from the Shared
 * component library) once those are needed — export is explicitly out of scope for now.
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
  /** Total entries matching the current filters (not the current page size). */
  readonly totalCount = input(0);
  readonly loading = input(false);
}
