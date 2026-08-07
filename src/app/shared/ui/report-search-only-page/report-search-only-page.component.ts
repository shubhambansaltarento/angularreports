import { ChangeDetectionStrategy, Component, computed, inject, input, viewChild } from '@angular/core';
import { CommonReportSearchFilters } from '../../models/report-search-filters.model';
import { DealerContextService } from '../../services/dealer-context/dealer-context.service';
import { ReportSearchBarComponent } from '../report-search-bar/report-search-bar.component';

/**
 * Shared route target for every report that has search parameters defined but no table/
 * data source yet (Multi-Report Framework Specification §6/§13 — reports without
 * confirmed source data get a route and search parameters, never a fabricated table).
 * One component serves all such reports; each route supplies only `title`/`description`
 * via route `data` (see `app.routes.ts`), sourced from that report's own `ReportConfig`.
 */
@Component({
  selector: 'app-report-search-only-page',
  imports: [ReportSearchBarComponent],
  templateUrl: './report-search-only-page.component.html',
  styleUrl: './report-search-only-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSearchOnlyPageComponent {
  readonly title = input('');
  readonly description = input('');

  private readonly dealerContext = inject(DealerContextService).dealerContext;
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
