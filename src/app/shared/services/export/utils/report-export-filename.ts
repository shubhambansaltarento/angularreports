/**
 * Builds a report's export filename:
 * `{REPORT_KEY}_{contextName}_{dd-mm-yyyy-h:mm-a.m./p.m.}-report` —
 * generic-report-export-filename-17-09-2026-06_46_AM.md. Report-agnostic: each report
 * passes its own report-key constant and whatever "name" field is analogous to Dealer
 * Ledger's dealer name (or `null`/omit if the report has no such single identifying
 * entity). The `contextName` segment is omitted entirely (not left as an empty
 * placeholder) when unavailable.
 */
export function buildReportExportFilename(
  reportKey: string,
  contextName: string | null | undefined,
  now: Date = new Date(),
): string {
  const timestamp = `${formatDatePart(now)}-${formatTimePart(now)}`;
  const segments = [reportKey, sanitizeContextName(contextName), timestamp].filter(
    (segment): segment is string => Boolean(segment),
  );
  return `${segments.join('_')}-report`;
}

/** Strips characters unsafe in a filename on any OS, leaving letters/digits/spaces/-/_ . */
function sanitizeContextName(contextName: string | null | undefined): string | null {
  const trimmed = contextName?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/[^A-Za-z0-9 _-]/g, '_');
}

function formatDatePart(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function formatTimePart(date: Date): string {
  const period = date.getHours() >= 12 ? 'p.m.' : 'a.m.';
  const hours12 = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours12}:${minutes}-${period}`;
}
