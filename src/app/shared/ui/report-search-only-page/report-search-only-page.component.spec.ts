import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReportSearchOnlyPageComponent } from './report-search-only-page.component';

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

  it('renders no Dealer Code/Description/Company Code fields — that identity is shown by ReportDealerIdentityComponent above, not this form (remove-dealer-code-description-company-code-section-23-09-2026-04_00_PM.md)', () => {
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-code')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-dealer-description')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#report-search-bar-company-code')).toBeFalsy();
  });

  it('renders a placeholder data table with generic A/B/C/D columns and rows, matching every other report\'s table look (report-search-only-page-table-and-button-theme-23-09-2026-03_30_PM.md)', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('title', 'My Report');
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('app-data-table');
    expect(table).toBeTruthy();
    const headers: NodeListOf<HTMLElement> = table.querySelectorAll('th');
    expect(Array.from(headers).map((header) => header.textContent?.trim().charAt(0))).toEqual(['A', 'B', 'C', 'D']);
    expect(table.querySelectorAll('tr[cdk-row]').length).toBeGreaterThan(0);
  });

  it('reset() clears the search bar back to empty values', () => {
    const fixture = createComponent();
    const dateFromInput: HTMLInputElement = fixture.nativeElement.querySelector('#report-search-bar-date-from');
    dateFromInput.value = '2026-01-01';
    dateFromInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(dateFromInput.value).toBe('2026-01-01');

    const resetButton: HTMLButtonElement = Array.from(
      fixture.nativeElement.querySelectorAll('.report-search-only-page__actions button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim() === 'Reset') as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    expect(dateFromInput.value).toBe('');
  });

  it('does not throw when Show Report is clicked (no data source wired up yet)', () => {
    const fixture = createComponent();
    const searchButton: HTMLButtonElement = Array.from(
      fixture.nativeElement.querySelectorAll('.report-search-only-page__actions button'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim() === 'Show Report') as HTMLButtonElement;

    expect(() => searchButton.click()).not.toThrow();
  });
});
