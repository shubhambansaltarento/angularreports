import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HtmlPdfViewerComponent } from './html-pdf-viewer.component';

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    width: 100,
    height: 200,
    toDataURL: () => 'data:image/png;base64,abc',
  }),
}));

const saveMock = vi.fn();
const addImageMock = vi.fn();
vi.mock('jspdf', () => ({
  default: class {
    addImage = addImageMock;
    save = saveMock;
  },
}));

@Component({
  imports: [HtmlPdfViewerComponent],
  template: `<app-html-pdf-viewer title="Test Doc" filename="test-doc"><p>content</p></app-html-pdf-viewer>`,
})
class HostComponent {}

describe('HtmlPdfViewerComponent', () => {
  beforeEach(async () => {
    saveMock.mockClear();
    addImageMock.mockClear();
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the title and projected content', () => {
    const fixture = createComponent();
    expect(fixture.nativeElement.textContent).toContain('Test Doc');
    expect(fixture.nativeElement.textContent).toContain('content');
  });

  it('zooms in and out within 50-200%, starting at 100%', () => {
    const fixture = createComponent();
    const readout = () => fixture.nativeElement.querySelector('.html-pdf-viewer__zoom-readout').textContent.trim();
    expect(readout()).toBe('100%');

    const [zoomOutBtn, zoomInBtn] = fixture.nativeElement.querySelectorAll('.html-pdf-viewer__actions button');

    for (let i = 0; i < 20; i++) {
      zoomOutBtn.click();
    }
    fixture.detectChanges();
    expect(readout()).toBe('50%');

    for (let i = 0; i < 20; i++) {
      zoomInBtn.click();
    }
    fixture.detectChanges();
    expect(readout()).toBe('200%');
  });

  it('rotates in 90-degree increments, cycling back to 0 after 360', () => {
    const fixture = createComponent();
    const rotateBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.html-pdf-viewer__actions button')[2];
    const contentStyle = () => fixture.nativeElement.querySelector('.html-pdf-viewer__content').style.transform;

    rotateBtn.click();
    fixture.detectChanges();
    expect(contentStyle()).toContain('rotate(90deg)');

    rotateBtn.click();
    rotateBtn.click();
    rotateBtn.click();
    fixture.detectChanges();
    expect(contentStyle()).toContain('rotate(0deg)');
  });

  it('calls window.print() on Print', () => {
    const fixture = createComponent();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    const printBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.html-pdf-viewer__actions button')[3];
    printBtn.click();

    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('renders to a canvas via html2canvas and saves a PDF named from filename() on Download', async () => {
    const fixture = createComponent();
    const downloadBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.html-pdf-viewer__actions button')[4];
    downloadBtn.click();

    await fixture.whenStable();

    expect(addImageMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith('test-doc.pdf');
  });
});
