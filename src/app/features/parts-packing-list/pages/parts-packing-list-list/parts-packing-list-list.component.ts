import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreadcrumbComponent } from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import { DismissibleAlertComponent } from '../../../../shared/ui/dismissible-alert/dismissible-alert.component';
import { LoadingIndicatorComponent } from '../../../../shared/ui/loading-indicator/loading-indicator.component';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { PartsPackingListTableComponent } from '../../components/parts-packing-list-table/parts-packing-list-table.component';
import { PartsPackingListFilterComponent } from '../../filters/parts-packing-list-filter/parts-packing-list-filter.component';
import { PartsPackingListConfig } from '../../models/parts-packing-list-config.model';
import { PartsPackingListFilters } from '../../models/parts-packing-list-filters.model';
import { PartsPackingListService } from '../../services/parts-packing-list.service';
import { PartsPackingListStore } from '../../store/parts-packing-list.store';

/**
 * Parts Packing List page — real API integration
 * (parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md). Config is fetched
 * once on entry (logged only — this report's own UI never shows Dealer Code/Name, so
 * nothing here is bound to the config response). No data fetch happens until
 * Process/"Show Report" fires (`store.hasSearched()` gates the table, matching Dealer
 * Ledger/Warranty reports' hide-table-until-submit behavior).
 *
 * `dealerCode` is supplied invisibly from `DealerContextService`, since this report's own
 * filter panel has no Dealer Code field (Open decisions, same spec).
 */
@Component({
  selector: 'app-parts-packing-list-list',
  imports: [BreadcrumbComponent, PartsPackingListFilterComponent, PartsPackingListTableComponent, DismissibleAlertComponent, LoadingIndicatorComponent],
  templateUrl: './parts-packing-list-list.component.html',
  styleUrl: './parts-packing-list-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartsPackingListListComponent {
  protected readonly title = 'Parts Packing List';
  protected readonly store = inject(PartsPackingListStore);
  private readonly partsPackingListService = inject(PartsPackingListService);
  private readonly dealerContext = inject(DealerContextService).dealerContext;
  protected readonly filter = viewChild.required(PartsPackingListFilterComponent);

  protected readonly config = signal<PartsPackingListConfig | null>(null);

  constructor() {
    this.partsPackingListService
      .getConfig()
      .pipe(takeUntilDestroyed())
      .subscribe((config) => this.config.set(config));
  }

  protected onSearch(filters: PartsPackingListFilters): void {
    const config = this.config();
    const dealerCode = config?.context.dealerCode ?? this.dealerContext().dealerCode;
    const companyCode = (config?.parameters.find((parameter) => parameter.name === 'companyCode')
      ?.defaultValue as string | undefined) ?? '';

    this.store.search(dealerCode, companyCode, filters);
  }

  /** The page's single Process/"Show Report" action — triggers the filter panel's own submit logic. */
  protected onProcess(): void {
    this.filter().submit();
  }

  protected onRetry(): void {
    this.store.refresh();
  }
}
