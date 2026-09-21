import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReportsHomeComponent } from './reports-home.component';
import { REPORTS_CATALOG } from './reports.registry';

describe('ReportsHomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsHomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ReportsHomeComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('creates', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a simple "TVS Dealer Reports" heading', () => {
    const fixture = createComponent();
    const header: HTMLElement = fixture.nativeElement.querySelector('.reports-home__header');
    expect(header.textContent?.trim()).toBe('TVS Dealer Reports');
  });

  it('renders one flat row per report in REPORTS_CATALOG, in order, top to bottom', () => {
    const fixture = createComponent();
    const rows: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.reports-home__row');
    expect(rows.length).toBe(REPORTS_CATALOG.length);

    REPORTS_CATALOG.forEach((report, index) => {
      expect(rows[index].textContent).toContain(report.title);
      expect(rows[index].textContent).toContain(report.description);
    });
  });

  it('links each row to its report route', () => {
    const fixture = createComponent();
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll(
      '.reports-home__row-link',
    );
    expect(links[0].getAttribute('href')).toBe(`/${REPORTS_CATALOG[0].route}`);
  });

  it('renders no icon for any report row', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('.bi')).toBeFalsy();
  });

  it('renders no "Search parameters only" badge — every row looks the same regardless of status', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.textContent).not.toContain('Search parameters only');
  });
});
