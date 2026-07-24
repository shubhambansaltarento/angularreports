import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Marks an `<ng-template>` as the custom cell renderer for a given column key, enabling
 * "Dynamic Templates" — a consuming report projects rich cell content (badges, actions,
 * nested components) without the Data Table itself knowing anything about that content.
 *
 * Usage:
 * ```html
 * <ng-template dataTableCell="status" let-row>
 *   <span class="badge">{{ row.status }}</span>
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[dataTableCell]',
})
export class DataTableCellTemplateDirective {
  readonly columnKey = input.required<string>({ alias: 'dataTableCell' });
  readonly templateRef = inject(TemplateRef<{ $implicit: unknown; column: unknown }>);
}
