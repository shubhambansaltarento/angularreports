import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ColumnSettingsItem } from './models/column-settings-item.model';

/**
 * Reusable, domain-agnostic column configuration panel: hide/show, reorder (move up/down),
 * pin (start/end/none), search-by-name, and restore-to-default. Plain inputs/outputs only —
 * no dependency on `DataTableComponent` or any CDK table API — so it can be reused anywhere
 * a column list needs the same controls, not just inside the Data Table's toolbar.
 */
@Component({
  selector: 'app-data-table-column-settings',
  imports: [],
  templateUrl: './data-table-column-settings.component.html',
  styleUrl: './data-table-column-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableColumnSettingsComponent {
  /** Columns in their current display order. */
  readonly columns = input.required<ColumnSettingsItem[]>();

  /** Renders the per-column pin selector — the Data Table turns it off so nothing can jump past its locked columns. */
  readonly showPinControls = input(true);

  readonly toggleVisibility = output<string>();
  readonly moveUp = output<string>();
  readonly moveDown = output<string>();
  readonly pin = output<{ key: string; pinned: 'start' | 'end' | null }>();
  readonly restoreDefaults = output<void>();

  protected readonly searchTerm = signal('');

  /** Filters the *displayed* list only — reordering always acts on the full `columns()` order. */
  protected readonly filteredColumns = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const columns = this.columns();
    return term ? columns.filter((column) => column.header.toLowerCase().includes(term)) : columns;
  });

  protected onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onPinChange(key: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pin.emit({ key, pinned: value === 'start' || value === 'end' ? value : null });
  }

  /** False for the first column, a locked column, or one sitting just after a locked column. */
  protected canMoveUp(key: string): boolean {
    return this.canMoveBy(key, -1);
  }

  /** False for the last column, a locked column, or one sitting just before a locked column. */
  protected canMoveDown(key: string): boolean {
    return this.canMoveBy(key, 1);
  }

  private canMoveBy(key: string, delta: number): boolean {
    const columns = this.columns();
    const index = columns.findIndex((column) => column.key === key);
    const neighbour = columns[index + delta];
    return index !== -1 && !!neighbour && !columns[index].locked && !neighbour.locked;
  }
}
