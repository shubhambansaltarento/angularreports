import { TestBed } from '@angular/core/testing';
import { DealerLedgerToolbarComponent } from './dealer-ledger-toolbar.component';

describe('DealerLedgerToolbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealerLedgerToolbarComponent],
    }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(DealerLedgerToolbarComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the default title in the header bar, with no entry count', () => {
    const fixture = TestBed.createComponent(DealerLedgerToolbarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-report-header-bar').textContent).toContain('Dealer Ledger');
    expect(fixture.nativeElement.textContent).not.toContain('entries');
  });

  it('renders a custom title when provided', () => {
    const fixture = TestBed.createComponent(DealerLedgerToolbarComponent);
    fixture.componentRef.setInput('title', 'Custom Title');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-report-header-bar').textContent).toContain('Custom Title');
  });
});
