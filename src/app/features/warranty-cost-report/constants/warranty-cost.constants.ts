/** Constants for the Warranty Cost Report feature. */
export const WARRANTY_COST_FEATURE_PATH = 'warranty-cost-report';

/** Report key for this feature's API calls (`reports/{reportKey}/config` and `/data`), confirmed via direct API testing. */
export const WARRANTY_COST_REPORT_KEY = 'WARRANTY_COST';

/** Default page (1-based) the store/table start on. */
export const WARRANTY_COST_DEFAULT_PAGE = 1;

/** Default rows-per-page — from the real config's `paging.defaultPageSize` (50). */
export const WARRANTY_COST_DEFAULT_PAGE_SIZE = 50;

/** The only Company Code option confirmed by the real config — silently defaulted, not user-editable (no visible field, per the reference SAP form). */
export const WARRANTY_COST_DEFAULT_COMPANY_CODE = 'TVSL';
