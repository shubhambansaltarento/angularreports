import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadInputComponent } from './typeahead-input.component';

@Component({
  imports: [ReactiveFormsModule, TypeaheadInputComponent],
  template: `<app-typeahead-input [formControl]="control" [options]="options" label="Invoice Number" />`,
})
class HostComponent {
  readonly control = new FormControl<string | null>(null);
  readonly options = ['INV-1', 'INV-2'];
}

describe('TypeaheadInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  it('renders the label and an input with a datalist populated from options', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    expect(label.textContent?.trim()).toBe('Invoice Number');

    const dataListOptions: NodeListOf<HTMLOptionElement> = fixture.nativeElement.querySelectorAll('datalist option');
    expect(Array.from(dataListOptions).map((option) => option.value)).toEqual(['INV-1', 'INV-2']);
  });

  it('propagates typed input back to the bound FormControl', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'INV-999';
    input.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.control.value).toBe('INV-999');
  });

  it('renders no datalist when no options are provided (plain text input fallback)', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.options.length = 0;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('datalist')).toBeFalsy();
  });
});
