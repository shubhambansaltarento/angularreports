import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  Signal,
  TemplateRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkTableModule } from '@angular/cdk/table';
import { SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';
import { ExportService } from '../../services/export/export.service';
import { ExportColumn } from '../../services/export/models/export-column.model';
import { ExportFormat } from '../../services/export/models/export-format.model';
import { DataTableColumnSettingsComponent } from './column-settings/data-table-column-settings.component';
import { ColumnSettingsItem } from './column-settings/models/column-settings-item.model';
import { DataTableCellTemplateDirective } from './data-table-cell-template.directive';
import { TableColumn } from './models/table-column.model';
import { TableColumnState } from './models/table-column-state.model';
import { TableSelectionMode } from './models/table-selection-mode.model';
import { TableSortState } from './models/table-sort-state.model';

type ExportScope = 'currentPage' | 'all';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const SEARCH_DEBOUNCE_MS = 250;
const MAX_SKELETON_ROWS = 8;
const DEFAULT_COLUMN_WIDTH_PX = 150;
const MIN_COLUMN_WIDTH_PX = 60;

/**
 * Enterprise, SAP Fiori-inspired reusable Data Table.
 *
 * Completely generic — `T` is supplied by whichever report/feature consumes it. This
 * component has no knowledge of any specific domain (e.g. Dealer Ledger); columns, data,
 * and cell content are all supplied via inputs/content projection. No API calls are made
 * here — the table only ever renders whatever `data` it is given.
 */
@Component({
  selector: 'app-data-table',
  imports: [CdkTableModule, NgTemplateOutlet, DataTableColumnSettingsComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends Record<string, unknown> = Record<string, unknown>> implements OnInit {
  /** Unique identifier for this table instance — scopes column-configuration persistence. */
  readonly tableId = input.required<string>();

  /** Column definitions. Order here is the default order (before any user reordering). */
  readonly columns = input.required<TableColumn<T>[]>();

  /** The full (unpaginated, unfiltered) dataset. */
  readonly data = input<T[]>([]);

  /** True while data is being (re-)loaded by the consuming page. */
  readonly loading = input(false);

  /** Row identity key for CDK's trackBy — falls back to index-based tracking if omitted. */
  readonly trackByKey = input<Extract<keyof T, string> | null>(null);

  readonly selectionMode = input<TableSelectionMode>('none');

  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  readonly initialPageSize = input<number>(DEFAULT_PAGE_SIZE_OPTIONS[0]);

  readonly title = input<string>('');

  /** Restricts global search to specific fields; searches every column key if omitted. */
  readonly searchableKeys = input<Extract<keyof T, string>[] | null>(null);

  /** Message shown in the empty state — lets each consumer phrase "no data" for its own domain. */
  readonly emptyStateMessage = input<string>('No records found.');

  readonly selectionChange = output<T[]>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly exportService = inject(ExportService);

  private readonly cellTemplates = contentChildren(DataTableCellTemplateDirective);

  /** Hide/show, order, width, and pin state for every column — persisted per `tableId`. */
  private readonly columnState = signal<TableColumnState[]>([]);
  protected readonly sortState = signal<TableSortState>({ columnKey: null, direction: null });
  protected readonly currentPage = signal(1);
  protected readonly pageSize: ReturnType<typeof signal<number>>;
  protected readonly searchTerm = signal('');
  protected readonly searchInputValue = signal('');
  protected readonly isColumnMenuOpen = signal(false);
  protected readonly isExportMenuOpen = signal(false);
  protected readonly exportScope = signal<ExportScope>('currentPage');
  protected readonly exportError = signal<string | null>(null);

  private readonly selectionModel: SelectionModel<T>;
  protected readonly selectedRows: Signal<T[]>;

  private searchDebounceHandle: ReturnType<typeof setTimeout> | undefined;
  private resizingKey: string | null = null;
  private resizeStartX = 0;
  private resizeStartWidthPx = 0;
  private resizeCleanup: (() => void) | null = null;

  /**
   * Visible columns, in final render order: pinned-start first, then unpinned (in the
   * user's chosen order), then pinned-end — with each column's definition merged with its
   * runtime width. Hidden columns are excluded entirely.
   */
  protected readonly visibleColumns = computed<TableColumn<T>[]>(() => {
    const definitionsByKey = new Map(this.columns().map((column) => [column.key, column]));
    const ordered: TableColumn<T>[] = [];

    for (const state of this.columnState()) {
      if (state.hidden) continue;
      const definition = definitionsByKey.get(state.key as Extract<keyof T, string>);
      if (!definition) continue;
      ordered.push({ ...definition, width: state.width ?? definition.width, pinned: state.pinned });
    }

    const startPinned = ordered.filter((column) => column.pinned === 'start');
    const unpinned = ordered.filter((column) => !column.pinned);
    const endPinned = ordered.filter((column) => column.pinned === 'end');
    return [...startPinned, ...unpinned, ...endPinned];
  });

  /** Feeds the reusable column settings panel — in the user's raw order (pin groups not yet split out). */
  protected readonly columnSettingsItems = computed<ColumnSettingsItem[]>(() => {
    const definitionsByKey = new Map(this.columns().map((column) => [column.key, column]));
    const items: ColumnSettingsItem[] = [];

    for (const state of this.columnState()) {
      const definition = definitionsByKey.get(state.key as Extract<keyof T, string>);
      if (!definition) continue;
      items.push({ key: state.key, header: definition.header, hidden: state.hidden, pinned: state.pinned });
    }

    return items;
  });

  protected readonly displayedColumnKeys = computed(() => {
    const keys: string[] = this.visibleColumns().map((column) => column.key);
    return this.selectionMode() === 'none' ? keys : ['__select__', ...keys];
  });

  protected readonly cellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<{ $implicit: unknown; column: unknown }>>();
    for (const directive of this.cellTemplates()) {
      map.set(directive.columnKey(), directive.templateRef);
    }
    return map;
  });

  protected readonly filteredData = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const rows = this.data();
    if (!term) return rows;

    const keys = this.searchableKeys() ?? this.columns().map((column) => column.key);
    return rows.filter((row) => keys.some((key) => String(row[key] ?? '').toLowerCase().includes(term)));
  });

  protected readonly sortedData = computed(() => {
    const { columnKey, direction } = this.sortState();
    const rows = this.filteredData();
    if (!columnKey || !direction) return rows;

    const factor = direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * factor;
      }
      return String(aValue ?? '').localeCompare(String(bValue ?? '')) * factor;
    });
  });

  protected readonly totalCount = computed(() => this.filteredData().length);

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));

  protected readonly pagedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedData().slice(start, start + this.pageSize());
  });

  protected readonly isInitialLoading = computed(() => this.loading() && this.data().length === 0);
  protected readonly isOverlayLoading = computed(() => this.loading() && this.data().length > 0);
  protected readonly isEmpty = computed(() => !this.loading() && this.totalCount() === 0);
  protected readonly skeletonRowIndexes = computed(() =>
    Array.from({ length: Math.min(this.pageSize(), MAX_SKELETON_ROWS) }, (_, index) => index),
  );

  protected readonly trackByFn = (index: number, row: T): unknown => {
    const key = this.trackByKey();
    return key ? row[key] : index;
  };

  constructor() {
    this.pageSize = signal(this.initialPageSize());
    this.selectionModel = new SelectionModel<T>(this.selectionMode() === 'multiple', []);
    this.selectedRows = toSignal(
      this.selectionModel.changed.pipe(map(() => this.selectionModel.selected)),
      { initialValue: this.selectionModel.selected },
    );

    effect(() => {
      this.selectionChange.emit(this.selectedRows());
    });

    effect(() => {
      const state = this.columnState();
      if (!this.isBrowser) return;
      try {
        localStorage.setItem(this.columnStorageKey(), JSON.stringify(state));
      } catch {
        // TODO: surface via the platform's Logging adapter once available (Engineering
        // Standards §10) — storage may be unavailable (e.g. private browsing, quota).
      }
    });

    // Clamp the current page whenever filtering/sorting/page-size changes shrink the
    // total page count, rather than unconditionally resetting to page 1 on every change.
    effect(() => {
      const total = this.totalPages();
      if (this.currentPage() > total) {
        this.currentPage.set(total);
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.searchDebounceHandle) {
        clearTimeout(this.searchDebounceHandle);
      }
      this.resizeCleanup?.();
    });
  }

  ngOnInit(): void {
    // Required inputs (`columns`) are only guaranteed to be set from `ngOnInit` onward —
    // not in the constructor — so the initial column state is built here.
    const defaultColumnState = this.buildDefaultColumnState(this.columns());
    if (this.isBrowser) {
      const persisted = this.readPersistedColumnState();
      this.columnState.set(persisted ? this.reconcileColumnState(defaultColumnState, persisted) : defaultColumnState);
    } else {
      this.columnState.set(defaultColumnState);
    }
  }

  protected cellTemplateFor(columnKey: string): TemplateRef<{ $implicit: unknown; column: unknown }> | undefined {
    return this.cellTemplateMap().get(columnKey);
  }

  protected onSortColumn(columnKey: string): void {
    const current = this.sortState();
    if (current.columnKey !== columnKey) {
      this.sortState.set({ columnKey, direction: 'asc' });
      return;
    }
    if (current.direction === 'asc') {
      this.sortState.set({ columnKey, direction: 'desc' });
      return;
    }
    this.sortState.set({ columnKey: null, direction: null });
  }

  protected sortIndicator(columnKey: string): string {
    const state = this.sortState();
    if (state.columnKey !== columnKey) return '';
    return state.direction === 'asc' ? '▲' : state.direction === 'desc' ? '▼' : '';
  }

  protected toggleColumnMenu(): void {
    this.isColumnMenuOpen.update((open) => !open);
  }

  protected onToggleColumnVisibility(key: string): void {
    this.columnState.update((state) =>
      state.map((entry) => (entry.key === key ? { ...entry, hidden: !entry.hidden } : entry)),
    );
  }

  protected onMoveColumnUp(key: string): void {
    this.columnState.update((state) => this.moveEntry(state, key, -1));
  }

  protected onMoveColumnDown(key: string): void {
    this.columnState.update((state) => this.moveEntry(state, key, 1));
  }

  protected onPinColumn(event: { key: string; pinned: 'start' | 'end' | null }): void {
    this.columnState.update((state) =>
      state.map((entry) => (entry.key === event.key ? { ...entry, pinned: event.pinned } : entry)),
    );
  }

  protected onRestoreDefaultColumns(): void {
    this.columnState.set(this.buildDefaultColumnState(this.columns()));
  }

  /** Starts a column resize drag — tracks the pointer at the document level so dragging past the handle still works. */
  protected onResizeStart(event: PointerEvent, key: string): void {
    event.preventDefault();
    this.resizingKey = key;
    this.resizeStartX = event.clientX;
    this.resizeStartWidthPx = this.currentWidthPx(key);

    const onMove = (moveEvent: PointerEvent) => this.onResizeMove(moveEvent);
    const onEnd = () => this.stopResize(onMove, onEnd);

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
    this.resizeCleanup = () => this.stopResize(onMove, onEnd);
  }

  private onResizeMove(event: PointerEvent): void {
    const key = this.resizingKey;
    if (!key) return;

    const delta = event.clientX - this.resizeStartX;
    const nextWidthPx = Math.max(MIN_COLUMN_WIDTH_PX, this.resizeStartWidthPx + delta);
    this.columnState.update((state) =>
      state.map((entry) => (entry.key === key ? { ...entry, width: `${nextWidthPx}px` } : entry)),
    );
  }

  private stopResize(onMove: (event: PointerEvent) => void, onEnd: () => void): void {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onEnd);
    this.resizingKey = null;
    this.resizeCleanup = null;
  }

  private currentWidthPx(key: string): number {
    const width = this.columnState().find((entry) => entry.key === key)?.width;
    const parsed = width?.endsWith('px') ? Number.parseFloat(width) : NaN;
    return Number.isNaN(parsed) ? DEFAULT_COLUMN_WIDTH_PX : parsed;
  }

  protected toggleExportMenu(): void {
    this.isExportMenuOpen.update((open) => !open);
  }

  protected onExportScopeChange(event: Event): void {
    this.exportScope.set((event.target as HTMLSelectElement).value as ExportScope);
  }

  /**
   * Exports only the currently visible columns (hidden ones are already excluded from
   * `visibleColumns()`), and either the current page or every filtered/sorted row
   * (`sortedData()` — filters and sort already applied), per `exportScope()`.
   */
  protected onExport(format: ExportFormat): void {
    const columns: ExportColumn<T>[] = this.visibleColumns().map((column) => ({
      key: column.key,
      header: column.header,
    }));
    const rows = this.exportScope() === 'currentPage' ? this.pagedData() : this.sortedData();
    const filename = this.tableId();

    try {
      switch (format) {
        case 'csv':
          this.exportService.exportToCsv(rows, columns, filename);
          break;
        case 'excel':
          this.exportService.exportToExcel(rows, columns, filename);
          break;
        case 'print':
          this.exportService.print(rows, columns, this.title() || filename);
          break;
        case 'pdf':
          this.exportService.exportToPdf(rows, columns, filename);
          break;
      }
      this.exportError.set(null);
    } catch (error) {
      this.exportError.set(error instanceof Error ? error.message : 'Export failed.');
    }

    this.isExportMenuOpen.set(false);
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInputValue.set(value);

    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }
    this.searchDebounceHandle = setTimeout(() => {
      this.searchTerm.set(value);
      this.currentPage.set(1);
    }, SEARCH_DEBOUNCE_MS);
  }

  protected clearSearch(): void {
    this.searchInputValue.set('');
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  protected isRowSelected(row: T): boolean {
    return this.selectionModel.isSelected(row);
  }

  protected toggleRowSelection(row: T): void {
    this.selectionModel.toggle(row);
  }

  protected isAllOnPageSelected(): boolean {
    const page = this.pagedData();
    return page.length > 0 && page.every((row) => this.selectionModel.isSelected(row));
  }

  protected toggleSelectAllOnPage(): void {
    const page = this.pagedData();
    if (this.isAllOnPageSelected()) {
      this.selectionModel.deselect(...page);
    } else {
      this.selectionModel.select(...page);
    }
  }

  protected goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  protected goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  protected onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  private buildDefaultColumnState(columns: TableColumn<T>[]): TableColumnState[] {
    return columns.map((column) => ({
      key: column.key,
      hidden: column.hidden ?? false,
      width: column.width ?? null,
      pinned: column.pinned ?? null,
    }));
  }

  /**
   * Merges persisted state with the current column definitions: persisted entries whose
   * key no longer exists are dropped (a stale save from a since-changed column set), and
   * any definition not present in the persisted save (a newly added column) is appended
   * at the end in its default order — so new columns aren't silently lost from view.
   */
  private reconcileColumnState(defaults: TableColumnState[], persisted: TableColumnState[]): TableColumnState[] {
    const defaultKeys = new Set(defaults.map((entry) => entry.key));
    const reconciled = persisted.filter((entry) => defaultKeys.has(entry.key));

    const seenKeys = new Set(reconciled.map((entry) => entry.key));
    for (const entry of defaults) {
      if (!seenKeys.has(entry.key)) {
        reconciled.push(entry);
      }
    }

    return reconciled;
  }

  private moveEntry(state: TableColumnState[], key: string, delta: number): TableColumnState[] {
    const index = state.findIndex((entry) => entry.key === key);
    const targetIndex = index + delta;
    if (index === -1 || targetIndex < 0 || targetIndex >= state.length) return state;

    const next = [...state];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    return next;
  }

  private columnStorageKey(): string {
    return `data-table:${this.tableId()}:columns`;
  }

  private readPersistedColumnState(): TableColumnState[] | null {
    try {
      const raw = localStorage.getItem(this.columnStorageKey());
      return raw ? (JSON.parse(raw) as TableColumnState[]) : null;
    } catch {
      return null;
    }
  }
}
