/**
 * Constants for the Dealer Ledger feature.
 *
 * TODO: Add permission keys once the RBAC / Authorization Model specification is approved.
 */
export const DEALER_LEDGER_FEATURE_PATH = 'dealer-ledger';

/** Report key for this feature's API calls (`reports/{reportKey}/config` and `/data`) — api-integration-16-09-2026-02_28_PM.md. */
export const DEALER_LEDGER_REPORT_KEY = 'DEALER_LEDGER';

/** Default page (1-based) the store/table start on, and the target of Search/Reset. */
export const DEALER_LEDGER_DEFAULT_PAGE = 1;

/** Default rows-per-page for the table's client-side pagination (spec-table-default-page-size-10.md). */
export const DEALER_LEDGER_DEFAULT_PAGE_SIZE = 10;
