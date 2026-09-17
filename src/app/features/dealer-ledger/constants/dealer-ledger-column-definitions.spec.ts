import { toDealerLedgerColumns } from './dealer-ledger-column-definitions';

describe('toDealerLedgerColumns', () => {
  it('maps columnName/isDefault entries onto TableColumns, in order, with hidden = !isDefault (effective-columns-shape-change-17-09-2026-05_41_AM.md)', () => {
    const columns = toDealerLedgerColumns([
      { columnName: 'dealerCode', isDefault: true },
      { columnName: 'textDec', isDefault: false },
      { columnName: 'vehicleNarration', isDefault: false },
      { columnName: 'debit', isDefault: true },
    ]);

    expect(columns.map((column) => column.key)).toEqual(['dealerCode', 'textDec', 'narrationVehDescription', 'debitAmount']);
    expect(columns.map((column) => column.hidden)).toEqual([false, true, true, false]);
  });

  it('skips a columnName not present in the column definitions, warning rather than throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const columns = toDealerLedgerColumns([
      { columnName: 'dealerCode', isDefault: true },
      { columnName: 'someNewField', isDefault: true },
    ]);

    expect(columns.map((column) => column.key)).toEqual(['dealerCode']);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('someNewField'));
  });
});
