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

  it('renders the default title, centered, with no entry count (header-center-align-single-row-identity-fields-17-09-2026-06_05_AM.md)', () => {
    const fixture = TestBed.createComponent(DealerLedgerToolbarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Dealer Ledger');
    expect(fixture.nativeElement.textContent).not.toContain('entries');

    const header: HTMLElement = fixture.nativeElement.querySelector('.dealer-ledger-toolbar');
    expect(getComputedStyle(header).justifyContent).toBe('center');
  });

  it('renders a custom title when provided', () => {
    const fixture = TestBed.createComponent(DealerLedgerToolbarComponent);
    fixture.componentRef.setInput('title', 'Custom Title');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Custom Title');
  });
});
