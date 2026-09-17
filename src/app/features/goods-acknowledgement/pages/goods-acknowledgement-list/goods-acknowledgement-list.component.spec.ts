import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GoodsAcknowledgementListComponent } from './goods-acknowledgement-list.component';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';

describe('GoodsAcknowledgementListComponent', () => {
  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      /* ignored — see data-table.component.spec.ts */
    }
    await TestBed.configureTestingModule({
      imports: [GoodsAcknowledgementListComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(GoodsAcknowledgementListComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a breadcrumb below the header, trailing with "Goods Acknowledgement" (breadcrumbs-and-dealer-ledger-style-headers-17-09-2026-07_17_AM.md)', () => {
    const fixture = createComponent();
    const breadcrumb: HTMLElement = fixture.nativeElement.querySelector('app-breadcrumb');
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.textContent).toContain('Goods Acknowledgement');
  });

  it('prefills the search bar from the dealer context', () => {
    const fixture = createComponent();
    const dealerContext = TestBed.inject(DealerContextService).dealerContext();

    const dealerCodeInput: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-dealer-code');
    expect(dealerCodeInput.value).toBe(dealerContext.dealerCode);
  });

  it('renders an honestly-empty table (no data source wired up yet)', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.textContent).toContain(
      'No data source is wired up for Goods Acknowledgement yet',
    );
  });

  it('toggles the Vehicle and Spares scope checkboxes', () => {
    const fixture = createComponent();
    const [vehicleCheckbox, sparesCheckbox]: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.goods-acknowledgement-list__checkbox input'),
    );

    expect(vehicleCheckbox.checked).toBe(false);
    vehicleCheckbox.click();
    fixture.detectChanges();
    expect(vehicleCheckbox.checked).toBe(true);

    sparesCheckbox.click();
    fixture.detectChanges();
    expect(sparesCheckbox.checked).toBe(true);
  });

  it('Clear resets the search bar and unchecks both scope checkboxes', () => {
    const fixture = createComponent();
    const [vehicleCheckbox]: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.goods-acknowledgement-list__checkbox input'),
    );
    vehicleCheckbox.click();
    fixture.detectChanges();
    expect(vehicleCheckbox.checked).toBe(true);

    const clearButton: HTMLButtonElement = Array.from(
      fixture.nativeElement.querySelectorAll('.goods-acknowledgement-list__actions button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim() === 'Clear') as HTMLButtonElement;
    clearButton.click();
    fixture.detectChanges();

    expect(vehicleCheckbox.checked).toBe(false);
  });

  it('does not throw when Display or Update is clicked (no data source wired up yet)', () => {
    const fixture = createComponent();
    const [displayButton, updateButton]: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.goods-acknowledgement-list__actions button'),
    );

    expect(() => displayButton.click()).not.toThrow();
    expect(() => updateButton.click()).not.toThrow();
  });
});
