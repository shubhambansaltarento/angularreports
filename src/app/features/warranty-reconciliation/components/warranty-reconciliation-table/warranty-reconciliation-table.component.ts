import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DataTableCellTemplateDirective } from '../../../../shared/ui/data-table/data-table-cell-template.directive';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';
import { ExportFormat } from '../../../../shared/services/export/models/export-format.model';
import { buildReportExportFilename } from '../../../../shared/services/export/utils/report-export-filename';
import {
  WARRANTY_RECONCILIATION_DEFAULT_COLUMNS,
  toWarrantyReconciliationColumns,
} from '../../constants/warranty-reconciliation-column-definitions';
import { WARRANTY_RECONCILIATION_DEFAULT_PAGE_SIZE, WARRANTY_RECONCILLATION_REPORT_KEY } from '../../constants/warranty-reconciliation.constants';
import { WarrantyReconciliationEffectiveColumn } from '../../models/warranty-reconciliation-api-response.model';
import { WarrantyReconciliationRow } from '../../models/warranty-reconciliation-row.model';

/**
 * Presentational table for Warranty Reconciliation entries — composes the shared, completely
 * generic `DataTableComponent` with this report's own column definitions, mirroring
 * `WarrantyCostTableComponent`. `reconciliationDate` renders via `DatePipe`, matching
 * Warranty Cost Report's `orderDate` cell template.
 */
@Component({
  selector: 'app-warranty-reconciliation-table',
  imports: [DataTableComponent, DataTableCellTemplateDirective, DatePipe],
  templateUrl: './warranty-reconciliation-table.component.html',
  styleUrl: './warranty-reconciliation-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyReconciliationTableComponent {
  readonly rows = input<WarrantyReconciliationRow[]>([]);
  readonly loading = input(false);

  /** Restricts the Export menu to these formats (mapped from the config API's `export.formats`) — `null` shows every format. */
  readonly exportFormats = input<ExportFormat[] | null>(null);

  /** The `/data` response's `effectiveColumns` — drives the table's column structure/order/default-visibility once available. */
  readonly effectiveColumns = input<WarrantyReconciliationEffectiveColumn[] | null>(null);

  /** The current dealer's name — used to build the export filename below. */
  readonly dealerName = input<string | null>(null);

  /** `WARRANTY_RECONCILLATION_{dealer name}_{timestamp}-report` — overrides the shared table's default `tableId()`-based export filename. */
  protected readonly exportFilename = computed(() => buildReportExportFilename(WARRANTY_RECONCILLATION_REPORT_KEY, this.dealerName()));

  protected readonly columns = computed(() => {
    const effectiveColumns = this.effectiveColumns();
    return effectiveColumns ? toWarrantyReconciliationColumns(effectiveColumns) : WARRANTY_RECONCILIATION_DEFAULT_COLUMNS;
  });

  protected readonly initialPageSize = WARRANTY_RECONCILIATION_DEFAULT_PAGE_SIZE;
}
