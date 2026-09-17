import { TestBed } from '@angular/core/testing';
import { DealerLedgerDetailComponent } from './dealer-ledger-detail.component';
import { DealerLedgerStore } from '../../store/dealer-ledger.store';
import { DealerLedgerService } from '../../services/dealer-ledger.service';

describe('DealerLedgerDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealerLedgerDetailComponent],
      providers: [
        DealerLedgerStore,
        { provide: DealerLedgerService, useValue: { getEntries: () => ({ subscribe: () => undefined }) } },
      ],
    }).compileComponents();
  });

  it('creates (a lazy-loaded placeholder page, pending detail content per its TODOs)', () => {
    const fixture = TestBed.createComponent(DealerLedgerDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
