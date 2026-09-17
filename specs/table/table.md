# Table Specification

## Status

Initial specification grounded in the existing reusable `DataTableComponent` and dealer-ledger table usage.

## Scope

This specification describes the current custom-table architecture and the expectations for future extension without replacing the table with a third-party library.

## Requirements

1. The application must use a custom table component rather than a third-party table library.
2. Tables must be reusable across reports.
3. Table behavior must support sorting, filtering, pagination, selection, loading, empty, responsive layout, and export support.
4. Column configuration must be data-driven and preservable across sessions.
5. Accessibility must be considered for keyboard and assistive technology users.

## Current implementation observations

- `src/app/shared/ui/data-table/data-table.component.ts` defines a generic reusable table.
- The component supports search, sorting, pagination, selection, column visibility, pinning, export, and local persistence of column settings.
- `dealer-ledger-table.component.ts` configures a concrete report-specific column set.
- The table is designed as a shared component, not a domain-specific table.

## Acceptance criteria

- Reusable table behavior remains generic across multiple reports.
- Report-specific table definitions remain small and composed around the shared table component.
- Table interactions are accessible and do not require a third-party library to satisfy app requirements.
- Additional table functionality can be added incrementally without rewriting the component.

## Open decisions

- Formal server-side pagination and remote filtering model: TBD
- Row virtualization for very large datasets: TBD
- Advanced keyboard support beyond the current table interactions: Open Decision
