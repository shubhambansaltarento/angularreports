/**
 * Generic pagination descriptor.
 *
 * TODO: Promote to a shared/platform-wide model (`libs/shared/interfaces`) once the
 * Shared layer exists, per the Folder Structure Specification §10 — this shape has no
 * Dealer-Ledger-specific meaning and is a candidate for reuse across every feature.
 */
export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
}
