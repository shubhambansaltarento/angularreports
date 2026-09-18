import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, output } from '@angular/core';

/** Fixed across every report for consistency — auto-dismiss-alert-and-hide-empty-table-across-all-reports-18-09-2026-12_23_PM.md. */
export const ALERT_AUTO_DISMISS_MS = 5000;

/**
 * Shared error/warning alert banner — a close ("×") button plus an auto-dismiss timer,
 * replacing every report's previously hand-rolled `<div role="alert">` block
 * (auto-dismiss-alert-and-hide-empty-table-across-all-reports-18-09-2026-12_23_PM.md). Emits
 * `dismissed` whichever way the banner goes away, so the consuming page can clear its own
 * `store.error()`-backed state. Does not own a Retry action — each report keeps its own
 * Retry button rendered alongside this component.
 */
@Component({
  selector: 'app-dismissible-alert',
  templateUrl: './dismissible-alert.component.html',
  styleUrl: './dismissible-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DismissibleAlertComponent implements OnInit {
  readonly message = input.required<string>();
  readonly autoDismissMs = input(ALERT_AUTO_DISMISS_MS);

  readonly dismissed = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  ngOnInit(): void {
    this.timeoutId = setTimeout(() => this.dismiss(), this.autoDismissMs());
  }

  protected dismiss(): void {
    this.clearTimer();
    this.dismissed.emit();
  }

  private clearTimer(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
