/**
 * Structured validation-error body confirmed from the real backend — e.g. requesting a
 * Claim Date range over 366 days returns this shape instead of the normal `/data`
 * response — data-mapping-fixes-from-real-rows-17-09-2026-08_02_AM.md.
 */
export interface WarrantyCostValidationErrorBody {
  traceId: string;
  code: string;
  errors: { field: string; code: string; message: string; params?: Record<string, unknown> }[];
}
