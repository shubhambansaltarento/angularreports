/** Constants for the Parts Packing List feature. */
export const PARTS_PACKING_LIST_FEATURE_PATH = 'parts-packing-list';

/**
 * Real, confirmed endpoints — a plain top-level path, not the generic
 * `{baseUrl}reports/{reportKey}/...` contract other reports use (there is no `reportKey`
 * here), per parts-packing-list-real-api-and-dynamic-columns-17-09-2026-06_38_PM.md. The data
 * endpoint was renamed by the backend to `fetch-data-bricks-data`, per
 * databricks-endpoints-renamed-to-fetch-data-bricks-data-18-09-2026-11_52_AM.md — the config
 * endpoint's path is unaffected.
 */
export const PARTS_PACKING_LIST_CONFIG_URL = 'http://localhost:8080/parts-packing-list/config';
export const PARTS_PACKING_LIST_DATA_URL = 'http://localhost:8080/parts-packing-list/fetch-data-bricks-data';

/** Default rows-per-page for the (unpaginated-API, client-side-paginated) table. */
export const PARTS_PACKING_LIST_DEFAULT_PAGE_SIZE = 50;
