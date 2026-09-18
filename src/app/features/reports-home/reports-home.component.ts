import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REPORTS_CATALOG } from './reports.registry';

/** Per-report icon (Bootstrap Icons glyph) + circle background color, keyed by `ReportConfig.id` — presentational only, not part of the shared `ReportConfig` model. */
const REPORT_CARD_STYLE_BY_ID: Record<string, { icon: string; color: string }> = {
  'dealer-ledger': { icon: 'bi-pie-chart-fill', color: '#3b82f6' },
  'warranty-reconciliation': { icon: 'bi-shield-check', color: '#93c5fd' },
  'warranty-cost-report': { icon: 'bi-receipt', color: '#22c55e' },
  'parts-packing-list': { icon: 'bi-box-seam', color: '#f97066' },
  'goods-acknowledgement': { icon: 'bi-file-earmark-check', color: '#2dd4bf' },
  'warranty-labour-tax-invoice': { icon: 'bi-receipt-cutoff', color: '#a78bfa' },
  'vor-print': { icon: 'bi-printer-fill', color: '#64748b' },
  pqm: { icon: 'bi-patch-check-fill', color: '#f5b942' },
};
const DEFAULT_CARD_STYLE = { icon: 'bi-file-earmark-text', color: '#94a3b8' };

/**
 * Reports Home page — the landing/navigation page listing every report on the platform
 * (Multi-Report Framework Specification §6), redesigned as a single flat, branded icon
 * card grid (branded-icon-card-grid-redesign-18-09-2026-12_34_PM.md) — no more status-derived
 * grouping (three-section-status-grouping-17-09-2026-09_10_AM.md superseded): every report
 * renders as an equal card, in `REPORTS_CATALOG`'s fixed order.
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

  protected cardStyle(reportId: string) {
    return REPORT_CARD_STYLE_BY_ID[reportId] ?? DEFAULT_CARD_STYLE;
  }
}
