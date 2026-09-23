import { ChangeDetectionStrategy, Component, computed, inject, input, viewChild } from '@angular/core';
import { CommonReportSearchFilters } from '../../models/report-search-filters.model';
import { DealerContextService } from '../../services/dealer-context/dealer-context.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { TableColumn } from '../data-table/models/table-column.model';
import { ReportDealerIdentityComponent } from '../report-dealer-identity/report-dealer-identity.component';
import { ReportHeaderBarComponent } from '../report-header-bar/report-header-bar.component';
import { ReportSearchBarComponent } from '../report-search-bar/report-search-bar.component';

/** A single generic placeholder row — every cell just echoes its own column letter. */
interface PlaceholderRow extends Record<string, unknown> {
  id: string;
  a: string;
  b: string;
  c: string;
  d: string;
}

/**
 * Four generic "A"/"B"/"C"/"D" columns and rows whose cells echo their own column
 * letter — stands in for this report's real columns/rows until its actual schema is
 * confirmed, so the shared `DataTableComponent` (and its header/striping/pagination/export
 * chrome) is visibly present and matches every other report's look, rather than showing a
 * "no table yet" placeholder message — report-search-only-page-table-and-button-theme-23-09-2026-03_30_PM.md.
 */
const PLACEHOLDER_COLUMNS: TableColumn<PlaceholderRow>[] = [
  { key: 'a', header: 'A', sortable: true },
  { key: 'b', header: 'B', sortable: true },
  { key: 'c', header: 'C', sortable: true },
  { key: 'd', header: 'D', sortable: true },
];

const PLACEHOLDER_ROWS: PlaceholderRow[] = Array.from({ length: 5 }, (_, index) => ({
  id: String(index),
  a: 'a',
  b: 'b',
  c: 'c',
  d: 'd',
}));

/**
 * Shared route target for every report that has search parameters defined but no confirmed
 * table schema/data source yet (Multi-Report Framework Specification §6/§13). One component
 * serves all such reports; each route supplies only `title`/`description` via route `data`
 * (see `app.routes.ts`), sourced from that report's own `ReportConfig`. Renders a placeholder
 * table (see `PLACEHOLDER_COLUMNS`/`PLACEHOLDER_ROWS` above) so the page's overall look
 * matches every other report's, even though no real schema/rows exist yet.
 */
@Component({
  selector: 'app-report-search-only-page',
  imports: [ReportSearchBarComponent, ReportHeaderBarComponent, ReportDealerIdentityComponent, DataTableComponent],
  templateUrl: './report-search-only-page.component.html',
  styleUrl: './report-search-only-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSearchOnlyPageComponent {
  readonly title = input('');
  readonly description = input('');

  protected readonly placeholderColumns = PLACEHOLDER_COLUMNS;
  protected readonly placeholderRows = PLACEHOLDER_ROWS;

  protected readonly dealerContext = inject(DealerContextService).dealerContext;
  protected readonly searchBar = viewChild.required(ReportSearchBarComponent);

  /** Prefills the common search fields from the current dealer's context (mocked auth API). */
  protected readonly initialValue = computed<CommonReportSearchFilters>(() => {
    const context = this.dealerContext();
    return {
      dealerCode: context.dealerCode,
      dealerDescription: context.dealerDescription,
      companyCode: context.companyCode,
      dateFrom: null,
      dateTo: null,
    };
  });

  protected onSearch(): void {
    // No Store/data source wired up yet for this report — this method is the seam a
    // future `<Report>Store.search(this.searchBar().value())` call will replace once the
    // report's table/data source is specified.
  }

  protected onReset(): void {
    this.searchBar().reset();
  }
}
