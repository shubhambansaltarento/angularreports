import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ExportService } from '../../services/export/export.service';
import { DataTableComponent } from './data-table.component';
import { TableColumn } from './models/table-column.model';
import { DEMO_PRODUCTS, DEMO_PRODUCT_COLUMNS, DemoProduct } from './testing/data-table-demo.mock';

// See export.service.spec.ts: jsPDF's UMD build resolves to its Node (fs-writing) code
// path under Vitest's Node-based test runner rather than the browser download path it
// uses in the real esbuild browser bundle — mocked here so this test doesn't depend on it.
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(function MockJsPDF(this: Record<string, unknown>) {
    this['save'] = vi.fn();
    this['text'] = vi.fn();
    this['setFontSize'] = vi.fn();
  }),
}));
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));

function findButtonByText(container: HTMLElement, selector: string, text: string): HTMLButtonElement {
  return Array.from(container.querySelectorAll(selector)).find(
    (button) => button.textContent?.trim() === text,
  ) as HTMLButtonElement;
}

/** Finds an export-panel radio (Scope or Format) by its visible label text and selects it. */
function selectExportRadio(container: HTMLElement, labelText: string): void {
  const label = Array.from(container.querySelectorAll('.data-table__export-radio')).find((candidate) =>
    candidate.textContent?.trim().includes(labelText),
  ) as HTMLElement;
  const radio = label.querySelector('input[type="radio"]') as HTMLInputElement;
  radio.click();
}

@Component({
  selector: 'app-data-table-test-host',
  imports: [DataTableComponent],
  template: `
    <app-data-table
      tableId="demo-products"
      [columns]="columns"
      [data]="data"
      [initialPageSize]="10"
    />
  `,
})
class TestHostComponent {
  readonly columns = DEMO_PRODUCT_COLUMNS;
  readonly data = DEMO_PRODUCTS;
}

@Component({
  selector: 'app-data-table-server-paginated-test-host',
  imports: [DataTableComponent],
  template: `
    <app-data-table
      tableId="demo-products-server"
      [columns]="columns"
      [data]="data"
      [initialPageSize]="10"
      [page]="page"
      [totalCount]="totalCount"
      (pageChange)="pageChangeSpy($event)"
      (sortChange)="sortChangeSpy($event)"
    />
  `,
})
class ServerPaginatedTestHostComponent {
  readonly columns = DEMO_PRODUCT_COLUMNS;
  // Only one server "page" worth of rows is ever handed to the table — the point of this
  // host is to prove the table does NOT locally re-slice/re-sort this array.
  readonly data = DEMO_PRODUCTS.slice(0, 10);
  page = 1;
  totalCount = 41;
  pageChangeSpy = vi.fn();
  sortChangeSpy = vi.fn();
}

function buildDemoProducts(count: number): DemoProduct[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `Product ${index + 1}`,
    category: 'Accessories',
    price: 10 + index,
    stock: 100 - index,
    status: 'In Stock',
  }));
}

@Component({
  selector: 'app-data-table-40-row-test-host',
  imports: [DataTableComponent],
  template: `
    <app-data-table tableId="demo-products-40" [columns]="columns" [data]="data()" [initialPageSize]="10" />
  `,
})
class FortyRowTestHostComponent {
  readonly columns = DEMO_PRODUCT_COLUMNS;
  readonly data = signal(buildDemoProducts(40));
}

const COLUMNS_WITH_ONE_HIDDEN_BY_DEFAULT: TableColumn<DemoProduct>[] = DEMO_PRODUCT_COLUMNS.map((column) =>
  column.key === 'category' ? { ...column, hidden: true } : column,
);

@Component({
  selector: 'app-data-table-hidden-default-test-host',
  imports: [DataTableComponent],
  template: `
    <app-data-table tableId="demo-products-hidden-default" [columns]="columns" [data]="data" [initialPageSize]="10" />
  `,
})
class HiddenDefaultTestHostComponent {
  readonly columns = COLUMNS_WITH_ONE_HIDDEN_BY_DEFAULT;
  readonly data = DEMO_PRODUCTS;
}

@Component({
  selector: 'app-data-table-changing-columns-test-host',
  imports: [DataTableComponent],
  template: `
    <app-data-table tableId="demo-products-changing-columns" [columns]="columns()" [data]="data" [initialPageSize]="10" />
  `,
})
class ChangingColumnsTestHostComponent {
  readonly columns = signal<TableColumn<DemoProduct>[]>(DEMO_PRODUCT_COLUMNS);
  readonly data = DEMO_PRODUCTS;
}

@Component({
  selector: 'app-data-table-selection-test-host',
  imports: [DataTableComponent],
  template: `
    <app-data-table
      tableId="demo-products-selection"
      [columns]="columns"
      [data]="data"
      [initialPageSize]="10"
      selectionMode="multiple"
      (selectionChange)="latestSelection = $event"
    />
  `,
})
class SelectionTestHostComponent {
  readonly columns = DEMO_PRODUCT_COLUMNS;
  readonly data = DEMO_PRODUCTS;
  latestSelection: DemoProduct[] = [];
}

describe('DataTableComponent', () => {
  beforeEach(async () => {
    // Some CI/local Node versions expose an experimental native `localStorage` global
    // whose `clear()` throws without a configured backing file — degrade gracefully
    // rather than let unrelated test-environment plumbing fail the suite.
    try {
      localStorage.clear();
    } catch {
      /* ignored — see comment above */
    }
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  function createHost() {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const dataTable = fixture.debugElement.query(By.directive(DataTableComponent))
      .componentInstance as DataTableComponent<DemoProduct>;
    return { fixture, dataTable };
  }

  it('renders one page of rows, bounded by the configured page size (10 of 25)', () => {
    const { fixture } = createHost();
    const rows = fixture.nativeElement.querySelectorAll('tr[cdk-row]');
    expect(rows.length).toBe(10);
  });

  it('renders alternating row backgrounds — even rows visibly grey against odd/white rows (alternate-row-colors-distinct-contrast-21-09-2026-07_30_PM.md)', () => {
    const { fixture } = createHost();
    const rows: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('tr[cdk-row]');

    const oddRowBackground = getComputedStyle(rows[0]).backgroundColor;
    const evenRowBackground = getComputedStyle(rows[1]).backgroundColor;
    expect(evenRowBackground).not.toBe(oddRowBackground);
    expect(evenRowBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(evenRowBackground).not.toBe('transparent');
  });

  it('paginates to the next page', () => {
    const { fixture } = createHost();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      '.data-table__pagination button',
    );
    const nextButton = buttons[buttons.length - 1];
    nextButton.click();
    fixture.detectChanges();

    const activePage: HTMLButtonElement = fixture.nativeElement.querySelector('.data-table__page-number--active');
    expect(activePage.textContent?.trim()).toBe('2');
  });

  it('jumps directly to a page number', () => {
    const { fixture } = createHost();
    const pageButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      '.data-table__page-number',
    );
    const pageTwoButton = Array.from(pageButtons).find(
      (button) => button.textContent?.trim() === '2',
    ) as HTMLButtonElement;
    pageTwoButton.click();
    fixture.detectChanges();

    const activePage: HTMLButtonElement = fixture.nativeElement.querySelector('.data-table__page-number--active');
    expect(activePage.textContent?.trim()).toBe('2');
  });

  describe('40-row dataset at page size 10 (spec-table-default-page-size-10.md)', () => {
    async function createFortyRowHost() {
      await TestBed.configureTestingModule({
        imports: [FortyRowTestHostComponent],
      }).compileComponents();
      const fixture = TestBed.createComponent(FortyRowTestHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('shows exactly 4 page-number buttons, no ellipsis', async () => {
      const fixture = await createFortyRowHost();
      const pageButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
        '.data-table__page-number',
      );
      expect(Array.from(pageButtons).map((button) => button.textContent?.trim())).toEqual(['1', '2', '3', '4']);
      expect(fixture.nativeElement.querySelector('.data-table__page-ellipsis')).toBeFalsy();
    });

    it('shows exactly 10 rows per page, with a full (non-partial) last page', async () => {
      const fixture = await createFortyRowHost();

      for (const pageNumber of [1, 2, 3, 4]) {
        const pageButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
          '.data-table__page-number',
        );
        const button = Array.from(pageButtons).find((candidate) => candidate.textContent?.trim() === String(pageNumber));
        button?.click();
        fixture.detectChanges();

        const rows = fixture.nativeElement.querySelectorAll('tr[cdk-row]');
        expect(rows.length).toBe(10);
      }

      // Page 4 (the loop's last iteration) should show rows 31–40, not an earlier page's rows.
      expect(fixture.nativeElement.textContent).toContain('Product 40');
      expect(fixture.nativeElement.textContent).not.toContain('Product 21');
    });

    it('disables Previous on page 1 and Next on the last page (4)', async () => {
      const fixture = await createFortyRowHost();
      const navButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
        '.data-table__page-nav',
      );
      const [previousButton, nextButton] = [navButtons[0], navButtons[navButtons.length - 1]];

      expect(previousButton.disabled).toBe(true);
      expect(nextButton.disabled).toBe(false);

      // Advance to the last page via Next, three times (1 -> 2 -> 3 -> 4).
      nextButton.click();
      fixture.detectChanges();
      nextButton.click();
      fixture.detectChanges();
      nextButton.click();
      fixture.detectChanges();

      const activePage: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.data-table__page-number--active',
      );
      expect(activePage.textContent?.trim()).toBe('4');
      expect(previousButton.disabled).toBe(false);
      expect(nextButton.disabled).toBe(true);
    });

    function visibleProductNumbers(fixture: { nativeElement: HTMLElement }): number[] {
      return Array.from(fixture.nativeElement.querySelectorAll('tr[cdk-row] td'))
        .map((cell) => /Product (\d+)/.exec(cell.textContent ?? '')?.[1])
        .filter((match): match is string => Boolean(match))
        .map(Number);
    }

    function clickPageButton(fixture: { nativeElement: HTMLElement; detectChanges: () => void }, pageNumber: number) {
      const pageButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
        '.data-table__page-number',
      );
      const button = Array.from(pageButtons).find((candidate) => candidate.textContent?.trim() === String(pageNumber));
      button?.click();
      fixture.detectChanges();
    }

    it('loads the exact expected row identities when paging forward then backward (spec-table-pagination-forward-backward-integrity.md)', async () => {
      const fixture = await createFortyRowHost();

      // Forward: 1 -> 2 -> 3 -> 4.
      for (const page of [2, 3, 4]) {
        clickPageButton(fixture, page);
        const start = (page - 1) * 10 + 1;
        expect(visibleProductNumbers(fixture)).toEqual(
          Array.from({ length: 10 }, (_, index) => start + index),
        );
      }

      // Backward: 4 -> 3 -> 2 -> 1.
      for (const page of [3, 2, 1]) {
        clickPageButton(fixture, page);
        const start = (page - 1) * 10 + 1;
        expect(visibleProductNumbers(fixture)).toEqual(
          Array.from({ length: 10 }, (_, index) => start + index),
        );
      }
    });

    it('loads the exact expected row identities when jumping to page numbers out of order', async () => {
      const fixture = await createFortyRowHost();

      for (const page of [1, 3, 2, 4, 1]) {
        clickPageButton(fixture, page);
        const start = (page - 1) * 10 + 1;
        expect(visibleProductNumbers(fixture)).toEqual(
          Array.from({ length: 10 }, (_, index) => start + index),
        );
      }
    });

    it('clamps back to the last valid page when the result set shrinks (filtered from 40 to 25 rows while on page 4)', async () => {
      const fixture = await createFortyRowHost();
      const pageButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
        '.data-table__page-number',
      );
      const pageFourButton = Array.from(pageButtons).find((button) => button.textContent?.trim() === '4');
      pageFourButton?.click();
      fixture.detectChanges();

      // Shrink the dataset to 25 rows (3 pages at page size 10) while still on page 4.
      fixture.componentInstance.data.set(buildDemoProducts(25));
      fixture.detectChanges();

      const activePage: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.data-table__page-number--active',
      );
      expect(activePage.textContent?.trim()).toBe('3');
    });

    it('resetPagination() restarts at page 1 on a wholesale dataset replacement (spec-table-reset-pagination.md)', async () => {
      const fixture = await createFortyRowHost();
      const dataTable = fixture.debugElement.query(By.directive(DataTableComponent))
        .componentInstance as DataTableComponent<DemoProduct>;

      const pageButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
        '.data-table__page-number',
      );
      const pageTwoButton = Array.from(pageButtons).find((button) => button.textContent?.trim() === '2');
      pageTwoButton?.click();
      fixture.detectChanges();

      // Replace with a differently-sized dataset (still multi-page) that would NOT trigger
      // the clamp-down effect, since page 2 remains in range for it.
      dataTable.resetPagination();
      fixture.componentInstance.data.set(buildDemoProducts(30));
      fixture.detectChanges();

      const activePage: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.data-table__page-number--active',
      );
      expect(activePage.textContent?.trim()).toBe('1');
    });
  });

  it('filters rows via the debounced global search', () => {
    vi.useFakeTimers();
    try {
      const { fixture } = createHost();
      const searchInput: HTMLInputElement = fixture.nativeElement.querySelector('.data-table__search');

      searchInput.value = 'Keyboard';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Not yet applied — debounce hasn't elapsed.
      expect(fixture.nativeElement.querySelectorAll('tr[cdk-row]').length).toBe(10);

      vi.advanceTimersByTime(300);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('tr[cdk-row]');
      expect(rows.length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the empty state and a clear-search action when a search matches nothing', () => {
    vi.useFakeTimers();
    try {
      const { fixture } = createHost();
      const searchInput: HTMLInputElement = fixture.nativeElement.querySelector('.data-table__search');

      searchInput.value = 'no such product';
      searchInput.dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(300);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('No records found.');
      expect(fixture.nativeElement.querySelector('.data-table__empty-state button')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('hides a column when toggled from the column menu, and persists the choice', () => {
    // Some Node versions expose an experimental native `localStorage` that doesn't fully
    // implement getItem/setItem in this sandboxed test runner — substitute a simple,
    // self-contained in-memory fake so this test verifies our persistence *behavior*
    // without depending on that global's real-world fidelity.
    const backing = new Map<string, string>();
    const fakeStorage: Partial<Storage> = {
      getItem: (key: string) => backing.get(key) ?? null,
      setItem: (key: string, value: string) => {
        backing.set(key, value);
      },
    };
    vi.stubGlobal('localStorage', fakeStorage);

    try {
      const { fixture } = createHost();

      const columnsButton: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.data-table__column-menu button',
      );
      columnsButton.click();
      fixture.detectChanges();

      const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
        '.data-table-column-settings__item input[type="checkbox"]',
      );
      const categoryCheckbox = Array.from(checkboxes).find(
        (_, index) => DEMO_PRODUCT_COLUMNS[index].key === 'category',
      )!;
      categoryCheckbox.click();
      fixture.detectChanges();

      const headerText = fixture.nativeElement.querySelector('.data-table__scroll-container').textContent;
      expect(headerText).not.toContain('Category');

      const persisted = JSON.parse(backing.get('data-table:demo-products:columns:v2')!) as {
        key: string;
        hidden: boolean;
      }[];
      expect(persisted.find((entry) => entry.key === 'category')?.hidden).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('re-syncs a column to hidden once `columns()` later resolves to a default marking it hidden (column-hidden-default-not-applied-when-columns-change-after-init-17-09-2026-06_25_AM.md)', async () => {
    await TestBed.configureTestingModule({ imports: [ChangingColumnsTestHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ChangingColumnsTestHostComponent);
    fixture.detectChanges();

    // Initially, none of the fallback columns are hidden.
    let headerText = fixture.nativeElement.querySelector('.data-table__scroll-container').textContent;
    expect(headerText).toContain('Category');

    // Simulate the real effectiveColumns-driven definitions arriving asynchronously,
    // moments after the table's own initial (fallback) columns already built its state.
    fixture.componentInstance.columns.set(COLUMNS_WITH_ONE_HIDDEN_BY_DEFAULT);
    fixture.detectChanges();

    headerText = fixture.nativeElement.querySelector('.data-table__scroll-container').textContent;
    expect(headerText).not.toContain('Category');
  });

  it('does not override a column the user has already explicitly re-shown, even after columns() changes again', async () => {
    await TestBed.configureTestingModule({ imports: [ChangingColumnsTestHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ChangingColumnsTestHostComponent);
    fixture.detectChanges();

    // First, the real (hides Category) definitions arrive.
    fixture.componentInstance.columns.set(COLUMNS_WITH_ONE_HIDDEN_BY_DEFAULT);
    fixture.detectChanges();

    // The user manually re-shows it via the picker.
    const columnsButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__column-menu button',
    );
    columnsButton.click();
    fixture.detectChanges();

    const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
      '.data-table-column-settings__item input[type="checkbox"]',
    );
    const categoryCheckbox = Array.from(checkboxes).find(
      (_, index) => COLUMNS_WITH_ONE_HIDDEN_BY_DEFAULT[index].key === 'category',
    )!;
    categoryCheckbox.click();
    fixture.detectChanges();

    let headerText = fixture.nativeElement.querySelector('.data-table__scroll-container').textContent;
    expect(headerText).toContain('Category');

    // A further columns() change (same hidden default) must not silently re-hide it.
    fixture.componentInstance.columns.set([...COLUMNS_WITH_ONE_HIDDEN_BY_DEFAULT]);
    fixture.detectChanges();

    headerText = fixture.nativeElement.querySelector('.data-table__scroll-container').textContent;
    expect(headerText).toContain('Category');
  });

  it('ignores stale pre-versioned persisted column state, using the fresh column-definition default (e.g. isDefault-driven hidden) instead (column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md)', async () => {
    const backing = new Map<string, string>();
    const fakeStorage: Partial<Storage> = {
      getItem: (key: string) => backing.get(key) ?? null,
      setItem: (key: string, value: string) => {
        backing.set(key, value);
      },
    };
    vi.stubGlobal('localStorage', fakeStorage);

    try {
      // Simulate an old session's persisted state, from before the versioned storage key
      // existed, under which "Category" was visible — stored under the OLD unversioned key,
      // so the current (versioned) lookup must not read it.
      backing.set(
        'data-table:demo-products-hidden-default:columns',
        JSON.stringify(
          COLUMNS_WITH_ONE_HIDDEN_BY_DEFAULT.map((column) => ({ key: column.key, hidden: false, width: null, pinned: null })),
        ),
      );

      await TestBed.configureTestingModule({ imports: [HiddenDefaultTestHostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(HiddenDefaultTestHostComponent);
      fixture.detectChanges();

      // "Category" is `hidden: true` in the current column definitions — if the stale
      // unversioned key were (wrongly) consulted, it would show as visible instead.
      const headerText = fixture.nativeElement.querySelector('.data-table__scroll-container').textContent;
      expect(headerText).not.toContain('Category');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('exports only visible columns and every filtered row by default (column-picker-and-export-panel-fixes-17-09-2026-05_50_AM.md)', () => {
    const exportServiceSpy = {
      exportToCsv: vi.fn(),
      exportToExcel: vi.fn(),
      print: vi.fn(),
      exportToPdf: vi.fn(),
    };
    TestBed.overrideProvider(ExportService, { useValue: exportServiceSpy });
    const { fixture } = createHost();

    const columnsButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__column-menu button',
    );
    columnsButton.click();
    fixture.detectChanges();

    const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
      '.data-table-column-settings__item input[type="checkbox"]',
    );
    const categoryCheckbox = Array.from(checkboxes).find(
      (_, index) => DEMO_PRODUCT_COLUMNS[index].key === 'category',
    )!;
    categoryCheckbox.click();
    fixture.detectChanges();

    const exportButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__export-menu button',
    );
    exportButton.click();
    fixture.detectChanges();

    // CSV is already selected by default (first of visibleExportFormats()) — just submit.
    findButtonByText(fixture.nativeElement, '.data-table__export-submit', 'Export').click();

    expect(exportServiceSpy.exportToCsv).toHaveBeenCalledTimes(1);
    const [rows, columns] = exportServiceSpy.exportToCsv.mock.calls[0];
    expect(columns.some((column: { key: string }) => column.key === 'category')).toBe(false);
    expect(rows.length).toBe(25); // every filtered row by default, not just the current page
  });

  it('exports only the current page when the user explicitly selects that scope', () => {
    const exportServiceSpy = {
      exportToCsv: vi.fn(),
      exportToExcel: vi.fn(),
      print: vi.fn(),
      exportToPdf: vi.fn(),
    };
    TestBed.overrideProvider(ExportService, { useValue: exportServiceSpy });
    const { fixture } = createHost();

    const exportButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__export-menu button',
    );
    exportButton.click();
    fixture.detectChanges();

    selectExportRadio(fixture.nativeElement, 'Current Page');
    fixture.detectChanges();

    findButtonByText(fixture.nativeElement, '.data-table__export-submit', 'Export').click();

    const [rows] = exportServiceSpy.exportToCsv.mock.calls[0];
    expect(rows.length).toBe(10);
  });

  it('does not export immediately when selecting a scope or format radio — only on the explicit Export button (export-panel-redesign-and-dealer-ledger-filename-17-09-2026-06_35_AM.md)', () => {
    const exportServiceSpy = {
      exportToCsv: vi.fn(),
      exportToExcel: vi.fn(),
      print: vi.fn(),
      exportToPdf: vi.fn(),
    };
    TestBed.overrideProvider(ExportService, { useValue: exportServiceSpy });
    const { fixture } = createHost();

    const exportButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__export-menu button',
    );
    exportButton.click();
    fixture.detectChanges();

    selectExportRadio(fixture.nativeElement, 'PDF');
    fixture.detectChanges();

    expect(exportServiceSpy.exportToPdf).not.toHaveBeenCalled();

    findButtonByText(fixture.nativeElement, '.data-table__export-submit', 'Export').click();

    expect(exportServiceSpy.exportToPdf).toHaveBeenCalledTimes(1);
  });

  it('selects the first available format by default, with an icon shown for each format radio', () => {
    const { fixture } = createHost();

    const exportButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__export-menu button',
    );
    exportButton.click();
    fixture.detectChanges();

    const formatRadios: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
      '.data-table__export-group:last-of-type input[type="radio"]',
    );
    expect(formatRadios[0].checked).toBe(true);

    const icons = fixture.nativeElement.querySelectorAll('.data-table__export-group:last-of-type i.bi');
    expect(icons.length).toBe(formatRadios.length);
  });

  it('generates a real PDF without an inline error', () => {
    const { fixture } = createHost();

    const exportButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__export-menu button',
    );
    exportButton.click();
    fixture.detectChanges();

    selectExportRadio(fixture.nativeElement, 'PDF');
    fixture.detectChanges();

    findButtonByText(fixture.nativeElement, '.data-table__export-submit', 'Export').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.data-table__export-error')).toBeFalsy();
  });

  it('reorders a column via Move Up and updates the rendered header order', () => {
    const { fixture } = createHost();

    const columnsButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__column-menu button',
    );
    columnsButton.click();
    fixture.detectChanges();

    // DEMO_PRODUCT_COLUMNS order is: name, category, price, stock, status.
    const items = fixture.nativeElement.querySelectorAll('.data-table-column-settings__item');
    const categoryMoveUp = items[1].querySelector('button[aria-label="Move column up"]') as HTMLButtonElement;
    categoryMoveUp.click();
    fixture.detectChanges();

    const headerTexts = Array.from(fixture.nativeElement.querySelectorAll('.data-table__table th')).map((th) =>
      (th as HTMLElement).textContent?.trim(),
    );
    expect(headerTexts[0]).toContain('Category');
    expect(headerTexts[1]).toContain('Product Name');
  });

  it('pins a column to the start and renders it before unpinned columns', () => {
    const { fixture } = createHost();

    const columnsButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__column-menu button',
    );
    columnsButton.click();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.data-table-column-settings__item');
    const statusPinSelect = items[4].querySelector('.data-table-column-settings__pin') as HTMLSelectElement;
    statusPinSelect.value = 'start';
    statusPinSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const headerTexts = Array.from(fixture.nativeElement.querySelectorAll('.data-table__table th')).map((th) =>
      (th as HTMLElement).textContent?.trim(),
    );
    expect(headerTexts[0]).toContain('Status');
  });

  it('restores the default column configuration', () => {
    const { fixture } = createHost();

    const columnsButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__column-menu button',
    );
    columnsButton.click();
    fixture.detectChanges();

    const nameCheckbox = fixture.nativeElement.querySelector(
      '.data-table-column-settings__item input[type="checkbox"]',
    ) as HTMLInputElement;
    nameCheckbox.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.data-table__scroll-container').textContent).not.toContain(
      'Product Name',
    );

    const restoreButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table-column-settings__restore',
    );
    restoreButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.data-table__scroll-container').textContent).toContain(
      'Product Name',
    );
  });

  it('filters the column settings list via the search box', () => {
    const { fixture } = createHost();

    const columnsButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__column-menu button',
    );
    columnsButton.click();
    fixture.detectChanges();

    const searchInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '.data-table-column-settings__search input',
    );
    searchInput.value = 'stock';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.data-table-column-settings__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Stock');
  });

  it('resizes a column via pointer drag and persists the new width', () => {
    const backing = new Map<string, string>();
    const fakeStorage: Partial<Storage> = {
      getItem: (key: string) => backing.get(key) ?? null,
      setItem: (key: string, value: string) => {
        backing.set(key, value);
      },
    };
    vi.stubGlobal('localStorage', fakeStorage);

    try {
      const { fixture } = createHost();
      const handle: HTMLElement = fixture.nativeElement.querySelector('.data-table__resize-handle');

      // Constructed as MouseEvent (not PointerEvent) since jsdom's PointerEvent support is
      // inconsistent — DOM dispatch matches by event `type`, so the component's
      // `pointerdown`/`pointermove`/`pointerup` listeners still receive these.
      handle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100 }));
      document.dispatchEvent(new MouseEvent('pointermove', { clientX: 160 }));
      document.dispatchEvent(new MouseEvent('pointerup', { clientX: 160 }));
      fixture.detectChanges();

      const persisted = JSON.parse(backing.get('data-table:demo-products:columns:v2')!) as {
        key: string;
        width: string | null;
      }[];
      const nameColumn = persisted.find((entry) => entry.key === 'name');
      expect(nameColumn?.width).toBe('210px'); // default 150px + 60px drag delta
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('emits selectionChange with the selected rows in multiple-selection mode', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionTestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SelectionTestHostComponent);
    fixture.detectChanges();

    const rowCheckbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'td.data-table__select-cell input[type="checkbox"]',
    );
    rowCheckbox.click();
    fixture.detectChanges();

    const host = fixture.componentInstance;
    expect(host.latestSelection.length).toBe(1);
    expect(host.latestSelection[0].id).toBe(DEMO_PRODUCTS[0].id);
  });

  describe('server-side pagination (totalCount provided)', () => {
    async function createServerPaginatedHost() {
      await TestBed.configureTestingModule({
        imports: [ServerPaginatedTestHostComponent],
      }).compileComponents();
      const fixture = TestBed.createComponent(ServerPaginatedTestHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('shows the server totalCount, not the current page array length', async () => {
      const fixture = await createServerPaginatedHost();
      const pageButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
        '.data-table__page-number',
      );
      // totalCount=41 at page size 10 → 5 pages, not 1 (which `data`'s own 10-row page length would imply).
      expect(Array.from(pageButtons).map((button) => button.textContent?.trim())).toEqual(['1', '2', '3', '4', '5']);
    });

    it('renders `data` as-is without re-slicing it locally', async () => {
      const fixture = await createServerPaginatedHost();
      const rows = fixture.nativeElement.querySelectorAll('tr[cdk-row]');
      expect(rows.length).toBe(10);
    });

    it('emits pageChange instead of paginating locally when Next is clicked', async () => {
      const fixture = await createServerPaginatedHost();
      const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
        '.data-table__pagination button',
      );
      const nextButton = buttons[buttons.length - 1];
      nextButton.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.pageChangeSpy).toHaveBeenCalledWith(2);
      // The host didn't update `page` in response — the table must still show page 1's
      // rows (proof it isn't silently re-slicing `data` behind the consumer's back).
      expect(fixture.nativeElement.querySelectorAll('tr[cdk-row]').length).toBe(10);
    });

    it('emits sortChange with the clicked column key instead of sorting locally', async () => {
      const fixture = await createServerPaginatedHost();
      const sortButton: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.data-table__sort-button',
      );
      sortButton.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.sortChangeSpy).toHaveBeenCalledWith(
        fixture.componentInstance.columns[0].key,
      );
    });
  });
});
