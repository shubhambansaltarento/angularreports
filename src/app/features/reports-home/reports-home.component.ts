import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  protected readonly reports = REPORTS_CATALOG;
}
