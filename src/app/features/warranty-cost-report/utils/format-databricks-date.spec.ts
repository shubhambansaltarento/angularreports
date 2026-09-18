import { formatDatabricksDate } from './format-databricks-date';

describe('formatDatabricksDate', () => {
  it('formats a YYYYMMDD string as DD.MM.YYYY', () => {
    expect(formatDatabricksDate('20250121')).toBe('21.01.2025');
  });

  it('returns an empty string for undefined', () => {
    expect(formatDatabricksDate(undefined)).toBe('');
  });

  it('leaves an unrecognized format unchanged', () => {
    expect(formatDatabricksDate('2025-01-21')).toBe('2025-01-21');
  });
});
