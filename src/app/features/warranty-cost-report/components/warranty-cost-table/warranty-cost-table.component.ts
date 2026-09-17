import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DataTableCellTemplateDirective } from '../../../../shared/ui/data-table/data-table-cell-template.directive';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';
import { ExportFormat } from '../../../../shared/services/export/models/export-format.model';
import { buildReportExportFilename } from '../../../../shared/services/export/utils/report-export-filename';
import { WARRANTY_COST_DEFAULT_COLUMNS, toWarrantyCostColumns } from '../../constants/warranty-cost-column-definitions';
import { WARRANTY_COST_DEFAULT_PAGE_SIZE, WARRANTY_COST_REPORT_KEY } from '../../constants/warranty-cost.constants';
import { WarrantyCostEffectiveColumn } from '../../models/warranty-cost-api-response.model';
import { WarrantyCostRow } from '../../models/warranty-cost-row.model';

/**
 * Presentational table for Warranty Cost Report entries — composes the shared, completely
 * generic `DataTableComponent` with this report's own column definitions and cell
 * formatting, mirroring `DealerLedgerTableComponent` —
 * api-integration-dealer-ledger-style-17-09-2026-07_38_AM.md.
 */
@Component({
  selector: 'app-warranty-cost-table',
  imports: [DataTableComponent, DataTableCellTemplateDirective, DatePipe],
  templateUrl: './warranty-cost-table.component.html',
  styleUrl: './warranty-cost-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyCostTableComponent {
  readonly rows = input<WarrantyCostRow[]>([]);
  readonly loading = input(false);

  /** Restricts the Export menu to these formats (mapped from the config API's `export.formats`) — `null` shows every format. */
  readonly exportFormats = input<ExportFormat[] | null>(null);

  /** The `/data` response's `effectiveColumns` — drives the table's column structure/order/default-visibility once available. */
  readonly effectiveColumns = input<WarrantyCostEffectiveColumn[] | null>(null);

  /** The current dealer's name — used to build the export filename below. */
  readonly dealerName = input<string | null>(null);

  /** `WARRANTY_COST_{dealer name}_{timestamp}-report` — overrides the shared table's default `tableId()`-based export filename. */
  protected readonly exportFilename = computed(() => buildReportExportFilename(WARRANTY_COST_REPORT_KEY, this.dealerName()));

  protected readonly columns = computed(() => {
    const effectiveColumns = this.effectiveColumns();
    return effectiveColumns ? toWarrantyCostColumns(effectiveColumns) : WARRANTY_COST_DEFAULT_COLUMNS;
  });

  protected readonly initialPageSize = WARRANTY_COST_DEFAULT_PAGE_SIZE;
}
