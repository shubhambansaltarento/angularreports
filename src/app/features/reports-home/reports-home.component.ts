import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REPORTS_CATALOG } from './reports.registry';

/**
 * Reports Home page — the landing/navigation page listing every report on the platform
 * (Multi-Report Framework Specification §6). Serves both entry modes named in the
 * requirement: a direct user visiting the app root, and a host application deep-linking
 * straight to `/<report-route>` when this app is loaded inside an iframe (in which case
 * this page is simply never reached, per the standard iframe-embed pattern of routing
 * directly to the report's own route rather than through a catalog page).
 */
@Component({
  selector: 'app-reports-home',
  imports: [RouterLink],
  templateUrl: './reports-home.component.html',
  styleUrl: './reports-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsHomeComponent {
  /**
   * Two status-derived groups — no report is named/hardcoded here, each report's own
   * `apiIntegrated` flag decides its section
   * (three-section-status-grouping-17-09-2026-09_10_AM.md, revised to two headings):
   * - In Progress: fully built against a real, live API.
   * - To Be Picked: everything else, including reports with a scaffolded table but no
   *   live data source yet (e.g. Goods Acknowledgement) and pure search-only placeholders.
   */
  protected readonly inProgressReports = computed(() => REPORTS_CATALOG.filter((report) => report.apiIntegrated));
  protected readonly toBePickedReports = computed(() => REPORTS_CATALOG.filter((report) => !report.apiIntegrated));
}
