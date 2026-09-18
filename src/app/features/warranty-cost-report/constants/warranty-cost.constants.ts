/** Constants for the Warranty Cost Report feature. */
export const WARRANTY_COST_FEATURE_PATH = 'warranty-cost-report';

/** Report key for the generic config endpoint (`reports/{reportKey}/config`) — confirmed live, unlike the plain `/warranty-cost/config` path (404). */
export const WARRANTY_COST_REPORT_KEY = 'WARRANTY_COST';

/** Real, confirmed data endpoint — a plain top-level path, not the generic `{baseUrl}reports/{reportKey}/...` contract. */
export const WARRANTY_COST_DATA_URL = 'http://localhost:8080/warranty-cost/fetch-data-bricks-data';
