/** Generic pagination descriptor — matches `WarrantyCostReport`'s own `pagination.model.ts`. */
export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
}
