import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [provideRouter([{ path: '', component: BreadcrumbComponent }])],
    }).compileComponents();
  });

  it('renders the fixed two-level trail: Reports (link) then the current label (not a link)', () => {
    const fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.componentRef.setInput('currentLabel', 'Dealer Ledger');
    fixture.detectChanges();

    const items: NodeListOf<HTMLLIElement> = fixture.nativeElement.querySelectorAll('.breadcrumb-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent?.trim()).toBe('Reports');
    expect(items[0].querySelector('a')).toBeTruthy();
    expect(items[1].textContent?.trim()).toBe('Dealer Ledger');
    expect(items[1].querySelector('a')).toBeFalsy();
    expect(items[1].getAttribute('aria-current')).toBe('page');
  });

  it('the "Reports" crumb links to the root route', async () => {
    const fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.componentRef.setInput('currentLabel', 'Dealer Ledger');
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.breadcrumb-item a');
    expect(link.getAttribute('href')).toBe('/');
  });

  it('renders a semantic <nav aria-label="breadcrumb">', () => {
    const fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.componentRef.setInput('currentLabel', 'Dealer Ledger');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav[aria-label="breadcrumb"]')).toBeTruthy();
  });
});
