import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { DealerContextService } from '../../../../shared/services/dealer-context/dealer-context.service';
import { CommonReportSearchFilters } from '../../../../shared/models/report-search-filters.model';
import { DataTableComponent } from '../../../../shared/ui/data-table/data-table.component';
import { TableColumn } from '../../../../shared/ui/data-table/models/table-column.model';
import { ReportDealerIdentityComponent } from '../../../../shared/ui/report-dealer-identity/report-dealer-identity.component';
import { ReportHeaderBarComponent } from '../../../../shared/ui/report-header-bar/report-header-bar.component';
import { ReportSearchBarComponent } from '../../../../shared/ui/report-search-bar/report-search-bar.component';
import { GoodsAcknowledgementFilters } from '../../models/goods-acknowledgement-filters.model';
import { GoodsAcknowledgementRow } from '../../models/goods-acknowledgement-row.model';

const GOODS_ACKNOWLEDGEMENT_TABLE_COLUMNS: TableColumn<GoodsAcknowledgementRow>[] = [
  { key: 'invoiceNumber', header: 'Invoice No.', sortable: true },
  { key: 'shipmentNumber', header: 'Shipment No.', sortable: true },
  { key: 'date', header: 'Date', sortable: true },
];

/**
 * Goods Acknowledgement list page — search parameters and table structure per the
 * Multi-Report Framework Specification, deliberately with no rows: this report's actual
 * data shape/source has not been confirmed, so no mock or real data is wired up here
 * (see `goods-acknowledgement.config.ts`). The table renders its real columns plus a
 * "Select" checkbox column (via the shared Data Table's `selectionMode`) against an
 * always-empty dataset, so its empty state is honest rather than fabricated.
 */
@Component({
  selector: 'app-goods-acknowledgement-list',
  imports: [ReportSearchBarComponent, DataTableComponent, ReportHeaderBarComponent, ReportDealerIdentityComponent],
  templateUrl: './goods-acknowledgement-list.component.html',
  styleUrl: './goods-acknowledgement-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodsAcknowledgementListComponent {
  protected readonly title = 'Goods Acknowledgement';
  protected readonly columns = GOODS_ACKNOWLEDGEMENT_TABLE_COLUMNS;
  /** Always empty — no data source is wired up yet for this report (see class doc). */
  protected readonly rows: GoodsAcknowledgementRow[] = [];

  protected readonly dealerContext = inject(DealerContextService).dealerContext;
  protected readonly searchBar = viewChild.required(ReportSearchBarComponent);

  protected readonly vehicleSelected = signal(false);
  protected readonly sparesSelected = signal(false);

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

  protected toggleVehicle(): void {
    this.vehicleSelected.update((selected) => !selected);
  }

  protected toggleSpares(): void {
    this.sparesSelected.update((selected) => !selected);
  }

  /** No data source exists yet — this is the seam a future Store/Repository call replaces. */
  protected onDisplay(): void {
    this.currentFilters();
  }

  /** No data source exists yet — this is the seam a future update/save call replaces. */
  protected onUpdate(): void {
    this.currentFilters();
  }

  protected onClear(): void {
    this.searchBar().reset();
    this.vehicleSelected.set(false);
    this.sparesSelected.set(false);
  }

  private currentFilters(): GoodsAcknowledgementFilters {
    const common = this.searchBar().value();
    return {
      dealerCode: common.dealerCode ?? undefined,
      dealerDescription: common.dealerDescription ?? undefined,
      companyCode: common.companyCode ?? undefined,
      dateFrom: common.dateFrom ?? undefined,
      dateTo: common.dateTo ?? undefined,
      vehicle: this.vehicleSelected(),
      spares: this.sparesSelected(),
    };
  }
}
