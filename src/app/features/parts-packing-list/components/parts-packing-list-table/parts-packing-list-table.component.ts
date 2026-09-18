import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';
import { TableColumn } from '../../../../shared/ui/data-table/models/table-column.model';
import { PartsPackingListRow } from '../../models/parts-packing-list-row.model';

/**
 * Presentational table for Parts Packing List — composes the shared, generic
 * `DataTableComponent`, but unlike every other report's table, `columns` is supplied
 * entirely by the caller (derived per-fetch from the first response row, in
 * `PartsPackingListService`) rather than a fixed `*-column-definitions.ts` file —
 * parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md.
 */
@Component({
  selector: 'app-parts-packing-list-table',
  imports: [DataTableComponent],
  templateUrl: './parts-packing-list-table.component.html',
  styleUrl: './parts-packing-list-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartsPackingListTableComponent {
  readonly rows = input<PartsPackingListRow[]>([]);
  readonly columns = input<TableColumn<PartsPackingListRow>[]>([]);
  readonly loading = input(false);
}
