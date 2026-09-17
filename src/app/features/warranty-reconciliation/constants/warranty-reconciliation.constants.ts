/** Constants for the Warranty Reconciliation feature. */
export const WARRANTY_RECONCILIATION_FEATURE_PATH = 'warranty-reconciliation';

/**
 * Report key for this feature's API calls (`reports/{reportKey}/config` and `/data`),
 * confirmed via direct API testing — note the backend's own double-L spelling
 * ("Reconcillation"), sent verbatim; not a typo to "fix" client-side, per
 * api-integration-17-09-2026-08_37_AM.md.
 */
export const WARRANTY_RECONCILLATION_REPORT_KEY = 'WARRANTY_RECONCILLATION';

/** Default page (1-based) the store starts on. */
export const WARRANTY_RECONCILIATION_DEFAULT_PAGE = 1;

/** Default rows-per-page — from the real config's `paging.defaultPageSize` (50). */
export const WARRANTY_RECONCILIATION_DEFAULT_PAGE_SIZE = 50;

/** The only Company Code option confirmed by the real config — silently defaulted, not user-editable. */
export const WARRANTY_RECONCILIATION_DEFAULT_COMPANY_CODE = 'TVSL';
