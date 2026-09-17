/** Real `VALIDATION_FAILED` error body shape, mirroring `WarrantyCostValidationErrorBody`. */
export interface WarrantyReconciliationValidationErrorBody {
  traceId: string;
  code: string;
  errors: { field: string; code: string; message: string; params?: Record<string, unknown> }[];
}
