# Design Library (Bootstrap) Specification

## Status

Proposed. This is a specification only — no implementation has been done yet. Implementation must follow this document once it is reviewed/approved, per the `specs/` working rules.

## Purpose

Today the application has no shared CSS design library — `src/styles.scss` is empty and every feature/shared component (e.g. `report-search-bar`, `data-table`, `dealer-ledger-*`) hand-rolls its own BEM-style classes and raw CSS for layout, forms, buttons, and spacing. This specification defines how [Bootstrap](https://getbootstrap.com/) is adopted as the application's base design library, and the baseline set of Bootstrap classes every feature is expected to use for common UI needs (layout, forms, buttons, tables, alerts) instead of writing bespoke CSS for them.

## Scope

This document covers:
- Which Bootstrap package is added, how it is installed, and how its CSS is loaded into the app (including SSR).
- The baseline Bootstrap classes to use for common UI concerns (grid/layout, forms, buttons, tables, alerts/feedback, spacing/utilities).
- How Bootstrap coexists with existing component-scoped SCSS (BEM classes stay for structure/behavior hooks; Bootstrap utility/component classes are added for visual styling).
- Migration approach for existing components.
- What is explicitly out of scope.

This document does not cover:
- A custom design token system or Sass theme override strategy beyond a single variables entry point (tracked as an open decision below).
- Bootstrap's JS bundle / Popper-dependent components (modals, tooltips, dropdown JS behavior) — the app is Angular-driven, and any interactive component should prefer Angular CDK/Angular Material-style patterns over Bootstrap's JS. Only Bootstrap CSS is in scope.

## Package and installation

- Add `bootstrap` (latest 5.x) as a `dependency` in `package.json`, installed via `npm install bootstrap`.
- No Bootstrap JavaScript bundle (`bootstrap.bundle.js`) or Popper.js dependency is added — CSS only, per the out-of-scope note above.
- Bootstrap Icons or a separate icon library are **not** part of this spec; icon usage remains an open decision.

## Loading Bootstrap CSS

- Import Bootstrap's compiled CSS once, globally, via `src/styles.scss`:
  ```scss
  @import 'bootstrap/scss/bootstrap';
  ```
- Using the Sass entry point (rather than the precompiled `bootstrap.min.css`) is required so a future theming pass can override Bootstrap's Sass variables (colors, spacing scale, breakpoints) before the `@import`, without restructuring how Bootstrap is loaded.
- `angular.json`'s `styles` array already points at `src/styles.scss` for both the `build` and `test` targets — no `angular.json` changes are required.
- Because rendering is SSR (`@angular/ssr` + Express, per `src/server.ts`), Bootstrap CSS must be verified to render identically on the server-rendered HTML and after client hydration (no flash-of-unstyled-content, no layout shift). CSS-only usage (no Bootstrap JS) avoids any `window`/`document` SSR hazards.

## Baseline classes to use across the app

Rather than each feature reinventing layout/spacing/form/button CSS, the following Bootstrap class groups are the required baseline for new and migrated markup:

| Concern | Bootstrap classes |
|---|---|
| Page/section layout | `.container`, `.container-fluid`, `.row`, `.col`, `.col-*` |
| Flex utilities | `.d-flex`, `.justify-content-*`, `.align-items-*`, `.gap-*` |
| Spacing | `.m-*`, `.p-*` (margin/padding scale) instead of one-off pixel values |
| Forms | `.form-label`, `.form-control`, `.form-select`, `.form-check`, `.is-invalid` / `.invalid-feedback` for validation state |
| Buttons | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline-*`, `.btn-sm` |
| Tables | `.table`, `.table-striped`, `.table-hover`, `.table-responsive` wrapper |
| Feedback/alerts | `.alert`, `.alert-danger`, `.alert-warning`, `.alert-info` |
| Text/utility | `.text-muted`, `.text-danger`, `.fw-bold`, `.small` |

Existing component-scoped BEM classes (e.g. `.report-search-bar__field`, `.data-table__pagination`) are **retained** as structural/behavioral hooks (used by component TS for querying elements, and by tests), but their SCSS should shift toward composing Bootstrap classes in the template rather than re-declaring layout/spacing/color rules already covered by the table above. A component may keep custom SCSS only for styling Bootstrap does not provide (e.g. sticky headers, resize handles, pin styling in `data-table.component.scss`).

## Migration approach

1. Introduce the Bootstrap import in `src/styles.scss` first, in isolation, and confirm no regressions in existing rendered pages (base typography/box-sizing resets from Bootstrap can affect existing hand-rolled CSS).
2. Migrate shared UI first (`src/app/shared/ui/report-search-bar`, `src/app/shared/ui/data-table`, `src/app/shared/ui/report-search-only-page`), since feature components compose these and inherit the benefit immediately.
3. Migrate feature-level markup (`dealer-ledger`, `goods-acknowledgement`, `reports-home`, etc.) incrementally, feature by feature, preserving existing BEM hook classes needed by component logic/tests.
4. Do not do a big-bang rewrite of every template in one change; each migrated component/feature should be reviewed and tested independently (existing `*.component.spec.ts` suites must keep passing, since several specs assert on DOM structure/classes).

## Acceptance criteria

- `bootstrap` is present in `package.json` dependencies and imported once via `src/styles.scss` using the Sass entry point.
- No Bootstrap JavaScript/Popper dependency is introduced.
- Server-rendered (SSR) output and client-hydrated output are visually consistent with Bootstrap loaded.
- The baseline class table above is documented as the expected classes for new markup; PRs introducing new one-off CSS for something Bootstrap already provides (spacing, buttons, form controls, basic table styling, alerts) should instead use the Bootstrap classes.
- Existing component/DOM-structure-dependent tests continue to pass after any migration of a given component's template.
- Component-scoped SCSS is reduced over time to only the styling Bootstrap does not cover, rather than removed wholesale in one pass.

## Open decisions

- Whether a custom Sass variable override file (e.g. `src/styles/_bootstrap-overrides.scss`) is introduced to theme Bootstrap to the TVS brand palette, or the default Bootstrap theme is used as-is initially — TBD, pending brand/design input.
- Whether an icon set (Bootstrap Icons vs. another library) is adopted alongside Bootstrap — TBD.
- Whether Bootstrap's grid (`.row`/`.col-*`) fully replaces any existing CSS Grid/Flexbox layout in shared components, or is used only for new page-level layout — TBD per component during migration.
- Dark mode / Bootstrap's `data-bs-theme` support is not addressed by this spec and remains open.
