import { buildReportExportFilename } from './report-export-filename';

describe('buildReportExportFilename', () => {
  it('builds {REPORT_KEY}_{contextName}_{dd-mm-yyyy-h:mm-a.m./p.m.}-report, report-key parameterized, not hardcoded to Dealer Ledger (generic-report-export-filename-17-09-2026-06_46_AM.md)', () => {
    const now = new Date(2026, 8, 17, 13, 5); // 2026-09-17 1:05 PM

    expect(buildReportExportFilename('WARRANTY_COST', 'Some Dealer', now)).toBe(
      'WARRANTY_COST_Some Dealer_17-09-2026-1:05-p.m.-report',
    );
    expect(buildReportExportFilename('DEALER_LEDGER', 'PAWAN SARKAR AUTOMOBILES', now)).toBe(
      'DEALER_LEDGER_PAWAN SARKAR AUTOMOBILES_17-09-2026-1:05-p.m.-report',
    );
  });

  it('uses a.m. before noon and 12-hour wraparound at midnight/noon', () => {
    const midnight = new Date(2026, 0, 1, 0, 0);
    const noon = new Date(2026, 0, 1, 12, 0);

    expect(buildReportExportFilename('DLR', 'X', midnight)).toContain('01-01-2026-12:00-a.m.');
    expect(buildReportExportFilename('DLR', 'X', noon)).toContain('01-01-2026-12:00-p.m.');
  });

  it('omits the context-name segment entirely when unavailable, rather than an empty placeholder', () => {
    const now = new Date(2026, 8, 17, 13, 5);

    expect(buildReportExportFilename('DEALER_LEDGER', null, now)).toBe('DEALER_LEDGER_17-09-2026-1:05-p.m.-report');
    expect(buildReportExportFilename('DEALER_LEDGER', '', now)).toBe('DEALER_LEDGER_17-09-2026-1:05-p.m.-report');
    expect(buildReportExportFilename('DEALER_LEDGER', '   ', now)).toBe('DEALER_LEDGER_17-09-2026-1:05-p.m.-report');
  });

  it('sanitizes filesystem-unsafe characters in the context name', () => {
    const now = new Date(2026, 8, 17, 13, 5);

    expect(buildReportExportFilename('DEALER_LEDGER', 'A/B\\C:D', now)).toBe(
      'DEALER_LEDGER_A_B_C_D_17-09-2026-1:05-p.m.-report',
    );
  });
});
