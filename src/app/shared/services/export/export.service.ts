import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { ExportColumn } from './models/export-column.model';

/**
 * Reusable, domain-agnostic export capability. Callers (e.g. the Data Table) decide which
 * rows/columns to pass in — this service only knows how to turn a `{ rows, columns }` pair
 * into a downloaded file or a print view. It has no knowledge of filters, sorting,
 * pagination, or column visibility; "respect hidden columns" / "respect the current
 * filters/sort/pagination scope" are the caller's responsibility (pass only what should be
 * exported), which keeps this service reusable across any feature/table, not just Dealer
 * Ledger's.
 */
@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  exportToCsv<T>(rows: T[], columns: ExportColumn<T>[], filename = 'export'): void {
    const csv = this.toCsv(rows, columns);
    this.downloadBlob(csv, 'text/csv;charset=utf-8;', `${filename}.csv`);
  }

  /**
   * Generates an HTML table saved with a `.xls` extension/`application/vnd.ms-excel` MIME
   * type — a common dependency-free technique that Excel opens natively. This is NOT a
   * real binary `.xlsx` workbook (no multi-sheet/styling support); producing one would
   * require a library such as `xlsx` or `exceljs`, which has not been added.
   */
  exportToExcel<T>(rows: T[], columns: ExportColumn<T>[], filename = 'export'): void {
    const table = this.toHtmlTable(rows, columns);
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${table}</body></html>`;
    this.downloadBlob(html, 'application/vnd.ms-excel', `${filename}.xls`);
  }

  print<T>(rows: T[], columns: ExportColumn<T>[], title = 'Export'): void {
    if (!this.isBrowser) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return; // popup blocked — nothing reasonable to do without a UI surface here

    const table = this.toHtmlTable(rows, columns);
    printWindow.document.write(
      `<html><head><title>${this.escapeHtml(title)}</title><style>
        table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 0.875rem; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background: #f5f5f5; }
      </style></head><body><h1>${this.escapeHtml(title)}</h1>${table}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  /**
   * Placeholder: real PDF generation (e.g. via `jsPDF`/`pdfmake`) is not implemented — no
   * such dependency has been added. This method exists so the format is already wired
   * through the reusable Export surface (and any consuming toolbar) without requiring a
   * call-site change once real generation is implemented.
   */
  exportToPdf<T>(_rows: T[], _columns: ExportColumn<T>[], _filename = 'export'): void {
    throw new Error('PDF export is not yet implemented.');
  }

  private toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
    const header = columns.map((column) => this.escapeCsvValue(column.header)).join(',');
    const lines = rows.map((row) =>
      columns.map((column) => this.escapeCsvValue(this.formatValue(row[column.key]))).join(','),
    );
    return [header, ...lines].join('\r\n');
  }

  private toHtmlTable<T>(rows: T[], columns: ExportColumn<T>[]): string {
    const header = columns.map((column) => `<th>${this.escapeHtml(column.header)}</th>`).join('');
    const body = rows
      .map(
        (row) =>
          `<tr>${columns.map((column) => `<td>${this.escapeHtml(this.formatValue(row[column.key]))}</td>`).join('')}</tr>`,
      )
      .join('');
    return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
  }

  private escapeCsvValue(value: string): string {
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }

  private escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private formatValue(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  private downloadBlob(content: string, mimeType: string, filename: string): void {
    if (!this.isBrowser) return;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
