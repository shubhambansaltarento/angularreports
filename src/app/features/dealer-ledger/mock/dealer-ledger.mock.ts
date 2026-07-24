import { DealerLedgerColumn } from '../models/dealer-ledger-column.model';
import { DealerLedgerFilters } from '../models/dealer-ledger-filters.model';
import { DealerLedgerRequest } from '../models/dealer-ledger-request.model';
import { DealerLedgerResponse } from '../models/dealer-ledger-response.model';
import { FilterState } from '../models/filter-state.model';
import { Pagination } from '../models/pagination.model';
import { SelectionState } from '../models/selection-state.model';
import { Sort } from '../models/sort.model';
import { TableState } from '../models/table-state.model';
import { computeDealerLedgerSummary, DEALER_LEDGER_MOCK_ROWS } from './dealer-ledger-data.generator';

/**
 * Fixture data for local development/testing of everything *around* the table (columns,
 * filters, table/filter/selection state) — the row dataset itself lives in
 * dealer-ledger-data.generator.ts (50 generated records backing the mock service).
 */

export const DEALER_LEDGER_MOCK_COLUMNS: DealerLedgerColumn[] = [
  { key: 'dealerCode', headerLabel: 'Dealer Code', dataType: 'text', sortable: true, filterable: true, hidden: false, pinned: 'start', order: 0, width: 120 },
  { key: 'dealerName', headerLabel: 'Dealer Name', dataType: 'text', sortable: true, filterable: true, hidden: false, pinned: null, order: 1, width: 200 },
  { key: 'invoiceNumber', headerLabel: 'Invoice Number', dataType: 'text', sortable: true, filterable: false, hidden: false, pinned: null, order: 2, width: 150 },
  { key: 'invoiceDate', headerLabel: 'Invoice Date', dataType: 'date', sortable: true, filterable: true, hidden: false, pinned: null, order: 3, width: 130 },
  { key: 'transactionType', headerLabel: 'Transaction Type', dataType: 'text', sortable: true, filterable: true, hidden: false, pinned: null, order: 4, width: 150 },
  { key: 'debit', headerLabel: 'Debit', dataType: 'currency', sortable: true, filterable: false, hidden: false, pinned: null, order: 5, width: 120 },
  { key: 'credit', headerLabel: 'Credit', dataType: 'currency', sortable: true, filterable: false, hidden: false, pinned: null, order: 6, width: 120 },
  { key: 'balance', headerLabel: 'Balance', dataType: 'currency', sortable: true, filterable: false, hidden: false, pinned: 'end', order: 7, width: 130 },
  { key: 'branch', headerLabel: 'Branch', dataType: 'text', sortable: true, filterable: true, hidden: false, pinned: null, order: 8, width: 130 },
  { key: 'state', headerLabel: 'State', dataType: 'text', sortable: true, filterable: true, hidden: false, pinned: null, order: 9, width: 140 },
  { key: 'city', headerLabel: 'City', dataType: 'text', sortable: true, filterable: true, hidden: false, pinned: null, order: 10, width: 130 },
  { key: 'status', headerLabel: 'Status', dataType: 'text', sortable: true, filterable: true, hidden: false, pinned: null, order: 11, width: 110 },
];

export const DEALER_LEDGER_MOCK_FILTERS: DealerLedgerFilters = {
  dealerCode: undefined,
  branch: undefined,
  state: undefined,
  city: undefined,
  status: undefined,
  transactionType: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export const DEALER_LEDGER_MOCK_SORT: Sort[] = [{ columnKey: 'invoiceDate', direction: 'desc' }];

export const DEALER_LEDGER_MOCK_PAGINATION: Pagination = {
  page: 1,
  pageSize: 10,
  totalCount: DEALER_LEDGER_MOCK_ROWS.length,
};

export const DEALER_LEDGER_MOCK_SUMMARY = computeDealerLedgerSummary(DEALER_LEDGER_MOCK_ROWS);

export const DEALER_LEDGER_MOCK_FILTER_STATE: FilterState = {
  filters: DEALER_LEDGER_MOCK_FILTERS,
  isDirty: false,
  isApplied: true,
};

export const DEALER_LEDGER_MOCK_SELECTION_STATE: SelectionState = {
  selectedIds: [],
  allMatchingFilter: false,
  excludedIds: [],
};

export const DEALER_LEDGER_MOCK_TABLE_STATE: TableState = {
  columns: DEALER_LEDGER_MOCK_COLUMNS,
  sort: DEALER_LEDGER_MOCK_SORT,
  pagination: DEALER_LEDGER_MOCK_PAGINATION,
};

export const DEALER_LEDGER_MOCK_REQUEST: DealerLedgerRequest = {
  page: 1,
  pageSize: 10,
  sort: DEALER_LEDGER_MOCK_SORT,
  filters: DEALER_LEDGER_MOCK_FILTERS,
  search: '',
};

export const DEALER_LEDGER_MOCK_RESPONSE: DealerLedgerResponse = {
  rows: DEALER_LEDGER_MOCK_ROWS.slice(0, DEALER_LEDGER_MOCK_PAGINATION.pageSize),
  totalCount: DEALER_LEDGER_MOCK_ROWS.length,
  summary: DEALER_LEDGER_MOCK_SUMMARY,
};
