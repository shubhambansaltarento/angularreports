import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReportSearchOnlyPageComponent } from './report-search-only-page.component';
import { DealerContextService } from '../../services/dealer-context/dealer-context.service';

describe('ReportSearchOnlyPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSearchOnlyPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ReportSearchOnlyPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the title and description passed via route data', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('title', 'My Report');
    fixture.componentRef.setInput('description', 'Report description');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-report-header-bar').textContent).toContain('My Report');
    expect(fixture.nativeElement.textContent).toContain('Report description');
  });

  it('omits the description paragraph when description is empty', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('title', 'My Report');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.report-search-only-page__description')).toBeFalsy();
  });

  it('prefills the search bar from the dealer context', () => {
    const fixture = createComponent();
    const dealerContext = TestBed.inject(DealerContextService).dealerContext();

    const dealerCodeInput: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-dealer-code');
    expect(dealerCodeInput.value).toBe(dealerContext.dealerCode);
  });

  it('shows the "table not yet available" placeholder message referencing the title', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('title', 'My Report');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('The table for "My Report" is not yet available');
  });

  it('reset() clears the search bar back to empty values', () => {
    const fixture = createComponent();
    const dealerCodeInput: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-dealer-code');
    expect(dealerCodeInput.value).not.toBe('');

    const resetButton: HTMLButtonElement = Array.from(
      fixture.nativeElement.querySelectorAll('.report-search-only-page__actions button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim() === 'Reset') as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    expect(dealerCodeInput.value).toBe('');
  });

  it('does not throw when Search is clicked (no data source wired up yet)', () => {
    const fixture = createComponent();
    const searchButton: HTMLButtonElement = Array.from(
      fixture.nativeElement.querySelectorAll('.report-search-only-page__actions button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim() === 'Search') as HTMLButtonElement;

    expect(() => searchButton.click()).not.toThrow();
  });
});
