import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REPORTS_CATALOG } from './reports.registry';

/**
 * Reports Home page — the landing/navigation page listing every report on the platform
 * (Multi-Report Framework Specification §6), as a simple top-to-bottom list, no icons —
 * simple-list-home-page-21-09-2026-07_00_PM.md (supersedes the earlier icon card grid,
 * branded-icon-card-grid-redesign-18-09-2026-12_34_PM.md). Every report renders as an equal
 * row, in `REPORTS_CATALOG`'s fixed order.
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
