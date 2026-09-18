import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shared, domain-agnostic loading indicator (spinner + message) shown while a report's
 * data fetch is in flight — per
 * loading-indicator-while-report-fetches-across-all-reports-18-09-2026-01_57_PM.md. Every
 * report's list page shows this whenever `store.loading()` is `true`, in place of its
 * table/viewer.
 */
@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingIndicatorComponent {
  readonly message = input('Loading report...');
}
