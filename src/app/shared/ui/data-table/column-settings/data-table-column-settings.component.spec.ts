import { TestBed } from '@angular/core/testing';
import { DataTableColumnSettingsComponent } from './data-table-column-settings.component';
import { ColumnSettingsItem } from './models/column-settings-item.model';

const COLUMNS: ColumnSettingsItem[] = [
  { key: 'name', header: 'Name', hidden: false, pinned: null },
  { key: 'category', header: 'Category', hidden: false, pinned: null },
  { key: 'price', header: 'Price', hidden: true, pinned: 'start' },
];

describe('DataTableColumnSettingsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableColumnSettingsComponent],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(DataTableColumnSettingsComponent);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one list item per column, with checked state reflecting hidden', () => {
    const fixture = createComponent();
    const items = fixture.nativeElement.querySelectorAll('.data-table-column-settings__item');
    expect(items.length).toBe(3);

    const checkboxes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
      '.data-table-column-settings__visibility input',
    );
    expect(checkboxes[0].checked).toBe(true); // not hidden
    expect(checkboxes[2].checked).toBe(false); // hidden
  });

  it('emits toggleVisibility with the column key when its checkbox is toggled', () => {
    const fixture = createComponent();
    let emittedKey: string | undefined;
    fixture.componentInstance.toggleVisibility.subscribe((key: string) => (emittedKey = key));

    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      '.data-table-column-settings__visibility input',
    );
    checkbox.click();

    expect(emittedKey).toBe('name');
  });

  it('disables Move Up for the first item and Move Down for the last item', () => {
    const fixture = createComponent();
    const items = fixture.nativeElement.querySelectorAll('.data-table-column-settings__item');

    const firstUp: HTMLButtonElement = items[0].querySelector('button[aria-label="Move column up"]');
    const lastDown: HTMLButtonElement = items[2].querySelector('button[aria-label="Move column down"]');
    expect(firstUp.disabled).toBe(true);
    expect(lastDown.disabled).toBe(true);

    const firstDown: HTMLButtonElement = items[0].querySelector('button[aria-label="Move column down"]');
    expect(firstDown.disabled).toBe(false);
  });

  it('emits moveUp/moveDown with the column key on click', () => {
    const fixture = createComponent();
    let moveDownKey: string | undefined;
    fixture.componentInstance.moveDown.subscribe((key: string) => (moveDownKey = key));

    const items = fixture.nativeElement.querySelectorAll('.data-table-column-settings__item');
    const firstDown: HTMLButtonElement = items[0].querySelector('button[aria-label="Move column down"]');
    firstDown.click();

    expect(moveDownKey).toBe('name');
  });

  it('emits pin with the selected pin value on the pin select', () => {
    const fixture = createComponent();
    let emitted: { key: string; pinned: 'start' | 'end' | null } | undefined;
    fixture.componentInstance.pin.subscribe((value) => (emitted = value));

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '.data-table-column-settings__pin',
    );
    select.value = 'end';
    select.dispatchEvent(new Event('change'));

    expect(emitted).toEqual({ key: 'name', pinned: 'end' });
  });

  it('emits restoreDefaults when the restore button is clicked', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.restoreDefaults.subscribe(() => (emitted = true));

    const restoreButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.data-table-column-settings__restore',
    );
    restoreButton.click();

    expect(emitted).toBe(true);
  });

  it('filters the rendered list via the search box, matching against header text', () => {
    const fixture = createComponent();
    const searchInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '.data-table-column-settings__search input',
    );
    searchInput.value = 'cat';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.data-table-column-settings__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Category');
  });
});
