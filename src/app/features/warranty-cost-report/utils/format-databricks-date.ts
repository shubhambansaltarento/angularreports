/**
 * Formats the Warranty Cost Databricks API's numeric `YYYYMMDD` date strings (e.g.
 * `"20250121"`) as `DD.MM.YYYY` (e.g. `"21.01.2025"`), matching the reference statement
 * PDF's own date format — html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md. Unique to
 * this report; every other report's dates are ISO/`DD-MM-YYYY`. Falls back to the raw
 * string, unchanged, for anything not matching the expected 8-digit shape.
 */
export function formatDatabricksDate(value: string | undefined): string {
  if (!value) return '';
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}
