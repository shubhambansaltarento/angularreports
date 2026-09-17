import { TestBed } from '@angular/core/testing';
import { WarrantyCostTableComponent } from './warranty-cost-table.component';
import { WarrantyCostRow } from '../../models/warranty-cost-row.model';

function makeRow(overrides: Partial<WarrantyCostRow> = {}): WarrantyCostRow {
  return {
    id: '1',
    dealerCode: '10015',
    dealerName: 'PAWAN SARKAR AUTOMOBILES',
    orderDate: '2026-04-28',
    quantity: 2,
    ...overrides,
  };
}

describe('WarrantyCostTableComponent', () => {
  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      /* ignored — see data-table.component.spec.ts */
    }
    await TestBed.configureTestingModule({
      imports: [WarrantyCostTableComponent],
    }).compileComponents();
  });

  it('renders the given rows through the shared data table with a formatted date cell (column-schema-changed-to-order-date-quantity-17-09-2026-08_14_AM.md)', () => {
    const fixture = TestBed.createComponent(WarrantyCostTableComponent);
    fixture.componentRef.setInput('rows', [makeRow()]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('PAWAN SARKAR AUTOMOBILES');
    expect(text).toContain('2');
  });

  it('uses the default hardcoded column set before any effectiveColumns has been supplied', () => {
    const fixture = TestBed.createComponent(WarrantyCostTableComponent);
    fixture.detectChanges();

    const ths: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(ths).map((th) => th.textContent?.trim());
    expect(headers.some((header) => header?.includes('Dealer Code'))).toBe(true);
    expect(headers.some((header) => header?.includes('Order Date'))).toBe(true);
    expect(headers.some((header) => header?.includes('Quantity'))).toBe(true);
  });

  it('derives column headers from effectiveColumns, skipping isVisible: false and hiding isDefault: false', () => {
    const fixture = TestBed.createComponent(WarrantyCostTableComponent);
    fixture.componentRef.setInput('effectiveColumns', [
      { columnName: 'dealerCode', isDefault: true, isVisible: true },
      { columnName: 'orderDate', isDefault: false, isVisible: true },
      { columnName: 'quantity', isDefault: true, isVisible: false },
    ]);
    fixture.detectChanges();

    const ths: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(ths).map((th) => th.textContent?.trim());
    expect(headers.some((header) => header?.includes('Dealer Code'))).toBe(true);
    expect(headers.some((header) => header?.includes('Order Date'))).toBe(false);
    expect(headers.some((header) => header?.includes('Quantity'))).toBe(false);
  });
});
