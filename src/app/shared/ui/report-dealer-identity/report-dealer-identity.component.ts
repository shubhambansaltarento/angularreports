import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Small, left-aligned "10015 - Pavan Sekhar Automobiles" identity line shown below the blue
 * report header bar on every report page —
 * dealer-identity-line-below-header-bar-21-09-2026-05_00_PM.md. No city segment: neither the
 * mock `DealerContextService` nor any report's config API response carries a city/location
 * field today (see that spec's Open decisions) — only `dealerCode`/`dealerDescription` exist,
 * so the line renders as "{code} - {name}" until a city source exists.
 */
@Component({
  selector: 'app-report-dealer-identity',
  templateUrl: './report-dealer-identity.component.html',
  styleUrl: './report-dealer-identity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDealerIdentityComponent {
  readonly dealerCode = input.required<string>();
  readonly dealerName = input.required<string>();
}
