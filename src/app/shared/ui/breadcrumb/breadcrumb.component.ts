import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Shared, presentational breadcrumb for every report page — always a fixed two-level
 * trail ("Reports" → the current report's title), per
 * breadcrumbs-and-dealer-ledger-style-headers-17-09-2026-07_17_AM.md. Not a generic
 * arbitrary-depth breadcrumb: every consumer today needs exactly this shape, so a single
 * `currentLabel` input (rather than an `items` array) keeps every call site simple.
 *
 * No data-fetching, no store/service dependency — purely renders the trail it's given.
 * SSR-safe: `routerLink` requires no browser-only APIs.
 */
@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  /** The current report's title — the trailing, non-linked crumb. */
  readonly currentLabel = input.required<string>();
}
