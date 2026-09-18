import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, input, signal } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MIN_ZOOM_PERCENT = 50;
const MAX_ZOOM_PERCENT = 200;
const ZOOM_STEP_PERCENT = 10;
const DEFAULT_ZOOM_PERCENT = 100;
const ROTATE_STEP_DEGREES = 90;

/**
 * Shared, domain-agnostic "PDF viewer" chrome — zoom in/out, rotate, print, and download-as-
 * PDF — around whatever HTML content is projected into it, per
 * html-pdf-viewer-shared-component-18-09-2026-12_53_PM.md. Built for reports whose real UI is a
 * fixed-layout document (e.g. Warranty Cost Report's statement/bill) rather than a sortable/
 * paginated table — this component has no pagination, sorting, or column-picker concept of
 * its own, matching `shared/ui/data-table`'s "completely generic, knows nothing about any
 * specific report" pattern.
 */
@Component({
  selector: 'app-html-pdf-viewer',
  templateUrl: './html-pdf-viewer.component.html',
  styleUrl: './html-pdf-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlPdfViewerComponent {
  /** Shown in the toolbar. */
  readonly title = input<string | null>(null);
  /** Base filename (without extension) for Print/Download — a sensible default is used if omitted. */
  readonly filename = input('document');

  @ViewChild('content', { static: true }) private readonly contentRef!: ElementRef<HTMLElement>;

  protected readonly zoomPercent = signal(DEFAULT_ZOOM_PERCENT);
  protected readonly rotationDegrees = signal(0);

  protected zoomIn(): void {
    this.zoomPercent.update((value) => Math.min(MAX_ZOOM_PERCENT, value + ZOOM_STEP_PERCENT));
  }

  protected zoomOut(): void {
    this.zoomPercent.update((value) => Math.max(MIN_ZOOM_PERCENT, value - ZOOM_STEP_PERCENT));
  }

  protected rotate(): void {
    this.rotationDegrees.update((value) => (value + ROTATE_STEP_DEGREES) % 360);
  }

  protected print(): void {
    window.print();
  }

  protected async download(): Promise<void> {
    const element = this.contentRef.nativeElement;
    const canvas = await html2canvas(element, { scale: 2 });
    const imageData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${this.filename()}.pdf`);
  }
}
