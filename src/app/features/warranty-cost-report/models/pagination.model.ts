/** Generic pagination descriptor — matches Dealer Ledger's own `pagination.model.ts`. */
export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
}
