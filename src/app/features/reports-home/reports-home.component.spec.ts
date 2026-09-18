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

  it('renders the "TVS ... Dealer Reports" branded header', () => {
    const fixture = createComponent();
    const header: HTMLElement = fixture.nativeElement.querySelector('.reports-home__header');
    expect(header.textContent).toContain('TVS');
    expect(header.textContent).toContain('Dealer Reports');
  });

  it('renders one flat card per report in REPORTS_CATALOG, in order, with no status-grouped sections', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelectorAll('.reports-home__section').length).toBe(0);

    const cards: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.reports-home__card');
    expect(cards.length).toBe(REPORTS_CATALOG.length);

    REPORTS_CATALOG.forEach((report, index) => {
      expect(cards[index].textContent).toContain(report.title);
      expect(cards[index].textContent).toContain(report.description);
    });
  });

  it('links each card to its report route', () => {
    const fixture = createComponent();
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll(
      '.reports-home__card-link',
    );
    expect(links[0].getAttribute('href')).toBe(`/${REPORTS_CATALOG[0].route}`);
  });

  it('renders a distinct icon for every card, regardless of apiIntegrated/hasTable', () => {
    const fixture = createComponent();
    const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.reports-home__icon i');
    expect(icons.length).toBe(REPORTS_CATALOG.length);
    icons.forEach((icon) => expect(icon.className).toContain('bi-'));
  });

  it('renders no "Search parameters only" badge — every card looks the same regardless of status', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.textContent).not.toContain('Search parameters only');
  });
});
