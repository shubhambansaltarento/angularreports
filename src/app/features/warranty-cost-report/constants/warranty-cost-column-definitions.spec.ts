import { toWarrantyCostColumns } from './warranty-cost-column-definitions';

describe('toWarrantyCostColumns', () => {
  it('maps columnName/isDefault entries onto TableColumns, in order, with hidden = !isDefault (column-schema-changed-to-order-date-quantity-17-09-2026-08_14_AM.md)', () => {
    const columns = toWarrantyCostColumns([
      { columnName: 'dealerCode', isDefault: true, isVisible: true },
      { columnName: 'orderDate', isDefault: false, isVisible: true },
      { columnName: 'quantity', isDefault: true, isVisible: true },
    ]);

    expect(columns.map((column) => column.key)).toEqual(['dealerCode', 'orderDate', 'quantity']);
    expect(columns.map((column) => column.hidden)).toEqual([false, true, false]);
  });

  it('right-aligns Quantity, per the real config', () => {
    const columns = toWarrantyCostColumns([{ columnName: 'quantity', isDefault: true, isVisible: true }]);
    expect(columns[0].align).toBe('end');
  });

  it('skips a column entirely when isVisible is false, regardless of isDefault', () => {
    const columns = toWarrantyCostColumns([
      { columnName: 'dealerCode', isDefault: true, isVisible: true },
      { columnName: 'quantity', isDefault: true, isVisible: false },
    ]);

    expect(columns.map((column) => column.key)).toEqual(['dealerCode']);
  });

  it('skips a columnName not present in the column definitions, warning rather than throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const columns = toWarrantyCostColumns([
      { columnName: 'dealerCode', isDefault: true, isVisible: true },
      { columnName: 'someNewField', isDefault: true, isVisible: true },
    ]);

    expect(columns.map((column) => column.key)).toEqual(['dealerCode']);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('someNewField'));
  });
});
