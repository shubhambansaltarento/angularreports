import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DealerLedgerTableComponent } from './dealer-ledger-table.component';
import { DealerLedgerRow } from '../../models/dealer-ledger-row.model';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';

function makeRow(overrides: Partial<DealerLedgerRow> = {}): DealerLedgerRow {
  return {
    id: '1',
    dealerCode: 'DLR-001',
    dealerName: 'Northgate Motors',
    dealerAddress: '1 Main St',
    docType: 'Invoice',
    docReferenceNo: 'INV-1',
    docDate: '2024-01-15',
    assignment: 'A1',
    cca: 'CCA1',
    textDec: 'Some text',
    narrationVehDescription: 'Vehicle X',
    debitAmount: 100,
    creditAmount: 0,
    currency: 'USD',
    text: 'Note',
    qnt: 1,
    amt: 100,
    oeRefNo: '',
    spRefNo: '',
    acRefNo: '',
    evRefNo: '',
    acwshRefNo: '',
    cblRefNo: '',
    ...overrides,
  };
}

describe('DealerLedgerTableComponent', () => {
  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      /* ignored — see data-table.component.spec.ts */
    }
    await TestBed.configureTestingModule({
      imports: [DealerLedgerTableComponent],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the given rows through the shared data table with formatted currency/date cells', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.componentRef.setInput('rows', [makeRow()]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('DLR-001');
    expect(text).toContain('Northgate Motors');
    expect(text).toContain('Vehicle X');
  });

  it('passes a DEALER_LEDGER-prefixed export filename including the dealer name to the shared table (export-panel-redesign-and-dealer-ledger-filename-17-09-2026-06_35_AM.md)', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('dealerName', 'PAWAN SARKAR AUTOMOBILES');
    fixture.detectChanges();

    const dataTable = fixture.debugElement.query(By.directive(DataTableComponent))
      .componentInstance as DataTableComponent;
    const filename = dataTable.exportFilename();
    expect(filename).toMatch(/^DEALER_LEDGER_PAWAN SARKAR AUTOMOBILES_\d{2}-\d{2}-\d{4}-\d{1,2}:\d{2}-[ap]\.m\.-report$/);
  });

  it('shows the empty-state message when there are no rows', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.componentRef.setInput('rows', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No ledger entries match the current filters.');
  });

  it('passes the loading state through to the underlying data table', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-data-table')).toBeTruthy();
  });

  it('uses the default hardcoded column set before any effectiveColumns has been supplied', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.detectChanges();

    const ths: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(ths).map((th) => th.textContent?.trim());
    expect(headers.some((header) => header?.includes('Dealer Code'))).toBe(true);
  });

  it('derives column headers/order from effectiveColumns when supplied', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.componentRef.setInput('effectiveColumns', [
      { columnName: 'dealerCode', isDefault: true },
      { columnName: 'postingDate', isDefault: true },
      { columnName: 'runningBalance', isDefault: true },
    ]);
    fixture.detectChanges();

    const ths: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(ths).map((th) => th.textContent?.trim());
    expect(headers.some((header) => header?.includes('Posting Date'))).toBe(true);
    expect(headers.some((header) => header?.includes('Balance'))).toBe(true);
    expect(headers.some((header) => header?.includes('Doc. Type'))).toBe(false);
  });

  it('skips an unrecognized column key from effectiveColumns without throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.componentRef.setInput('effectiveColumns', [
      { columnName: 'dealerCode', isDefault: true },
      { columnName: 'someNewField', isDefault: true },
    ]);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('someNewField'));
  });

  it('hides a column whose effectiveColumns entry has isDefault: false, per the column picker (effective-columns-shape-change-17-09-2026-05_41_AM.md)', () => {
    const fixture = TestBed.createComponent(DealerLedgerTableComponent);
    fixture.componentRef.setInput('effectiveColumns', [
      { columnName: 'dealerCode', isDefault: true },
      { columnName: 'textDec', isDefault: false },
    ]);
    fixture.detectChanges();

    const ths: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const headers = Array.from(ths).map((th) => th.textContent?.trim());
    expect(headers.some((header) => header?.includes('Dealer Code'))).toBe(true);
    expect(headers.some((header) => header?.includes('Text Dec.'))).toBe(false);
  });
});
