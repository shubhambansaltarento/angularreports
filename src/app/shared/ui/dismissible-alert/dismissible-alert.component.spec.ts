import { TestBed } from '@angular/core/testing';
import { DismissibleAlertComponent } from './dismissible-alert.component';

describe('DismissibleAlertComponent', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [DismissibleAlertComponent] }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createComponent(autoDismissMs?: number) {
    const fixture = TestBed.createComponent(DismissibleAlertComponent);
    fixture.componentRef.setInput('message', 'Something went wrong.');
    if (autoDismissMs !== undefined) fixture.componentRef.setInput('autoDismissMs', autoDismissMs);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the message and a close button with role="alert"', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Something went wrong.');
    expect(fixture.nativeElement.querySelector('.dismissible-alert__close')).toBeTruthy();
  });

  it('emits dismissed when the close button is clicked', () => {
    const fixture = createComponent();
    let dismissed = false;
    fixture.componentInstance.dismissed.subscribe(() => (dismissed = true));

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.dismissible-alert__close');
    closeButton.click();

    expect(dismissed).toBe(true);
  });

  it('emits dismissed on its own once the auto-dismiss delay elapses', () => {
    const fixture = createComponent(1000);
    let dismissed = false;
    fixture.componentInstance.dismissed.subscribe(() => (dismissed = true));

    vi.advanceTimersByTime(999);
    expect(dismissed).toBe(false);

    vi.advanceTimersByTime(1);
    expect(dismissed).toBe(true);
  });

  it('does not emit dismissed twice when closed manually before the timer elapses', () => {
    const fixture = createComponent(1000);
    let dismissedCount = 0;
    fixture.componentInstance.dismissed.subscribe(() => dismissedCount++);

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.dismissible-alert__close');
    closeButton.click();
    vi.advanceTimersByTime(1000);

    expect(dismissedCount).toBe(1);
  });
});
