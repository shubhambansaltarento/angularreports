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

  it('renders one card per report in the catalog, with title and description', () => {
    const fixture = createComponent();
    const cards = fixture.nativeElement.querySelectorAll('.reports-home__card');
    expect(cards.length).toBe(REPORTS_CATALOG.length);

    const firstCard = cards[0];
    expect(firstCard.textContent).toContain(REPORTS_CATALOG[0].title);
    expect(firstCard.textContent).toContain(REPORTS_CATALOG[0].description);
  });

  it('links each card to its report route', () => {
    const fixture = createComponent();
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll(
      '.reports-home__card-link',
    );
    expect(links[0].getAttribute('href')).toBe(`/${REPORTS_CATALOG[0].route}`);
  });

  it('shows a "Search parameters only" badge for reports with no table', () => {
    const fixture = createComponent();
    const searchOnlyReport = REPORTS_CATALOG.find((report) => !report.hasTable);
    if (!searchOnlyReport) return; // nothing to assert if every report currently has a table

    const cards: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.reports-home__card');
    const card = Array.from(cards).find((element) => element.textContent?.includes(searchOnlyReport.title));
    expect(card?.textContent).toContain('Search parameters only');
  });

  it('groups reports into two status sections — Reports in Progress, Reports to be Picked (three-section-status-grouping-17-09-2026-09_10_AM.md, revised to two headings)', () => {
    const fixture = createComponent();
    const sections: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.reports-home__section');
    expect(sections.length).toBe(2);

    const inProgress = REPORTS_CATALOG.filter((report) => report.apiIntegrated);
    const toBePicked = REPORTS_CATALOG.filter((report) => !report.apiIntegrated);

    expect(sections[0].querySelector('h2')?.textContent).toContain('Reports in Progress');
    expect(sections[1].querySelector('h2')?.textContent).toContain('Reports to be Picked');

    [
      [sections[0], inProgress],
      [sections[1], toBePicked],
    ].forEach(([section, reports]) => {
      const cards = (section as HTMLElement).querySelectorAll('.reports-home__card');
      expect(cards.length).toBe((reports as typeof REPORTS_CATALOG).length);
      (reports as typeof REPORTS_CATALOG).forEach((report, index) => {
        expect(cards[index].textContent).toContain(report.title);
      });
    });

    expect(sections[0].textContent).not.toContain('Search parameters only');
  });

  it('places Goods Acknowledgement in "Reports to be Picked", not "Reports in Progress" — it has no live data source yet', () => {
    const fixture = createComponent();
    const sections: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.reports-home__section');

    expect(sections[0].textContent).not.toContain('Goods Acknowledgement');
    expect(sections[1].textContent).toContain('Goods Acknowledgement');
  });
});
