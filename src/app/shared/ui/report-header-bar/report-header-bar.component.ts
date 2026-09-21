import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** An action icon this report actually supports today — see class doc. */
export type ReportHeaderBarAction = 'inputForm' | 'print' | 'export' | 'pdf';

const ACTION_ICON: Record<ReportHeaderBarAction, string> = {
  inputForm: 'bi-input-cursor-text',
  print: 'bi-printer',
  export: 'bi-box-arrow-up-right',
  pdf: 'bi-file-earmark-pdf',
};

const ACTION_LABEL: Record<ReportHeaderBarAction, string> = {
  inputForm: 'Input Form',
  print: 'Print',
  export: 'Export',
  pdf: 'PDF',
};

/**
 * Full-width, brand-blue title bar shown at the top of every report page, matching the
 * legacy SAP BusinessObjects look — legacy-sap-bo-style-report-redesign-21-09-2026-01_15_PM.md.
 * Shows the report's title on the left and only the action icons the consuming report opts
 * into via `actions()` (none of the reference actions — Input Form/Print/Export/PDF — are
 * assumed to exist for every report). Purely presentational: clicking an action emits
 * `actionClicked` for the consuming page to handle; this component has no navigation or
 * export/print behavior of its own.
 */
@Component({
  selector: 'app-report-header-bar',
  templateUrl: './report-header-bar.component.html',
  styleUrl: './report-header-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportHeaderBarComponent {
  readonly title = input.required<string>();

  /** Which action icons to show, in order — empty by default, since most reports support none of these yet. */
  readonly actions = input<ReportHeaderBarAction[]>([]);

  readonly actionClicked = output<ReportHeaderBarAction>();

  protected actionIcon(action: ReportHeaderBarAction): string {
    return ACTION_ICON[action];
  }

  protected actionLabel(action: ReportHeaderBarAction): string {
    return ACTION_LABEL[action];
  }
}
