import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';
import { ExportColumn } from './models/export-column.model';

// Mocked rather than exercised for real: jsPDF's UMD build resolves to its Node
// (fs-writing) code path under Vitest's Node-based test runner instead of the browser
// Blob/anchor path it uses in the actual esbuild browser bundle. Mocking it here tests
// that ExportService drives jsPDF correctly, without depending on that environment quirk.
const { saveMock, textMock, autoTableMock } = vi.hoisted(() => ({
  saveMock: vi.fn(),
  textMock: vi.fn(),
  autoTableMock: vi.fn(),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(function MockJsPDF(this: Record<string, unknown>) {
    this['save'] = saveMock;
    this['text'] = textMock;
    this['setFontSize'] = vi.fn();
  }),
}));

vi.mock('jspdf-autotable', () => ({ default: autoTableMock }));

interface DemoRow {
  id: string;
  name: string;
  amount: number;
}

const COLUMNS: ExportColumn<DemoRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'amount', header: 'Amount' },
];

const ROWS: DemoRow[] = [
  { id: '1', name: 'Widget, Small', amount: 10 },
  { id: '2', name: 'Gadget', amount: 20 },
];

describe('ExportService', () => {
  let service: ExportService;
  let createdBlobs: Blob[];
  let objectUrls: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);

    createdBlobs = [];
    objectUrls = [];
    saveMock.mockClear();
    textMock.mockClear();
    autoTableMock.mockClear();

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn((blob: Blob) => {
        createdBlobs.push(blob);
        const url = `blob:mock-${createdBlobs.length}`;
        objectUrls.push(url);
        return url;
      }),
      revokeObjectURL: vi.fn(),
    });

    // Prevent the anchor's real `click()` (which would attempt a navigation in jsdom) from
    // running — we only care that a download was triggered with the right Blob/filename.
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('exports CSV with an escaped header row and comma-escaped values', async () => {
    service.exportToCsv(ROWS, COLUMNS, 'demo');

    expect(createdBlobs).toHaveLength(1);
    expect(createdBlobs[0].type).toContain('text/csv');

    const text = await createdBlobs[0].text();
    const lines = text.split('\r\n');
    expect(lines[0]).toBe('Name,Amount');
    expect(lines[1]).toBe('"Widget, Small",10');
    expect(lines[2]).toBe('Gadget,20');
  });

  it('exports Excel as an HTML table with the .xls MIME type', async () => {
    service.exportToExcel(ROWS, COLUMNS, 'demo');

    expect(createdBlobs).toHaveLength(1);
    expect(createdBlobs[0].type).toBe('application/vnd.ms-excel');

    const text = await createdBlobs[0].text();
    expect(text).toContain('<table>');
    expect(text).toContain('<th>Name</th>');
    expect(text).toContain('<td>Gadget</td>');
  });

  it('generates a PDF via jsPDF/autotable and saves it under the given filename (regression: used to throw "not yet implemented")', () => {
    expect(() => service.exportToPdf(ROWS, COLUMNS, 'demo')).not.toThrow();

    expect(autoTableMock).toHaveBeenCalledTimes(1);
    const [, options] = autoTableMock.mock.calls[0];
    expect(options.head).toEqual([['Name', 'Amount']]);
    expect(options.body).toEqual([
      ['Widget, Small', '10'],
      ['Gadget', '20'],
    ]);

    expect(saveMock).toHaveBeenCalledWith('demo.pdf');
    expect(textMock).not.toHaveBeenCalled();
  });

  it('prints an optional title above the PDF table', () => {
    service.exportToPdf(ROWS, COLUMNS, 'demo', 'Demo Report');

    expect(textMock).toHaveBeenCalledWith('Demo Report', expect.any(Number), expect.any(Number));
    expect(saveMock).toHaveBeenCalledWith('demo.pdf');
  });

  it('opens a print window with a rendered table', () => {
    const write = vi.fn();
    const printWindow = {
      document: { write, close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(printWindow as unknown as Window);

    service.print(ROWS, COLUMNS, 'Demo Report');

    expect(write).toHaveBeenCalledTimes(1);
    expect(write.mock.calls[0][0]).toContain('Demo Report');
    expect(printWindow.print).toHaveBeenCalledTimes(1);
  });
});
