/** ISO (yyyy-MM-dd) form, matching the `<input type="date">` value shape. */
function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Default Report Range — one month up to today — applied on load and on Reset. Shared
 * across reports (originally Dealer-Ledger-only, generalized once Warranty Cost Report
 * needed the identical default —
 * warranty-cost-report-dealer-ledger-style-page-17-09-2026-07_28_AM.md).
 */
export function defaultDateRange(): { dateFrom: string; dateTo: string } {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setMonth(dateFrom.getMonth() - 1);
  return { dateFrom: toIsoDate(dateFrom), dateTo: toIsoDate(dateTo) };
}
