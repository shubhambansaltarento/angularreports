import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, viewChild } from '@angular/core';
import { DataTableCellTemplateDirective } from '../../../../shared/ui/data-table/data-table-cell-template.directive';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';
import { ExportFormat } from '../../../../shared/services/export/models/export-format.model';
import { buildReportExportFilename } from '../../../../shared/services/export/utils/report-export-filename';
import { DEALER_LEDGER_DEFAULT_COLUMNS, toDealerLedgerColumns } from '../../constants/dealer-ledger-column-definitions';
import { DEALER_LEDGER_DEFAULT_PAGE_SIZE, DEALER_LEDGER_REPORT_KEY } from '../../constants/dealer-ledger.constants';
import { DealerLedgerEffectiveColumn } from '../../models/dealer-ledger-api-response.model';
import { DealerLedgerRow } from '../../models/dealer-ledger-row.model';

/**
 * Presentational table for Dealer Ledger entries — composes the shared, completely
 * generic `DataTableComponent` (shared/ui/data-table) with Dealer-Ledger-specific column
 * definitions, cell formatting (currency/date), per-cell tooltips, and empty-state copy.
 * Owns no data-fetching logic itself; `rows`/`loading` are supplied by the list page from
 * `DealerLedgerStore`. The data API is not paginated — `rows` is always the full matching
 * result set (api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md) — so pagination/sorting
 * are entirely the shared table's own default client-side behavior; nothing here overrides
 * it. Loading skeleton, error-free "no data" state, and OnPush/Signals change detection are
 * likewise all inherited from the shared table.
 */
@Component({
  selector: 'app-dealer-ledger-table',
  imports: [DataTableComponent, DataTableCellTemplateDirective, CurrencyPipe, DatePipe],
  templateUrl: './dealer-ledger-table.component.html',
  styleUrl: './dealer-ledger-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealerLedgerTableComponent {
  readonly rows = input<DealerLedgerRow[]>([]);
  readonly loading = input(false);

  /** Disables the table header's Reset control — "no filter is currently active", per the filter panel. */
  readonly resetDisabled = input(false);

  /** Fires when the table header's Reset control is clicked — the list page clears filters/checkboxes in response. */
  readonly reset = output<void>();

  /** Restricts the Export menu to these formats (mapped from the config API's `export.formats`) — `null` shows every format. */
  readonly exportFormats = input<ExportFormat[] | null>(null);

  /**
   * The `/data` response's `effectiveColumns` (effective-columns-drive-table-headers-16-09-2026-03_59_PM.md,
   * effective-columns-shape-change-17-09-2026-05_41_AM.md) — drives the table's column
   * structure/order/default-visibility once available. `null` before any real response has
   * supplied one, in which case the default hardcoded column set is used.
   */
  readonly effectiveColumns = input<DealerLedgerEffectiveColumn[] | null>(null);

  /** The current dealer's name — used to build the export filename below. */
  readonly dealerName = input<string | null>(null);

  /**
   * `DEALER_LEDGER_{dealer name}_{timestamp}-report` — overrides the shared table's
   * default `tableId()`-based export filename, per
   * export-panel-redesign-and-dealer-ledger-filename-17-09-2026-06_35_AM.md and
   * generic-report-export-filename-17-09-2026-06_46_AM.md (the underlying builder is
   * report-agnostic; any other report calls it with its own report-key constant).
   */
  protected readonly exportFilename = computed(() => buildReportExportFilename(DEALER_LEDGER_REPORT_KEY, this.dealerName()));

  protected readonly columns = computed(() => {
    const effectiveColumns = this.effectiveColumns();
    return effectiveColumns ? toDealerLedgerColumns(effectiveColumns) : DEALER_LEDGER_DEFAULT_COLUMNS;
  });

  /**
   * The API is not paginated — one request returns the full matching result set
   * (api-not-paginated-client-side-pagination-16-09-2026-04_35_PM.md) — so pagination is entirely the
   * shared table's own client-side concern, using this as its initial page size.
   */
  protected readonly initialPageSize = DEALER_LEDGER_DEFAULT_PAGE_SIZE;

  private readonly dataTable = viewChild.required(DataTableComponent);

  /** Restarts the underlying table's pagination at page 1 — called by the list page after Reset (spec-table-reset-pagination.md). */
  resetPagination(): void {
    this.dataTable().resetPagination();
  }
}
