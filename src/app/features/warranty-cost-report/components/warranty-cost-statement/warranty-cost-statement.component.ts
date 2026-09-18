import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WarrantyCostStatement } from '../../models/warranty-cost-statement.model';

/** ISO (yyyy-MM-dd) -> DD.MM.YYYY, matching the reference statement's date format. */
function toDisplayDate(isoDate: string | undefined): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

/** Today's date, formatted DD.MM.YYYY, for the statement's own "DATE :" line. */
function todayDisplayDate(): string {
  const today = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(today.getDate())}.${pad(today.getMonth() + 1)}.${today.getFullYear()}`;
}

/**
 * Renders the Warranty Cost statement/bill layout — feature-specific content projected
 * into the shared `HtmlPdfViewerComponent`, per
 * html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md. Reproduces the reference SAP-
 * generated PDF: letterhead, period/date/page line, a dealer-identity row + line-item table
 * + totals row per dealer group, and the yellow-highlighted summary block.
 */
@Component({
  selector: 'app-warranty-cost-statement',
  imports: [DecimalPipe],
  templateUrl: './warranty-cost-statement.component.html',
  styleUrl: './warranty-cost-statement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarrantyCostStatementComponent {
  readonly statement = input.required<WarrantyCostStatement>();
  readonly dateFrom = input<string | null>(null);
  readonly dateTo = input<string | null>(null);

  protected readonly periodLabel = computed(() => `${toDisplayDate(this.dateFrom() ?? undefined)} TO ${toDisplayDate(this.dateTo() ?? undefined)}`);
  protected readonly todayLabel = todayDisplayDate();
}
