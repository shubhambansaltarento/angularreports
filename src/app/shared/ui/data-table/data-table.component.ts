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

const ALL_EXPORT_FORMATS: ExportFormat[] = ['csv', 'excel', 'print', 'pdf'];
const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  excel: 'Excel',
  print: 'Print',
  pdf: 'PDF',
};
/** Bootstrap Icons glyph per format — export-panel-redesign-and-dealer-ledger-filename-17-09-2026-06_35_AM.md. */
const EXPORT_FORMAT_ICONS: Record<ExportFormat, string> = {
  csv: 'bi-filetype-csv',
  excel: 'bi-file-earmark-excel',
  print: 'bi-printer',
  pdf: 'bi-file-earmark-pdf',
};

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

  readonly initialPageSize = input<number>(DEFAULT_PAGE_SIZE_OPTIONS[0]);

  readonly title = input<string>('');

  /** Restricts global search to specific fields; searches every column key if omitted. */
  readonly searchableKeys = input<Extract<keyof T, string>[] | null>(null);

  /** Message shown in the empty state — lets each consumer phrase "no data" for its own domain. */
  readonly emptyStateMessage = input<string>('No records found.');

  /**
   * Opts a report into a "Reset" control in this table's own header, alongside its
   * search/Export controls — for reports (e.g. Dealer Ledger) whose own filter panel does
   * not render its own Reset button. The table has no notion of "filters" itself; it only
   * renders the button and disables it per `resetDisabled`, emitting `resetClicked` for
   * the consuming page to clear whatever filter state it owns.
   */
  readonly showReset = input(false);

  /** Disables the header Reset control — typically "no filter is currently active". */
  readonly resetDisabled = input(false);

  /** Restricts the Export menu to these formats; `null` (default) shows every format. */
  readonly exportFormats = input<ExportFormat[] | null>(null);

  /**
   * Overrides `tableId()` as the export file's base name (extension still appended by
   * `ExportService`) — e.g. Dealer Ledger's report-key/dealer-name/timestamp pattern, per
   * export-panel-redesign-and-dealer-ledger-filename-17-09-2026-06_35_AM.md. `null`
   * (default) preserves the existing `tableId()`-based filename for every other consumer.
   */
  readonly exportFilename = input<string | null>(null);

  /**
   * Server-side pagination mode (spec-table-server-side-pagination.md): when non-null,
   * `data` is treated as *only the current page*, not the full dataset — `totalPages` is
   * computed from this instead of `data().length`, `pagedData()` returns `data`
   * (already-sorted/paginated) as-is, and Prev/Next/page-number clicks emit `pageChange`
   * instead of slicing locally. `null` (default): existing client-side pagination,
   * unaffected.
   */
  readonly totalCount = input<number | null>(null);

  /** The current 1-based page, when server-paginated — ignored in client-side mode. */
  readonly page = input<number | null>(null);

  /**
   * The server's actual applied sort, when server-paginated — keeps the header's sort
   * arrow in sync with what the backend actually returned, independent of this table's own
   * (otherwise-authoritative) local toggle state. Ignored in client-side mode.
   */
  readonly sort = input<TableSortState | null>(null);

  readonly selectionChange = output<T[]>();

  /** Fires when the header Reset control (see `showReset`) is clicked. */
  readonly resetClicked = output<void>();

  /** Fires instead of paginating locally, in server-side mode (see `totalCount`). */
  readonly pageChange = output<number>();

  /** Fires with the clicked column's key instead of sorting locally, in server-side mode (see `totalCount`). */
  readonly sortChange = output<string>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly exportService = inject(ExportService);

  private readonly cellTemplates = contentChildren(DataTableCellTemplateDirective);

  /** Hide/show, order, width, and pin state for every column — persisted per `tableId`. */
  private readonly columnState = signal<TableColumnState[]>([]);
  /** Guards the `columns()`-resync effect against running before `ngOnInit`'s initial build. */
  private hasInitializedColumnState = false;
  protected readonly sortState = signal<TableSortState>({ columnKey: null, direction: null });
  protected readonly currentPage = signal(1);
  protected readonly pageSize: ReturnType<typeof signal<number>>;
  protected readonly searchTerm = signal('');
  protected readonly searchInputValue = signal('');
  protected readonly isColumnMenuOpen = signal(false);
  protected readonly isExportMenuOpen = signal(false);
  /**
   * Defaults to exporting every filtered/sorted row, not just the currently-visible page —
   * column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md. The user can still pick
   * "Current page" explicitly from the Scope dropdown.
   */
  protected readonly exportScope = signal<ExportScope>('all');
  protected readonly exportError = signal<string | null>(null);
  /** User's explicit format pick, if any — falls back to the first available format via `selectedExportFormat`. */
  private readonly selectedExportFormatOverride = signal<ExportFormat | null>(null);

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

  /** True when the consumer supplies `totalCount` — `data` is only the current server page, not the full dataset. */
  protected readonly isServerPaginated = computed(() => this.totalCount() !== null);

  /** The current page, preferring the server-controlled `page` input when server-paginated. */
  protected readonly effectiveCurrentPage = computed(() => this.page() ?? this.currentPage());

  /** The active sort, preferring the server-confirmed `sort` input when server-paginated. */
  protected readonly effectiveSortState = computed(() => this.sort() ?? this.sortState());

  protected readonly filteredData = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const rows = this.data();
    if (!term) return rows;

    const keys = this.searchableKeys() ?? this.columns().map((column) => column.key);
    return rows.filter((row) => keys.some((key) => String(row[key] ?? '').toLowerCase().includes(term)));
  });

  protected readonly sortedData = computed(() => {
    const rows = this.filteredData();
    // Server-paginated data arrives already sorted by the backend — sorting only the
    // current page locally would silently produce a wrong order relative to other pages.
    if (this.isServerPaginated()) return rows;

    const { columnKey, direction } = this.sortState();
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

  protected readonly resolvedTotalCount = computed(() => this.totalCount() ?? this.filteredData().length);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.resolvedTotalCount() / this.pageSize())),
  );

  /**
   * Numbered pagination model for the footer — a windowed set of page numbers around the
   * current page (plus the first/last page), with `'ellipsis'` markers for skipped ranges.
   * Shows every page when the total is small enough that windowing would not save space.
   */
  protected readonly pageNumbers = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.effectiveCurrentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

    const result: (number | 'ellipsis')[] = [];
    let previous = 0;
    for (const page of sorted) {
      if (previous && page - previous > 1) {
        result.push('ellipsis');
      }
      result.push(page);
      previous = page;
    }
    return result;
  });

  protected readonly pagedData = computed(() => {
    // Server-paginated: `data` already IS the current page — nothing to slice further.
    if (this.isServerPaginated()) return this.sortedData();

    const start = (this.effectiveCurrentPage() - 1) * this.pageSize();
    return this.sortedData().slice(start, start + this.pageSize());
  });

  protected readonly isInitialLoading = computed(() => this.loading() && this.data().length === 0);
  protected readonly isOverlayLoading = computed(() => this.loading() && this.data().length > 0);
  protected readonly isEmpty = computed(() => !this.loading() && this.resolvedTotalCount() === 0);
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
    // Server-paginated mode has no internal `currentPage` of its own to clamp — the
    // consumer owns that state.
    effect(() => {
      if (this.isServerPaginated()) return;
      const total = this.totalPages();
      if (this.currentPage() > total) {
        this.currentPage.set(total);
      }
    });

    // Re-syncs `hidden` for each column whenever `columns()` later resolves to a
    // different set of definitions (e.g. Dealer Ledger's `effectiveColumns` arriving
    // asynchronously, after the table already initialized `columnState` from its
    // fallback columns) — column-hidden-default-not-applied-when-columns-change-after-init-17-09-2026-06_25_AM.md.
    // Only affects columns the user hasn't explicitly toggled; `hasInitializedColumnState`
    // guards against racing `ngOnInit`'s own initial build (this effect's first run
    // happens before `ngOnInit`, since inputs aren't guaranteed set until then).
    effect(() => {
      const definitions = this.columns();
      if (!this.hasInitializedColumnState) return;
      this.syncColumnStateWithDefinitions(definitions);
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
    this.hasInitializedColumnState = true;
  }

  protected cellTemplateFor(columnKey: string): TemplateRef<{ $implicit: unknown; column: unknown }> | undefined {
    return this.cellTemplateMap().get(columnKey);
  }

  protected onSortColumn(columnKey: string): void {
    const current = this.effectiveSortState();
    const next: TableSortState =
      current.columnKey !== columnKey
        ? { columnKey, direction: 'asc' }
        : current.direction === 'asc'
          ? { columnKey, direction: 'desc' }
          : { columnKey: null, direction: null };

    this.sortState.set(next);
    // Server-paginated: sorting the loaded page locally would misorder it relative to the
    // other pages — ask the consumer to re-fetch sorted instead. The consumer's own sort
    // toggle (e.g. `DealerLedgerStore.sort()`) implements the identical 3-state cycle from
    // its own current state, kept in sync with this table's via the `sort` input — so only
    // the clicked column key needs to be sent, not the direction this table computed.
    if (this.isServerPaginated()) {
      this.sortChange.emit(columnKey);
    }
  }

  protected sortIndicator(columnKey: string): string {
    const state = this.effectiveSortState();
    if (state.columnKey !== columnKey) return '';
    return state.direction === 'asc' ? '▲' : state.direction === 'desc' ? '▼' : '';
  }

  protected toggleColumnMenu(): void {
    this.isColumnMenuOpen.update((open) => !open);
  }

  protected onToggleColumnVisibility(key: string): void {
    this.columnState.update((state) =>
      state.map((entry) => (entry.key === key ? { ...entry, hidden: !entry.hidden, hiddenIsExplicit: true } : entry)),
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

  /** Formats offered in the Export menu — every format unless `exportFormats()` restricts them. */
  protected readonly visibleExportFormats = computed(() => this.exportFormats() ?? ALL_EXPORT_FORMATS);

  /** The currently-selected format radio — defaults to the first available format. */
  protected readonly selectedExportFormat = computed<ExportFormat | null>(
    () => this.selectedExportFormatOverride() ?? this.visibleExportFormats()[0] ?? null,
  );

  protected exportFormatLabel(format: ExportFormat): string {
    return EXPORT_FORMAT_LABELS[format];
  }

  protected exportFormatIcon(format: ExportFormat): string {
    return EXPORT_FORMAT_ICONS[format];
  }

  protected toggleExportMenu(): void {
    this.isExportMenuOpen.update((open) => !open);
  }

  protected onExportScopeSelect(scope: ExportScope): void {
    this.exportScope.set(scope);
  }

  protected onExportFormatSelect(format: ExportFormat): void {
    this.selectedExportFormatOverride.set(format);
  }

  /**
   * Exports only the currently visible columns (hidden ones are already excluded from
   * `visibleColumns()`), and either the current page or every filtered/sorted row
   * (`sortedData()` — filters and sort already applied), per `exportScope()`, in the
   * currently-selected `selectedExportFormat()` — triggered by the panel's explicit Export
   * button, per export-panel-redesign-and-dealer-ledger-filename-17-09-2026-06_35_AM.md
   * (selecting a scope/format radio no longer exports immediately by itself).
   */
  protected onExportClick(): void {
    const format = this.selectedExportFormat();
    if (!format) return;

    const columns: ExportColumn<T>[] = this.visibleColumns().map((column) => ({
      key: column.key,
      header: column.header,
    }));
    const rows = this.exportScope() === 'currentPage' ? this.pagedData() : this.sortedData();
    const filename = this.exportFilename() ?? this.tableId();

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
          this.exportService.exportToPdf(rows, columns, filename, this.title() || undefined);
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

  /**
   * Restarts client-side pagination at page 1 — for a consumer-triggered wholesale
   * dataset replacement (e.g. a Reset action), as distinct from the clamp-down effect
   * below (which only ever reduces the current page when it falls out of range after an
   * organic shrink, e.g. sort/search). Call via a `viewChild` reference
   * (spec-table-reset-pagination.md), mirroring this codebase's existing
   * `resetFilters()`-via-`viewChild` pattern. No-op in server-side pagination mode, where
   * the consumer's own `page` input is the sole source of truth for the current page.
   */
  resetPagination(): void {
    this.currentPage.set(1);
  }

  protected goToPreviousPage(): void {
    this.goToPage(this.effectiveCurrentPage() - 1);
  }

  protected goToNextPage(): void {
    this.goToPage(this.effectiveCurrentPage() + 1);
  }

  /** Jumps directly to a page number, from the numbered pagination control. */
  protected goToPage(page: number): void {
    const target = Math.min(Math.max(1, page), this.totalPages());
    // Server-paginated: this table isn't holding the other pages — ask the consumer to
    // fetch the requested page instead of slicing locally.
    if (this.isServerPaginated()) {
      this.pageChange.emit(target);
      return;
    }
    this.currentPage.set(target);
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
   * Re-syncs `hidden` from each definition's own default for any column the user hasn't
   * explicitly toggled (`hiddenIsExplicit`), and appends any key present in `definitions`
   * but not yet in `columnState` — column-hidden-default-not-applied-when-columns-change-after-init-17-09-2026-06_25_AM.md.
   * A no-op (returns the same array reference) when nothing actually needs to change, so
   * this doesn't retrigger persistence/re-render on every unrelated `columns()` recompute.
   */
  private syncColumnStateWithDefinitions(definitions: TableColumn<T>[]): void {
    const definitionsByKey = new Map(definitions.map((definition) => [definition.key, definition]));

    this.columnState.update((state) => {
      let changed = false;

      const synced = state.map((entry) => {
        const definition = definitionsByKey.get(entry.key as Extract<keyof T, string>);
        if (!definition || entry.hiddenIsExplicit) return entry;

        const defaultHidden = definition.hidden ?? false;
        if (entry.hidden === defaultHidden) return entry;

        changed = true;
        return { ...entry, hidden: defaultHidden };
      });

      const existingKeys = new Set(synced.map((entry) => entry.key));
      for (const definition of definitions) {
        if (existingKeys.has(definition.key)) continue;
        changed = true;
        synced.push({
          key: definition.key,
          hidden: definition.hidden ?? false,
          width: definition.width ?? null,
          pinned: definition.pinned ?? null,
        });
      }

      return changed ? synced : state;
    });
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

  /**
   * Versioned so that a backend-driven default-visibility change (e.g. `isDefault` per
   * effective-columns-shape-change-17-09-2026-05_41_AM.md) can be rolled out without stale
   * persisted `hidden` values from before that concept existed silently overriding the new
   * defaults forever — column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md. Bumping
   * this suffix invalidates every previously-persisted column state once; normal
   * persistence (including future manual show/hide/reorder/pin choices) resumes from a
   * fresh, backend-correct baseline.
   */
  private static readonly COLUMN_STATE_STORAGE_VERSION = 2;

  private columnStorageKey(): string {
    return `data-table:${this.tableId()}:columns:v${DataTableComponent.COLUMN_STATE_STORAGE_VERSION}`;
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
