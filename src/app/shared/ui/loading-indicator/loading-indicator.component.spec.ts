import { TestBed } from '@angular/core/testing';
import { LoadingIndicatorComponent } from './loading-indicator.component';

describe('LoadingIndicatorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoadingIndicatorComponent] }).compileComponents();
  });

  it('renders a status role and the default "Loading report..." message', () => {
    const fixture = TestBed.createComponent(LoadingIndicatorComponent);
    fixture.detectChanges();

    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.textContent).toContain('Loading report...');
  });

  it('renders a custom message when provided', () => {
    const fixture = TestBed.createComponent(LoadingIndicatorComponent);
    fixture.componentRef.setInput('message', 'Fetching data...');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Fetching data...');
  });
});
