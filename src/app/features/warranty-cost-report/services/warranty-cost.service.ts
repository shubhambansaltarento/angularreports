import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { WARRANTY_COST_DATA_URL, WARRANTY_COST_REPORT_KEY } from '../constants/warranty-cost.constants';
import { WarrantyCostConfig } from '../models/warranty-cost-config.model';
import { WarrantyCostDatabricksRow } from '../models/warranty-cost-databricks-row.model';
import { WarrantyCostFilters } from '../models/warranty-cost-filters.model';
import { WarrantyCostDealerGroup, WarrantyCostStatement } from '../models/warranty-cost-statement.model';
import { WarrantyCostRow } from '../models/warranty-cost-row.model';
import { WarrantyCostSummary } from '../models/warranty-cost-summary.model';
import { formatDatabricksDate } from '../utils/format-databricks-date';
import { ReportApiService } from '../../../shared/services/report-api/report-api.service';

/** `dealerCode`'s real shape is a 10-digit, zero-padded customer number — same convention as Dealer Ledger's `kunnr`. */
const DEALER_CODE_PREFIX = '00000';

const EMPTY_SUMMARY: WarrantyCostSummary = {
  totalNdpRate: 0,
  totalExcise: 0,
  totalSalesTax: 0,
  totalLabour: 0,
  totalOctroi: 0,
  totalServiceTax: 0,
  totalCost: 0,
  partsValue: 0,
  totalFreight: 0,
  totalDemurrage: 0,
  totalValue: 0,
};

/**
 * Feature-level facade for Warranty Cost Report. Config comes from the generic, report-keyed
 * `ReportApiService` (`GET {baseUrl}reports/WARRANTY_COST/config` — confirmed live; the plain
 * `/warranty-cost/config` path does not exist). Data comes from the real, plain (not report-
 * keyed) `fetch-data-bricks-data` endpoint, called directly via `HttpClient`, with
 * `dealerCode` always zero-padded (same convention as Dealer Ledger's `kunnr`).
 */
@Injectable()
export class WarrantyCostService {
  private readonly http = inject(HttpClient);
  private readonly reportApi = inject(ReportApiService);

  /** Fetches this report's config once — called on page entry, not per data request. */
  getConfig(): Observable<WarrantyCostConfig | null> {
    console.log(`[Warranty Cost Report] Loading report config for "${WARRANTY_COST_REPORT_KEY}"...`);

    return this.reportApi.getConfig<WarrantyCostConfig>(WARRANTY_COST_REPORT_KEY).pipe(
      tap((config) => console.log('[Warranty Cost Report] Report config loaded:', config)),
      catchError((error) => {
        console.error('[Warranty Cost Report] Report config fetch failed.', error);
        return of(null);
      }),
    );
  }

  getEntries(filters: WarrantyCostFilters): Observable<WarrantyCostStatement> {
    const body = {
      dealerCode: filters.dealerCode ? DEALER_CODE_PREFIX + filters.dealerCode : '',
      companyCode: filters.companyCode ?? '',
      fromDate: filters.dateFrom ?? '',
      toDate: filters.dateTo ?? '',
    };
    console.log('[Warranty Cost Report] Loading report data...', body);

    return this.http.post<WarrantyCostDatabricksRow[]>(WARRANTY_COST_DATA_URL, body).pipe(
      tap((rows) => console.log('[Warranty Cost Report] Report data loaded (raw):', rows)),
      map((rows) => this.toStatement(rows)),
      tap((statement) => console.log('[Warranty Cost Report] Report data mapped.', statement)),
    );
  }

  private toStatement(rawRows: WarrantyCostDatabricksRow[]): WarrantyCostStatement {
    const rowsByDealer = new Map<string, { dealerName: string; rows: WarrantyCostRow[] }>();

    for (const rawRow of rawRows) {
      const dealerCode = rawRow.dealer ?? '';
      const group = rowsByDealer.get(dealerCode) ?? { dealerName: rawRow.dealer_name ?? '', rows: [] };
      group.rows.push(this.toRow(rawRow));
      rowsByDealer.set(dealerCode, group);
    }

    const dealerGroups: WarrantyCostDealerGroup[] = Array.from(rowsByDealer.entries()).map(
      ([dealerCode, { dealerName, rows }]) => ({
        dealerCode,
        dealerName,
        rows,
        summary: this.summarize(rows),
      }),
    );

    const allRows = dealerGroups.flatMap((group) => group.rows);
    return { dealerGroups, grandTotal: allRows.length ? this.summarize(allRows) : EMPTY_SUMMARY };
  }

  private toRow(row: WarrantyCostDatabricksRow): WarrantyCostRow {
    return {
      dealerCode: row.dealer ?? '',
      dealerName: row.dealer_name ?? '',
      cnMemoNo: row.cn_memo_no ?? '',
      docDate: formatDatabricksDate(row.doc_date),
      orderNum: row.order_num ?? '',
      orderDate: formatDatabricksDate(row.order_date),
      dlrRefNum: row.dlr_ref_num ?? '',
      refDate: formatDatabricksDate(row.ref_date),
      partNumber: row.part_number ?? '',
      description: row.description ?? '',
      quantity: row.quantity ?? 0,
      ndpRate: row.ndp_rate ?? 0,
      excise: row.excise ?? 0,
      salesTax: row.sales_tax ?? 0,
      labour: row.labour ?? 0,
      octroi: row.octroi ?? 0,
      serviceTax: row.service_tax ?? 0,
      totCost: row.tot_cost ?? 0,
      freight: row.freight ?? 0,
      demurrage: row.demurrage ?? 0,
    };
  }

  /** Sums a set of rows' cost columns and derives the yellow-highlighted summary block's figures from the same totals. */
  private summarize(rows: WarrantyCostRow[]): WarrantyCostSummary {
    const sum = (selector: (row: WarrantyCostRow) => number) => rows.reduce((total, row) => total + selector(row), 0);

    const totalNdpRate = sum((row) => row.ndpRate);
    const totalExcise = sum((row) => row.excise);
    const totalSalesTax = sum((row) => row.salesTax);
    const totalLabour = sum((row) => row.labour);
    const totalOctroi = sum((row) => row.octroi);
    const totalServiceTax = sum((row) => row.serviceTax);
    const totalCost = sum((row) => row.totCost);
    const totalFreight = sum((row) => row.freight);
    const totalDemurrage = sum((row) => row.demurrage);
    const partsValue = totalCost;
    const totalValue = partsValue + totalFreight + totalDemurrage;

    return {
      totalNdpRate,
      totalExcise,
      totalSalesTax,
      totalLabour,
      totalOctroi,
      totalServiceTax,
      totalCost,
      partsValue,
      totalFreight,
      totalDemurrage,
      totalValue,
    };
  }
}
