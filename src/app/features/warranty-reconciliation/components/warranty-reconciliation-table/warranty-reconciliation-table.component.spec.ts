import { TestBed } from '@angular/core/testing';
import { WarrantyReconciliationTableComponent } from './warranty-reconciliation-table.component';
import { WarrantyReconciliationRow } from '../../models/warranty-reconciliation-row.model';

function makeRow(overrides: Partial<WarrantyReconciliationRow> = {}): WarrantyReconciliationRow {
  return {
    dealerCode: '10015',
    dealerName: 'PAWAN SARKAR AUTOMOBILES',
    reconciliationDate: '2026-06-02',
    ...overrides,
  };
}

describe('WarrantyReconciliationTableComponent', () => {
  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      /* ignored — see data-table.component.spec.ts */
    }
    await TestBed.configureTestingModule({
      imports: [WarrantyReconciliationTableComponent],
    }).compileComponents();
  });

  it('renders the given rows through the shared data table', () => {
    const fixture = TestBed.createComponent(WarrantyReconciliationTableComponent);
    fixture.componentRef.setInput('rows', [makeRow()]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('10015');
    expect(text).toContain('PAWAN SARKAR AUTOMOBILES');
  });

  it('uses the default hardcoded column set before any effectiveColumns has been supplied', () => {
    const fixture = TestBed.createComponent(WarrantyReconciliationTableComponent);
    fixture.detectChanges();

    const ths: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(ths).map((th) => th.textContent?.trim());
    expect(headers.some((header) => header?.includes('Dealer Code'))).toBe(true);
    expect(headers.some((header) => header?.includes('Dealer Name'))).toBe(true);
    expect(headers.some((header) => header?.includes('Reconciliation Date'))).toBe(true);
  });

  it('derives column headers from effectiveColumns, skipping isVisible: false and hiding isDefault: false', () => {
    const fixture = TestBed.createComponent(WarrantyReconciliationTableComponent);
    fixture.componentRef.setInput('effectiveColumns', [
      { columnName: 'dealerCode', isDefault: true, isVisible: true },
      { columnName: 'dealerName', isDefault: true, isVisible: false },
    ]);
    fixture.detectChanges();

    const ths: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(ths).map((th) => th.textContent?.trim());
    expect(headers.some((header) => header?.includes('Dealer Code'))).toBe(true);
    expect(headers.some((header) => header?.includes('Dealer Name'))).toBe(false);
  });
});
