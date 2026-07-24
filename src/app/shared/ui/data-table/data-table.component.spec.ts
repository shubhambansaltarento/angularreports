import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ExportService } from '../../services/export/export.service';
import { DataTableComponent } from './data-table.component';
import { DEMO_PRODUCTS, DEMO_PRODUCT_COLUMNS, DemoProduct } from './testing/data-table-demo.mock';

function findButtonByText(container: HTMLElement, selector: string, text: string): HTMLButtonElement {
  return Array.from(container.querySelectorAll(selector)).find(
    (button) => button.textContent?.trim() === text,
  ) as HTMLButtonElement;
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
    expect(fixture.nativeElement.textContent).toContain('25 records');
  });

  it('paginates to the next page', () => {
    const { fixture } = createHost();
    const [, nextButton] = fixture.nativeElement.querySelectorAll('.data-table__pagination button');
    nextButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Page 2 of 3');
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
      expect(fixture.nativeElement.textContent).toContain('25 records');

      vi.advanceTimersByTime(300);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('1 records');
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

      const persisted = JSON.parse(backing.get('data-table:demo-products:columns')!) as {
        key: string;
        hidden: boolean;
      }[];
      expect(persisted.find((entry) => entry.key === 'category')?.hidden).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('exports only visible columns and the current page by default', () => {
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

    findButtonByText(fixture.nativeElement, '.data-table__export-menu-panel button', 'CSV').click();

    expect(exportServiceSpy.exportToCsv).toHaveBeenCalledTimes(1);
    const [rows, columns] = exportServiceSpy.exportToCsv.mock.calls[0];
    expect(columns.some((column: { key: string }) => column.key === 'category')).toBe(false);
    expect(rows.length).toBe(10); // current page only, not all 25 demo rows
  });

  it('exports every filtered row (not just the current page) when scope is "all"', () => {
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

    const scopeSelect: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.data-table__export-scope select',
    );
    scopeSelect.value = 'all';
    scopeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    findButtonByText(fixture.nativeElement, '.data-table__export-menu-panel button', 'CSV').click();

    const [rows] = exportServiceSpy.exportToCsv.mock.calls[0];
    expect(rows.length).toBe(25);
  });

  it('shows an inline error when the PDF placeholder throws', () => {
    const { fixture } = createHost();

    const exportButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table__export-menu button',
    );
    exportButton.click();
    fixture.detectChanges();

    findButtonByText(fixture.nativeElement, '.data-table__export-menu-panel button', 'PDF').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('PDF export is not yet implemented.');
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

      const persisted = JSON.parse(backing.get('data-table:demo-products:columns')!) as {
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
});
