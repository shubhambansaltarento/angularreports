import { TestBed } from '@angular/core/testing';
import { WarrantyCostStatementComponent } from './warranty-cost-statement.component';
import { WarrantyCostStatement } from '../../models/warranty-cost-statement.model';

const SUMMARY = {
  totalNdpRate: 100,
  totalExcise: 0,
  totalSalesTax: 0,
  totalLabour: 20,
  totalOctroi: 0,
  totalServiceTax: 0,
  totalCost: 120,
  partsValue: 120,
  totalFreight: 5,
  totalDemurrage: 2,
  totalValue: 127,
};

const STATEMENT: WarrantyCostStatement = {
  dealerGroups: [
    {
      dealerCode: '0000010015',
      dealerName: 'PAVAN SEKHAR AUTOMOBILES',
      rows: [
        {
          dealerCode: '0000010015',
          dealerName: 'PAVAN SEKHAR AUTOMOBILES',
          cnMemoNo: '91048544',
          docDate: '12.09.2026',
          orderNum: '64162944',
          orderDate: '08.09.2026',
          dlrRefNum: 'HOS-44',
          refDate: '08.09.2026',
          partNumber: 'K6242080',
          description: 'BATTERY PACK ASSY',
          quantity: 1,
          ndpRate: 100,
          excise: 0,
          salesTax: 0,
          labour: 20,
          octroi: 0,
          serviceTax: 0,
          totCost: 120,
          freight: 5,
          demurrage: 2,
        },
      ],
      summary: SUMMARY,
    },
  ],
  grandTotal: SUMMARY,
};

describe('WarrantyCostStatementComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WarrantyCostStatementComponent] }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(WarrantyCostStatementComponent);
    fixture.componentRef.setInput('statement', STATEMENT);
    fixture.componentRef.setInput('dateFrom', '2026-08-01');
    fixture.componentRef.setInput('dateTo', '2026-08-31');
    fixture.detectChanges();
    return fixture;
  }

  it('renders the letterhead with the formatted period', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.textContent).toContain('TVS MOTOR COMPANY LIMITED');
    expect(fixture.nativeElement.textContent).toContain('FOR THE PERIOD 01.08.2026 TO 31.08.2026');
  });

  it('renders a dealer identity row and its line items', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.textContent).toContain('DEALER : 0000010015');
    expect(fixture.nativeElement.textContent).toContain('PAVAN SEKHAR AUTOMOBILES');
    expect(fixture.nativeElement.textContent).toContain('K6242080');
    expect(fixture.nativeElement.textContent).toContain('BATTERY PACK ASSY');
  });

  it('renders the yellow summary block with Parts/Freight/Demurrage/Total Value figures', () => {
    const fixture = createComponent();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('PARTS VALUE');
    expect(text).toContain('TOTAL VALUE');
    expect(text).toContain('DEALER TOTAL VALUE');
    expect(text).toContain('127.00');
  });

  it('renders the signatory footer', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.textContent).toContain('AUTHORISED SIGNATORY');
  });

  it('renders the row order as dealer (purple), then a 2-row memo label/value table (green), then the column headers (blue)', () => {
    const fixture = createComponent();

    const rows: HTMLTableRowElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody > tr'));
    const dealerRow = rows[0];
    const memoLabelRow = rows[1];
    const memoValueRow = rows[2];
    const columnHeaderRow = rows[3];

    expect(dealerRow.classList).toContain('warranty-cost-statement__dealer-row');
    expect(memoLabelRow.classList).toContain('warranty-cost-statement__memo-row--label');
    expect(memoValueRow.classList).toContain('warranty-cost-statement__memo-row');
    expect(columnHeaderRow.classList).toContain('warranty-cost-statement__column-header');

    expect(memoLabelRow.textContent).toContain('CN MEMO NO.');
    expect(memoLabelRow.textContent).toContain('REF DATE');
    expect(memoValueRow.textContent).toContain('91048544');
    expect(memoValueRow.textContent).toContain('12.09.2026');
    expect(memoValueRow.textContent).toContain('64162944');
    expect(memoValueRow.textContent).toContain('HOS-44');
  });

  it('renders exactly the 11 fixed columns (S.NO/Part Number/Description/Quantity/NDP Rate/Excise/Sales Tax/Labour/Octroi/Service Tax/Total Cost), with no memo/order columns', () => {
    const fixture = createComponent();

    const headers: string[] = Array.from(fixture.nativeElement.querySelectorAll('.warranty-cost-statement__column-header th')).map(
      (th) => (th as HTMLElement).textContent?.trim(),
    );
    expect(headers).toEqual([
      'S.NO',
      'PART NUMBER',
      'DESCRIPTION',
      'QUANTITY',
      'NDP RATE',
      'EXCISE',
      'SALES TAX',
      'LABOUR',
      'OCTROI',
      'SERVICE TAX',
      'TOTAL COST',
    ]);

    // Line-item rows render Part Number/Description as separate cells, not memo/order columns.
    const bodyRows: NodeListOf<HTMLTableRowElement> = fixture.nativeElement.querySelectorAll('tbody tr');
    const lineItemRow = bodyRows[bodyRows.length - 2];
    expect(lineItemRow.querySelectorAll('td').length).toBe(11);
    expect(lineItemRow.textContent).toContain('K6242080');
    expect(lineItemRow.textContent).toContain('BATTERY PACK ASSY');
  });
});
