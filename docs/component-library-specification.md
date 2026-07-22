# Reusable Enterprise UI Component Library — Specification

**Project:** Enterprise Reporting Platform (dmsReports)
**Document type:** Feature Specification (Spec-Driven Development — Stage 2)
**Status:** Draft — pending approval
**Depends on:** [Software Architecture Specification](architecture/software-architecture-specification.md) (§9 Shared Module), [Folder Structure Specification](architecture/folder-structure-specification.md) (§7 Styles, §12 Pipes, §13 Directives), [Engineering Standards](engineering-standards.md) (§2 Component Conventions, §6 SCSS Conventions)
**Date:** 2026-07-22

---

## 1. Purpose

Specify the public API, accessibility contract, and theming/performance behavior of every component in the platform's Shared UI library (`libs/shared/ui`), so that Presentation across every Feature — and both Standalone and Embedded shells — draws from one consistent, white-label-ready component set. No Angular code appears below; every API surface is described by name, type, and behavior only.

### 1.1 Assumptions

- Every component described here lives in `libs/shared/ui` and is therefore bound by the Shared layer's purity rule (Architecture Spec §9): **zero Business/Data/Infrastructure dependency, no business logic** — a component reflects the state and configuration it's given and emits notification of user interaction; it never decides *whether* an action is authorized, *what* data to fetch, or *how* to log anything.
- "No Angular code" is interpreted as: no TypeScript, no decorators, no template syntax. Input/Output/Signal names, types, and shapes are still specified, since that *is* the specification's deliverable — just expressed as prose/tables, not source.
- Signal-based `input()`/`output()` conventions (Engineering Standards §2) apply to every component; where this document says "Inputs" or "Outputs," it means that API surface.

### 1.2 Shared Conventions (apply to all 19 components — not repeated per component)

| Concern | Convention |
|---|---|
| Composition | Standalone Component, `ChangeDetectionStrategy.OnPush`, `dms-` selector prefix (Engineering Standards §1/§2). |
| Styling | Design-token-only (CSS custom properties) — no hardcoded color/spacing/typography values, so a tenant's white-label theme changes every component's appearance with zero component changes (Vision G5). |
| Accessibility baseline | WCAG 2.1 AA minimum (Vision NFR) for every component: keyboard operability, visible focus indication, state never conveyed by color alone, correct ARIA role/name/state. |
| Internationalization | No user-facing string is hardcoded inside a component; text is always passed in (input or projected content). Layout uses logical CSS properties (`margin-inline-start`, not `margin-left`) so RTL locales work without component changes. |
| Customization mechanism | Content projection and template-reference inputs are the primary extension point — never component subclassing or `::ng-deep`-style style overrides. |
| Motion | Any animation respects `prefers-reduced-motion: reduce` by disabling or substantially reducing motion automatically. |

### 1.3 Form Control Contract (applies to Input, Select, Autocomplete, Checkbox, Radio, Toggle)

These six components implement one shared, platform-wide **Form Control Contract** — the conceptual equivalent of Angular's control-value-accessor + validator integration — so they compose uniformly inside Reactive Forms and present validation state identically. Rather than repeat this contract six times, each of those components' "Validation" subsection below states only what's specific to it; the contract itself guarantees:

- A bindable `value`, participating in a parent form's value/state tracking.
- A `disabled` state driven by the form control's own disabled state, not just a local input.
- A standard invalid/valid visual and ARIA (`aria-invalid`, `aria-describedby`) presentation, driven by the control's validation status rather than each component inventing its own error styling.
- A single, consistent error-message slot rendering the first active validation error for that control.

---

## 2. Buttons

| | |
|---|---|
| **Inputs** | `variant` (primary\|secondary\|tertiary\|ghost\|destructive), `size` (sm\|md\|lg), `disabled`, `loading`, `type` (button\|submit\|reset), `fullWidth`, `ariaLabel` (required when icon-only) |
| **Outputs** | `pressed` — emitted on activation via pointer or keyboard |
| **Signals** | Internal transient `isPressed` (active-state styling only; not part of the public API) |
| **Accessibility** | Native button semantics preserved; `aria-disabled` kept in sync with `disabled` (never silently removed from tab order); `aria-busy` while `loading`; icon-only usage requires `ariaLabel` — enforced, not optional, since an icon alone has no accessible name |
| **Validation** | N/A directly; `type="submit"` participates in the surrounding form's own validation/submission flow |
| **Events** | Pointer down/up (press styling), keyboard `Enter`/`Space` activation, focus/blur (focus-ring) |
| **Customization** | Leading/trailing icon projection slots; label via content projection (supports rich content, e.g., an inline badge) rather than a plain string input only |
| **Theming** | `--color-action-*`, `--radius-control`, `--spacing-control-*`, one token set per variant |
| **Variants** | 5 visual variants × 3 sizes × icon-only mode |
| **Performance** | No internal timers/subscriptions; `loading` state composes the shared Loader component rather than duplicating spinner logic |

---

## 3. Inputs (Text Input)

| | |
|---|---|
| **Inputs** | `value` (Form Control Contract), `label`, `placeholder`, `type` (text\|email\|password\|number\|tel\|url), `disabled`, `readonly`, `required`, `maxLength`, `size`, native `autocomplete` passthrough |
| **Outputs** | `valueChange` (escape hatch for uncontrolled usage alongside the Form Control Contract), `focus`, `blur` |
| **Signals** | `hasValue` (computed — drives floating-label/clear-button visibility), `isFocused` |
| **Accessibility** | Programmatic label association (`for`/`id` or `aria-labelledby`); `aria-invalid` + `aria-describedby` linking the error-message slot when invalid; `aria-required` |
| **Validation** | Form Control Contract; built-in `required`/`pattern`/`maxLength` validators composable with custom ones; error slot shows the first active error, associated via `aria-describedby` |
| **Events** | `input`, `change`, `focus`, `blur`, `keydown` (clear-button keyboard support) |
| **Customization** | Prefix/suffix content projection (icon or affix text), custom error-message template override |
| **Theming** | `--color-border-*`, `--color-border-error`, `--color-text-*`, `--radius-control` |
| **Variants** | Outlined/filled style, sm/md/lg density, with/without floating label |
| **Performance** | No default debouncing (would surprise controlled-input consumers); debouncing is opt-in and layered on by consuming components (e.g., Autocomplete) |

---

## 4. Select

| | |
|---|---|
| **Inputs** | `options` (flat or grouped), `value` (Form Control Contract), `multiple`, `placeholder`, `disabled`, `searchable`, `compareWith` (equality fn for object options), `virtualScroll` |
| **Outputs** | `openedChange`, `valueChange` (alongside the Contract) |
| **Signals** | `isOpen`, `highlightedIndex` (keyboard cursor), `filteredOptions` (computed, when `searchable`) |
| **Accessibility** | ARIA combobox/listbox pattern: `aria-expanded`, `aria-activedescendant` tracking `highlightedIndex`; full keyboard support (Up/Down/Home/End/Escape/Enter/type-ahead) |
| **Validation** | Form Control Contract; `required`, minimum-selections (multiple mode) |
| **Events** | opened, closed, option-highlighted, selection-committed |
| **Customization** | Custom option-item template, custom "no results" template, custom trigger-button template |
| **Theming** | Shares Input's tokens plus `--color-surface-overlay`, `--elevation-popover` for the panel |
| **Variants** | Single/multiple, inline vs. overlay panel, with/without search |
| **Performance** | Virtual scrolling above a configurable option-count threshold; overlay panel only rendered while open |

---

## 5. Autocomplete

| | |
|---|---|
| **Inputs** | `value`, `displayWith` (fn rendering an object option as text), `debounceMs`, `minChars`, `loading` (external async indicator), `options`/async-source contract |
| **Outputs** | `valueChange`, `searchTermChange` (debounced), `optionSelected` |
| **Signals** | `filteredOptions` (computed), `isLoading`, `highlightedIndex` |
| **Accessibility** | Same combobox/listbox pattern as Select, plus an `aria-live` region announcing result-count changes after each debounced search |
| **Validation** | Form Control Contract; optional "must select from list" mode rejecting free-text values not present in `options` |
| **Events** | search-term emitted (debounced), option-highlighted, option-selected, no-results |
| **Customization** | Option-item template, loading-state template, no-results-state template |
| **Theming** | Shared with Select |
| **Variants** | Sync (client-filtered) vs. async (server-searched); single-select vs. multi-select "chip" input mode |
| **Performance** | Input debounced (default ~250–300ms, configurable); in-flight searches cancelled/superseded on new keystroke to avoid out-of-order flicker; virtual scrolling for large result sets |

---

## 6. Checkbox

| | |
|---|---|
| **Inputs** | `checked` (Form Control Contract, tri-state incl. indeterminate), `disabled`, `label`, `required` |
| **Outputs** | `checkedChange` |
| **Signals** | None beyond bound state |
| **Accessibility** | Native checkbox semantics or `role="checkbox"` with `aria-checked` supporting `"mixed"`; label always programmatically associated |
| **Validation** | Form Control Contract; `requiredTrue` validator (e.g., terms acceptance) |
| **Events** | change, focus, blur |
| **Customization** | Label content projection (rich label, e.g., embedded link) |
| **Theming** | `--color-action-*` (checked fill), `--color-border-*` (unchecked), `--radius-control-sm` |
| **Variants** | Standalone vs. card-style selectable region; indeterminate support |
| **Performance** | Trivial render cost; large checkbox lists rely on `OnPush` + tracked list rendering per item |

---

## 7. Radio

| | |
|---|---|
| **Inputs** | `options`, `value` (Form Control Contract), `name`, `disabled`, `orientation` (horizontal\|vertical) |
| **Outputs** | `valueChange` |
| **Signals** | `selectedIndex` (derived from value/options) |
| **Accessibility** | ARIA `radiogroup`/`radio`, roving-tabindex keyboard navigation (Arrow keys move selection within the group; one Tab stop for the whole group) |
| **Validation** | Form Control Contract; required-selection validator |
| **Events** | change, focus, blur (group- and option-level) |
| **Customization** | Per-option content projection (icon + description per choice, not label-string only) |
| **Theming** | Shared with Checkbox |
| **Variants** | Standard list, horizontal "segmented" button-group style |
| **Performance** | Roving tabindex keeps keyboard navigation fast even for long option lists |

---

## 8. Toggle (Switch)

| | |
|---|---|
| **Inputs** | `checked` (Form Control Contract), `disabled`, `label`, `labelPosition` |
| **Outputs** | `checkedChange` |
| **Signals** | None beyond bound state |
| **Accessibility** | `role="switch"` with `aria-checked` — deliberately distinct from checkbox semantics, since a switch communicates an immediate on/off effect rather than a form-submission value |
| **Validation** | Form Control Contract (rarely "required" in practice, supported for consistency) |
| **Events** | change, focus, blur |
| **Customization** | Label content projection |
| **Theming** | `--color-action-*` (on-state), `--color-surface-muted` (off-state) |
| **Variants** | With/without inline label, sm/md size |
| **Performance** | CSS-driven thumb transition; no JS position calculation |

---

## 9. Tabs

| | |
|---|---|
| **Inputs** | `tabs` (id/label/disabled definitions), `selectedIndex`/`selectedId` (bindable), `orientation`, `activationMode` (automatic\|manual) |
| **Outputs** | `selectedIndexChange`/`selectedIdChange` |
| **Signals** | `selectedIndex`, `focusedIndex` (keyboard cursor, distinct from committed selection in manual mode) |
| **Accessibility** | ARIA `tablist`/`tab`/`tabpanel`, roving tabindex, Arrow-key navigation, `aria-selected`/`aria-controls`/`aria-labelledby` wiring |
| **Validation** | N/A |
| **Events** | selection-changed, tab-focused (pre-selection, manual mode) |
| **Customization** | Per-tab label projection (icon/text/badge), per-panel content projection; lazy vs. eager panel rendering |
| **Theming** | `--color-border-selected`, `--color-text-selected`, `--color-text-muted` |
| **Variants** | Underline, pill/segmented, icon-only compact, scrollable overflow |
| **Performance** | Inactive panels not rendered by default (lazy activation); eager mode available when preserving hidden-panel state matters more than render cost |

---

## 10. Accordion

| | |
|---|---|
| **Inputs** | `panels` (definitions), `multiple` (allow >1 expanded), `expandedIds` (bindable) |
| **Outputs** | `expandedIdsChange`, `panelToggled` |
| **Signals** | `expandedIds` set, per-panel `isExpanded` (computed) |
| **Accessibility** | Header is a button with `aria-expanded`/`aria-controls`; panel is `role="region"` + `aria-labelledby`; Up/Down/Home/End across headers |
| **Validation** | N/A |
| **Events** | panel-expanded, panel-collapsed |
| **Customization** | Header content projection (icon/badge + title), panel-body content projection |
| **Theming** | Shared with Tabs plus `--motion-duration-expand` |
| **Variants** | Single-expand vs. multi-expand; bordered vs. flush |
| **Performance** | Collapsed panel content removed from the render tree by default (not just visually hidden); configurable to stay mounted when internal state must persist |

---

## 11. Cards

| | |
|---|---|
| **Inputs** | `variant` (elevated\|outlined\|flat), `padding` density, `clickable` |
| **Outputs** | `activated` (only when `clickable`) |
| **Signals** | None — stateless container |
| **Accessibility** | `clickable` cards expose a role matching their actual behavior (`link`/`button`) with a visible focus ring and keyboard activation; static cards carry no interactive ARIA role at all, avoiding a false-affordance/keyboard-trap anti-pattern |
| **Validation** | N/A |
| **Events** | click/activation, focus/blur (when clickable) |
| **Customization** | Defined header/media/body/footer/actions content-projection slots (not one generic region) |
| **Theming** | `--color-surface`, `--elevation-card`, `--radius-card`, `--spacing-card-*` |
| **Variants** | Elevated/outlined/flat, clickable/static, media-leading vs. text-only layout |
| **Performance** | Media slot images use native lazy-loading by default |

---

## 12. Dialogs (Modal)

| | |
|---|---|
| **Inputs** | `open` (bindable), `size` (sm\|md\|lg\|fullscreen), `dismissible`, `closeOnBackdropClick`, `role` (dialog\|alertdialog) |
| **Outputs** | `openedChange`, `closed` (payload: `backdrop`\|`escape`\|`action`\|`programmatic`), `closing` (cancelable) |
| **Signals** | `isOpen`, internal `activeElementBeforeOpen` (for focus restoration) |
| **Accessibility** | `aria-modal="true"`; focus trapped inside while open; focus moved into the dialog on open and **restored to the triggering element on close**; `Escape` closes when `dismissible`; background content marked `inert`/`aria-hidden` while open |
| **Validation** | N/A at the shell level — content projected inside (e.g., a form) carries its own validation |
| **Events** | opened, closing (cancelable — lets in-dialog content block close on unsaved changes), closed |
| **Customization** | Header/body/footer content-projection slots; footer typically composes the Button component for actions rather than Dialog defining its own action-button API |
| **Theming** | `--elevation-modal`, `--color-scrim`, `--radius-modal`, size-to-max-width mapping |
| **Variants** | Standard, confirmation (`alertdialog`), fullscreen (mobile pattern); with/without backdrop dismissal |
| **Performance** | Rendered via an overlay/portal only while open; body-scroll locked while open with scrollbar-width compensation to avoid layout shift |

---

## 13. Snackbars (Toast)

| | |
|---|---|
| **Inputs** | `message`, `actionLabel`, `durationMs` (`0`/`null` = persistent), `variant` (info\|success\|warning\|error) |
| **Outputs** | `actionTriggered`, `dismissed` (reason: `timeout`\|`action`\|`manual`) |
| **Signals** | `isVisible`, optional `remainingMs` (visual countdown) |
| **Accessibility** | `role="status"` (`aria-live="polite"`) for standard variants, `role="alert"` for `error` (interrupts screen readers immediately); auto-dismiss timer pauses on hover/focus so it can't disappear mid-read |
| **Validation** | N/A |
| **Events** | shown, action-clicked, dismissed |
| **Customization** | Action-button slot (or `actionLabel`/`actionTriggered` for the common single-action case), per-variant icon slot |
| **Theming** | `--color-surface-inverse`/variant surface, `--color-text-inverse`, `--elevation-snackbar` |
| **Variants** | info/success/warning/error; with/without action; queued-stacking behavior managed by a platform-wide queue orchestrator (data-only), not by the visual component itself |
| **Performance** | Only currently-visible snackbar(s) are mounted; a queued backlog is plain data, not hidden-but-mounted components |

---

## 14. Notifications (in-app notification center)

*(Distinct from the transient Snackbar — this is a persistent, reviewable list.)*

| | |
|---|---|
| **Inputs** | `notifications` (id/title/message/timestamp/read/severity), `unreadCount` |
| **Outputs** | `notificationOpened`, `markedAsRead`, `markedAllAsRead`, `dismissed` |
| **Signals** | `unreadCount` (computed), `groupedByDate` (computed, e.g., "Today / Earlier" grouping) |
| **Accessibility** | List uses `role="list"`/`listitem`; unread state conveyed visually **and** via an accessible "(unread)" text cue, never color alone; bell trigger announces count (e.g., `aria-label="Notifications, 3 unread"`) |
| **Validation** | N/A |
| **Events** | panel opened, item-clicked, mark-read, mark-all-read, dismiss-item |
| **Customization** | Per-item template projection, supporting richer per-severity/category content than one fixed title+message shape |
| **Theming** | `--color-severity-info/success/warning/error`, shared with Snackbar's variant palette |
| **Variants** | Dropdown-panel presentation vs. dedicated full-page list, same underlying list renderer |
| **Performance** | Virtual scrolling above a configurable item-count threshold; unread count computed via memoized `computed()` |

---

## 15. Loader (Spinner / Progress)

| | |
|---|---|
| **Inputs** | `variant` (spinner\|linear\|circular-progress), `size`, `determinate`, `value` (0–100, when determinate), `label` (mandatory accessible description) |
| **Outputs** | None — purely presentational |
| **Signals** | None |
| **Accessibility** | `role="status"`, `aria-live="polite"`; `aria-valuenow`/`min`/`max` when determinate; `label` is mandatory whenever no adjacent visible text explains what's loading |
| **Validation** | N/A |
| **Events** | None |
| **Customization** | Label content (string or projected richer content) |
| **Theming** | `--color-action-*`, size-to-diameter mapping |
| **Variants** | Indeterminate spinner, determinate circular, linear/bar; inline vs. block placement |
| **Performance** | CSS-driven animation (no JS animation-frame loop); determinate updates are simple bound re-renders, no embedded interpolation logic |

---

## 16. Skeleton (Loading Placeholder)

| | |
|---|---|
| **Inputs** | `variant` (text\|circle\|rect), `width`, `height`, `count`, `animated` |
| **Outputs** | None |
| **Signals** | None |
| **Accessibility** | `aria-hidden="true"` on each skeleton piece; a single `aria-live` "Loading…" announcement is owned by the *container* composing the skeleton pieces, not duplicated per piece |
| **Validation** | N/A |
| **Events** | None |
| **Customization** | Composable into custom placeholder layouts (e.g., a card-skeleton assembled from rect + text + circle instances) rather than one fixed baked-in shape |
| **Theming** | `--color-surface-muted` (base), `--color-surface-shimmer` (animated highlight) |
| **Variants** | text/circle/rect primitives; animated vs. static |
| **Performance** | Shimmer is CSS-only; automatically disabled under `prefers-reduced-motion: reduce` |

---

## 17. Pagination

| | |
|---|---|
| **Inputs** | `totalItems`, `pageSize`, `currentPage` (bindable), `pageSizeOptions`, `siblingCount` |
| **Outputs** | `currentPageChange`, `pageSizeChange` |
| **Signals** | `totalPages` (computed), `visiblePageNumbers` (computed, ellipsis-collapsed sequence) |
| **Accessibility** | `nav` landmark (`aria-label="Pagination"`); current page marked `aria-current="page"`; Previous/Next disabled via `aria-disabled` (not hidden) at bounds |
| **Validation** | `currentPage` is clamped to `[1, totalPages]`; a correction is observable via `currentPageChange` so consumers stay in sync rather than silently diverging |
| **Events** | page-changed, page-size-changed |
| **Customization** | Custom page-size-selector template (composes Select), custom "showing X–Y of Z" summary template |
| **Theming** | Shares control tokens with Button |
| **Variants** | Full (first/prev/numbers/next/last) vs. simple (prev/next + "Page X of Y") |
| **Performance** | `visiblePageNumbers` memoized so large `totalPages` values don't recompute an expensive sequence on unrelated re-renders |

---

## 18. Breadcrumb

| | |
|---|---|
| **Inputs** | `items` (label/link), `maxVisible` (collapse threshold) |
| **Outputs** | `itemActivated` (non-link, action-based items) |
| **Signals** | `visibleItems`/`collapsedItems` (computed when collapsing) |
| **Accessibility** | `nav` landmark (`aria-label="Breadcrumb"`), ordered-list semantics, current/last item marked `aria-current="page"` and never rendered as a link |
| **Validation** | N/A |
| **Events** | item-clicked, overflow-menu-opened |
| **Customization** | Per-item icon/content projection, custom separator glyph |
| **Theming** | `--color-text-muted` (inactive), `--color-text-current` |
| **Variants** | Full trail, collapsed-with-overflow-menu for deep hierarchies |
| **Performance** | Trivial; collapsed-item computation memoized for very deep trails |

---

## 19. Charts

*(A family of chart types sharing one contract — bar/line/pie/area/donut, extensible.)*

| | |
|---|---|
| **Inputs** | `type` (bar\|line\|pie\|area\|donut…), `data`, `series` (label/color/value-accessor per series), `xAxis`/`yAxis` config, `legend` (position/visibility), `responsive`, `colorScheme` (design-token-driven categorical palette reference), `loading`, `emptyStateMessage` |
| **Outputs** | `dataPointSelected`, `legendItemToggled`, `rendered` (fires once initial render/layout completes) |
| **Signals** | `hasData` (computed — drives empty state), `visibleSeries` (computed, reflects legend toggles without mutating the original `data` input) |
| **Accessibility** | Every chart renders an accessible data-table fallback (or `aria-describedby`-linked summary) alongside the visual, since canvas/SVG output isn't natively screen-reader-consumable; interactive points are keyboard-focusable with a value-describing `aria-label`, not mouse-hover-only |
| **Validation** | Data-shape mismatches (e.g., unequal series lengths) surface as a defined error/empty state rather than an uncaught rendering exception |
| **Events** | point hover/selection, legend toggle, zoom/pan (supporting chart types), export-requested |
| **Customization** | Custom tooltip template, custom legend template, custom axis-label formatter functions |
| **Theming** | Colors sourced entirely from the platform's categorical/sequential design-token palette — never hardcoded per chart instance, so a white-labeled tenant's chart colors follow their brand automatically |
| **Variants** | bar/line/pie/donut/area and combinations (e.g., combo bar+line); horizontal/vertical (bar); stacked/grouped (bar/area) |
| **Performance** | Canvas-based rendering recommended once series/point counts grow large (vs. heavy per-point DOM/SVG nodes); data-point-level change detection avoids full-chart re-render on partial updates; resize handled via a throttled/debounced `ResizeObserver`, not a window-resize listener |

---

## 20. Tables

*(Central to a reporting platform — given proportionately more depth given its complexity: sorting, filtering, selection, virtualization.)*

| | |
|---|---|
| **Inputs** | `columns` (key/header/sortable/width/cell-template-ref), `data` (or a data-source contract supporting server-side paging/sorting), `sortState` (bindable), `selectable` (none\|single\|multiple), `selectedRows` (bindable), `loading`, `emptyStateMessage`, `stickyHeader`, `virtualScroll`, `density` (compact\|comfortable\|spacious) |
| **Outputs** | `sortChanged`, `selectionChanged`, `rowActivated` (row click/double-click for drill-down), `columnResized`, `scrolledToEnd` (infinite-scroll alternative to Pagination) |
| **Signals** | `sortedData` (computed — client-side mode only; server-side mode reflects the bound `data` input as-is), `selectedRowIds` (set), `visibleColumns` (computed, if column visibility toggling is supported) |
| **Accessibility** | Native table semantics preserved even when virtualized — an ARIA-grid pattern with explicit `aria-rowindex`/`aria-colindex` keeps virtualized rows correctly announced; sortable headers are buttons with `aria-sort`; selection checkboxes are labeled per-row (e.g., "Select row: <primary column value>"), never generically "Select" |
| **Validation** | Column configuration is validated at bind time (e.g., a `sortable` column needs a comparator or a sensible type-based default) — configuration-shape validation, not form-field validation |
| **Events** | sort-changed, row-selected, selection-changed, row-activated, column-resized, scrolled-to-end |
| **Customization** | Per-column cell-template projection (badges, actions, nested components — not plain text only), custom header template, custom row-expansion template (master-detail), custom empty/loading states (composing Skeleton for loading rows) |
| **Theming** | `--color-border-table`, `--color-surface-row-hover`, `--color-surface-row-selected`, `--spacing-cell-*` (density tokens) |
| **Variants** | Client-side vs. server-side sort/filter/page (the Table reflects `sortState`/`data` and emits `sortChanged`; where sorting "really happens" is the consuming Feature's concern, not the Table's); flat vs. expandable-row (master-detail); density |
| **Performance** | **Virtual scrolling is the default above a configurable row-count threshold** — the DOM holds only the visible row window plus a small buffer; cell templates are `OnPush`-friendly (pure pipes/`computed()`) so one cell's re-render doesn't cascade to its whole row; server-side mode is the recommended default for genuinely large report datasets so the full dataset is never held in memory at once |

---

## 21. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | A Feature reaches past the Table/Chart's public API to manipulate internal DOM directly (e.g., for a one-off styling need), coupling Features to implementation details and breaking on the next library update. | Code review checklist item: any DOM query/manipulation targeting a Shared component's internals from outside the library is a review-blocking finding — the fix is always a new input/slot on the component, not a workaround. |
| R2 | Chart/Table performance guidance (virtualization, canvas rendering) is treated as optional and skipped under deadline pressure, causing real report datasets to degrade the UI. | Performance thresholds (row/point count) are defined as configurable values with sensible defaults, and the Definition of Done (Engineering Standards §17) already requires performance-sensitive components to be checked against realistic data volumes, not just fixtures. |
| R3 | The Form Control Contract (§1.3) is implemented inconsistently across the six form components, causing subtly different validation-error presentation. | The contract is defined once, here, precisely so all six can be tested against one shared conformance checklist rather than reinventing validation UX per component. |
| R4 | Chart color palette or theming tokens drift from the platform's dataviz color system over time, breaking white-label consistency. | Chart's `colorScheme` input is documented as sourcing only from the shared categorical/sequential token palette — a hardcoded per-chart color is a review-blocking finding, same as any other component. |

---

## 22. Dependencies

- Upstream: Software Architecture Specification (§9 Shared Module), Folder Structure Specification (§7 Styles/theming tokens), Engineering Standards (§2 Component Conventions, §6 SCSS Conventions).
- Downstream: every Feature (`dashboard`, `reports`, `administration`, `auth-login`) composes these components; the Theming & White-Label spec (not yet written) will define the concrete token values these components consume by reference.

---

## 23. Acceptance Criteria

- [ ] All 19 requested components (Buttons through Tables) are specified with all 10 requested attributes each (Inputs, Outputs, Signals, Accessibility, Validation, Events, Customization, Theming, Variants, Performance).
- [ ] Shared conventions and the Form Control Contract are stated once and referenced, not duplicated per component.
- [ ] Every component's accessibility entry names concrete ARIA roles/states/keyboard behavior, not a generic "accessible" claim.
- [ ] Every component's theming entry names the design-token categories it consumes, tying back to the white-label goal (Vision G5).
- [ ] No Angular code (TypeScript, decorators, templates) appears anywhere in this document.

---

## 24. Open Questions

1. Whether Charts should be built on an in-house rendering layer or wrap an existing charting library — this spec defines the component *contract* (inputs/outputs/accessibility/theming) independent of that choice, but the choice affects the Performance guidance's feasibility and warrants its own ADR before implementation.
2. Default virtualization thresholds (Table row count, Select/Autocomplete option count) — left as configurable values here; recommend setting defaults once real report-dataset sizes are known from the RBAC/Reports data specs.
3. Whether Snackbar's queue orchestrator (§13) lives in Shared (as a stateless queue utility) or in Core (as an app-wide singleton service) — leaning Core, since it needs exactly-one-instance semantics per shell, but flagging for confirmation against the Folder Structure Spec's Core/Shared boundary.

---

## 25. Next Steps

Recommended next: a **Theming & White-Label Specification**, since nearly every component here defers its actual color/spacing/typography values to a design-token system that hasn't yet been formally specified — this component library's accessibility and customization contracts are ready to build against once that token set is defined.
