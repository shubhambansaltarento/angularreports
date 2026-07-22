# Engineering Standards

**Project:** Enterprise Reporting Platform (dmsReports)
**Document type:** Engineering Standards (Spec-Driven Development — Stage 2)
**Status:** Draft — pending approval
**Depends on:** [Product Vision](product-vision.md), [Software Architecture Specification](architecture/software-architecture-specification.md), [Folder Structure Specification](architecture/folder-structure-specification.md)
**Date:** 2026-07-22

---

## 0. Purpose

This document is the day-to-day rulebook engineers follow while writing code against the approved architecture and folder structure. It does not redefine layers or dependency rules (see the Architecture and Folder Structure specs) — it defines *how code within each folder is written, named, tested, reviewed, and merged*. No code samples appear below; conventions are described in prose/naming-pattern form only.

These standards apply uniformly across `apps/*` and `libs/*` unless a section states a layer-specific exception.

---

## 1. Naming Conventions

| Element | Convention | Example pattern |
|---|---|---|
| File names | kebab-case, `<name>.<type>.ts` | `report-list.component.ts`, `reports.store.ts` |
| Folder names | kebab-case, plural for collections | `guards/`, `interceptors/`, `reports-data/` |
| Classes, Interfaces, Types, Enums | PascalCase | `ReportsStore`, `ReportsRepositoryPort`, `ReportStatus` |
| Variables, functions, properties, methods | camelCase | `loadReports`, `isAuthenticated` |
| True constants (primitive values) | SCREAMING_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Injection tokens | SCREAMING_SNAKE_CASE, `_TOKEN` suffix | `REPORTS_REPOSITORY_TOKEN` |
| Booleans (vars, signals, inputs) | `is` / `has` / `can` / `should` prefix | `isLoading`, `canExport`, `hasPermission` |
| Component selectors | single platform-wide prefix `dms-` | `dms-report-list`, `dms-report-viewer` |
| Directive selectors | `dms` camelCase attribute prefix | `dmsClickOutside`, `dmsHasPermission` |
| Type-suffix taxonomy (binding, not decorative) | one suffix per architectural role | see table below |

**Type-suffix taxonomy** (must match the owning layer per the Folder Structure Spec):

`*.component.ts` · `*.store.ts` · `*.service.ts` (Business only) · `*.repository.ts` (Data only) · `*.adapter.ts` (Infrastructure only) · `*.port.ts` · `*.token.ts` · `*.guard.ts` · `*.resolver.ts` · `*.interceptor.ts` · `*.pipe.ts` · `*.directive.ts` · `*.validator.ts` · `*.model.ts` · `*.dto.ts` (Data only) · `*.constants.ts` · `*.config.ts` · `*.layout.ts` · `*.spec.ts`

A reviewer must be able to identify a file's architectural role from its suffix alone, without opening it. A file whose suffix doesn't match its actual role is a review-blocking finding.

**Signals vs. Observables:** Signals carry **no** suffix (`reports`, not `reports$`). The `$` suffix is reserved exclusively for RxJS `Observable`-typed values, so the two reactive primitives remain visually distinguishable wherever both appear in the same file (e.g., at the HTTP boundary before conversion to a Signal).

---

## 2. Component Conventions

- **Standalone only** — no `NgModule` ever declares or imports a component.
- **`ChangeDetectionStrategy.OnPush`** is mandatory on every component, no exceptions.
- **`inject()`** for all dependencies — no constructor-parameter injection.
- **Signal-based inputs/outputs** (`input()`, `input.required()`, `output()`) are the default; template/decorator-based `@Input`/`@Output` are only acceptable where a signal-based equivalent is not yet available for the API in question.
- **Smart vs. dumb split** is structural, not optional:
  - *Presentational* components (Shared, and the presentational half of a Feature) receive data only via inputs and communicate only via outputs — no `inject()` of a Business Store/Service.
  - *Container* components (Feature) `inject()` the relevant Business Store/Facade, derive template-ready state via `computed()`, and translate outputs into Store method calls.
- **One component, one file, one responsibility.** A component exceeding roughly 200–300 lines of template+class combined, or handling more than one clearly separable concern, must be decomposed.
- **Template/style co-location:** every component ships as a `.ts` + `.html` + `.scss` trio. Inline templates/styles are permitted only for trivial components (template under ~15 lines, no conditional/loop blocks) — anything larger goes to a separate file for diffability and template-language tooling support.
- **No business logic in templates.** Templates bind to Signals/`computed()` values and call methods; they never contain multi-step conditional business logic (e.g., inline RBAC checks) — that belongs in the Store/Service backing the component.

---

## 3. Service Conventions

*(Applies specifically to Business-layer application services — see Folder Structure Spec §8.2 for why "Service" is reserved for this layer.)*

- **Single Responsibility per service:** one service owns one cohesive use-case family (e.g., report-authorization evaluation), not "everything related to reports."
- **`inject()` only**, no constructor injection, mirroring Component conventions.
- **Depend on Ports, not concretions:** a Business service injects a Port's `InjectionToken`, never a concrete Data repository class or Infrastructure adapter directly.
- **Provided scope:** `providedIn: 'root'` by default; a narrower (Feature-lazy-loaded) provider scope is used only when the service's state must not leak across feature boundaries, and that choice is called out in the service's doc-comment.
- **Statelessness preferred:** if a service is accumulating mutable state, evaluate whether that state actually belongs in a Store (§4) instead — a Service that behaves like a Store is a naming/responsibility smell.
- **Return shape:** async operations resolve to typed domain results (success value or typed domain error, see §9) — never an untyped `any`, never a raw HTTP response passed through untouched.

---

## 4. Signal Store Conventions

- **One Store per bounded context**, matching the Business libs already defined (`reports.store.ts`, `auth`/session store, etc.) — not one Store per component and not one giant app-wide Store.
- **State is private, exposure is read-only:** internal writable Signals are never exposed directly; the Store's public surface exposes `computed()`/read-only Signals plus explicit intent methods (e.g., `loadReports()`, `selectReport(id)`).
- **Mutations only through named intent methods** — no consumer of a Store ever calls a setter directly; every state transition has a name that describes *why* it happens, not just *that* it happens.
- **No direct Data/Infrastructure calls from a Store** — a Store calls a Business Service (or, for the simplest cases, directly calls an injected Port), never a concrete Data repository or Infrastructure adapter class.
- **Derived state uses `computed()`**, never duplicated as separately-maintained writable state that could drift out of sync.
- **Async loading/error state is explicit and typed** (e.g., an idle/loading/success/error status alongside the data Signal) so Presentation can render every state deterministically, never inferring loading state from "is the data Signal empty."
- **Testable in isolation:** a Store must be constructible/testable with a faked Port (per the `testing/` convention in the Folder Structure Spec), with no real HTTP, storage, or JWT dependency required to unit test its logic.
- **Library consistency:** whether Stores are hand-rolled Signal classes or built on a shared library pattern (e.g., `@ngrx/signals`) is a single platform-wide decision, not a per-feature choice — see Open Questions (§18) for this pending decision, to be ratified via its own ADR before the first Store is implemented.

---

## 5. Folder Conventions

- Every new file must map to exactly one folder defined in the Folder Structure Specification. If it does not fit, that is a signal to revisit the taxonomy (raise it, don't route around it) before adding an unstructured file.
- **No miscellaneous dumping-ground folders** (`misc/`, `helpers/`, `common/` without further qualification) — every folder name states what it holds, using the vocabulary already established (Models, Services, Stores, Interfaces, Utilities, etc.).
- A Feature's internal shape mirrors the pattern already used for Business libs: presentational components alongside a thin composition of Store/Service calls, plus feature-local `validators/`/`directives/` only where the exceptions in Folder Structure Spec §13/§14 apply.
- New top-level `libs/*` or `apps/*` additions require a short ADR (see §12) recording why the existing structure did not accommodate the need.

---

## 6. SCSS Conventions

- **Design tokens only — no hardcoded values.** Colors, spacing, typography, and radii are always referenced via the CSS custom properties defined in `libs/shared/styles` (see Architecture Spec §9, Folder Structure Spec §7); a literal hex color or magic pixel value in component SCSS is a review-blocking finding, since it silently breaks white-label theming.
- **Angular view encapsulation is the default** style-scoping mechanism; `::ng-deep` and other encapsulation-piercing techniques are forbidden. A Shared component that needs to be visually customizable by a consumer exposes specific CSS custom properties as its styling "API" instead.
- **Units:** `rem` for typography and spacing (scales with user/browser font-size settings); `px` only for effects that must not scale (e.g., 1px hairline borders).
- **Nesting depth capped at 3 levels** to avoid specificity wars and keep selectors resilient to markup changes.
- **Partial file convention:** shared, non-component SCSS lives in underscore-prefixed partials (`_tokens.scss`, `_mixins.scss`, `_reset.scss`) imported by each shell's single global stylesheet entry point.
- **No inline `style` attributes** in templates except for genuinely dynamic, computed values bound via `[style.*]`/`[ngStyle]` where a class-based alternative is impractical.

---

## 7. Import Conventions

- **Path aliases across lib boundaries** — any import that crosses from one `libs/*`/`apps/*` project into another uses the workspace path alias (e.g., `@dms/business-reports`), never a deep relative path (`../../../../libs/...`). Relative imports are reserved for files within the same lib.
- **Import grouping and order:** (1) Angular/platform imports, (2) third-party package imports, (3) workspace lib imports via alias, (4) relative local imports — one blank line between groups, alphabetized within each group. This is enforced by lint configuration (e.g., an `import/order` rule), not left to individual discipline.
- **No circular imports between libs** — this is also mechanically enforced by the module-boundary tooling named in the Architecture Specification (§7.2, rule 8); a circular-import error is a boundary violation, not a style nit.
- **No wildcard namespace imports** (`import * as X`) except for well-established namespace patterns where the ecosystem convention expects it.
- **Type-only imports** use `import type` wherever only compile-time types are needed, keeping runtime bundles free of unnecessary imports.

---

## 8. Barrel Files

- **One public barrel per lib** (`index.ts` at the lib's root), re-exporting only the lib's intended public API — Ports, public Models, public Components/Directives/Pipes meant for external consumption.
- **Internal details are never re-exported** — a concrete Data repository, an internal helper, or a private Store implementation detail must not appear in the barrel; if it's not meant to be imported from outside the lib, it simply isn't exported at the top level.
- **No nested barrels inside a lib's internal folders** (e.g., no `components/index.ts` within a Feature) — barrels exist only at each lib's single public boundary, avoiding barrel sprawl and reducing circular-import and over-eager-bundling risk.
- **Explicit exports, not `export *` of everything** — each barrel names exactly what it re-exports so both readers and tree-shaking tooling can reason about the lib's real public surface.
- **Testing secondary entry point has its own separate barrel** (e.g., a lib's `testing/index.ts`), never merged into the main barrel, so production builds can never accidentally pull in test fixtures/fakes.

---

## 9. Error Handling

- **Two error classes, handled differently:**
  - *Domain/expected errors* (report not found, unauthorized, validation failure) are modeled as typed results/discriminated unions returned by Business Services — never thrown as bare strings, never represented as a generic `Error`.
  - *Technical/unexpected errors* (network failure, unhandled exceptions) are caught at the boundary closest to their source (Infrastructure/Data for HTTP, Core's global error handler for anything else) and normalized before propagating further inward.
- **No raw technical errors leak into Business or Presentation.** An HTTP failure is translated by the Data/Infrastructure boundary into the same typed domain-error shape Business already uses — Presentation never inspects an HTTP status code directly.
- **Presentation renders expected errors inline** (empty state, permission-denied message, retry affordance) — it never surfaces a raw exception, and never fails silently (no swallowed errors with no visible state change).
- **Global error handler (Core)** is the last line of defense for anything unexpected: it always logs (see §10) before showing a generic fallback UI, and never exposes a stack trace to the end user.
- **Embedded-mode fail-closed rule is non-negotiable:** any JWT validation or authorization failure in the Embedded shell renders a defined error state and nothing else — never partial data, never a fallback login form (per Architecture Spec FR-2.3 and Vision SC5).
- **Retries are an Infrastructure-layer concern only,** limited to transient technical failures (e.g., one retry with backoff on a network timeout); business-outcome errors (403/404/422) are never retried automatically.

---

## 10. Logging

- **All logging goes through the single Logging adapter** (Infrastructure layer). Raw `console.*` calls are forbidden in Business, Data, Feature, and Shared code — they are permitted only transiently during local debugging and must not reach a committed change.
- **Log levels have defined meanings:** `debug` (dev-only diagnostic detail, stripped/disabled in production), `info` (notable, expected state transitions — e.g., "session established"), `warn` (recoverable anomaly worth noticing), `error` (a failure requiring attention, always paired with the Error Handling flow in §9).
- **No sensitive data is ever logged** — JWT contents, session tokens, and report data (which may be business-confidential) are never logged in raw form; where identification is needed for diagnostics, log a redacted/hashed identifier instead.
- **Structured, not free-text, logging:** log calls carry key-value context (e.g., `{ event: 'report_load_failed', reportId, reason }`) rather than concatenated strings, so logs remain machine-parseable for future observability tooling (Vision NFR — Observability).
- **Shared components never log directly** — a Shared UI-kit component that needs to signal something emits an output/event; the consuming Feature/Business layer decides whether and how to log it, keeping Shared free of any logging-adapter dependency (consistent with Shared's purity rule).

---

## 11. Comments

- **Default: no comments.** Code is made self-documenting through naming (per §1) and structure; a comment restating *what* code does is a code-smell, not documentation.
- **Comment only the "why"** — a hidden constraint, a non-obvious workaround for a specific external limitation, an invariant that isn't visible from the code shape alone. If deleting the comment would not confuse a future reader, it should not have been written.
- **No commented-out code** is ever committed — deleted code is retrieved from git history, not left inline "just in case."
- **No bare `TODO` comments** — a `TODO` is only acceptable when it references a tracked issue/ticket ID; an untracked `TODO` is a review-blocking finding.
- **Public-API doc-comments are the exception to "no comments"** — see §12.

---

## 12. Documentation

- **Public API surfaces are documented**, not internals: every symbol a lib's barrel (§8) exports gets a concise doc-comment stating its purpose and any non-obvious parameter/return semantics — it does not restate the symbol's name in prose.
- **Every lib has a short README** stating: its purpose, its allowed/forbidden dependencies (cross-referencing the Folder Structure Spec rather than re-stating the full matrix), and a one-paragraph summary of its public API. READMEs stay short — they point at doc-comments and specs rather than duplicating them.
- **ADRs are mandatory for architecturally significant decisions** (already a standing project rule) — stored under `docs/adr/`, numbered sequentially, and treated as immutable once accepted: a later decision that supersedes an earlier one is written as a new ADR referencing the old one, never an edit to history.
- **Specs live under `docs/`** following the established SDD progression (Vision → Architecture → Folder Structure → Engineering Standards → Feature specs), each cross-referencing the specs it depends on, as this document does.
- **Diagrams use Mermaid** by default (as established in the Architecture Specification) for portability and in-PR reviewability, over external diagramming tools.

---

## 13. Git Conventions

- **Branch naming:** `<type>/<short-kebab-description>` where `<type>` matches the Commit Convention types in §14 (e.g., `feat/reports-export-button`, `fix/jwt-expiry-check`, `chore/lint-boundaries-config`).
- **No direct commits to `main`** — every change lands via pull request, including documentation-only and configuration-only changes.
- **Short-lived feature branches**, rebased on `main` before merge to keep a linear, bisectable history; PRs are squash-merged so `main` holds one coherent commit per merged unit of work, while the source branch can carry messy WIP commits freely.
- **No force-push to shared branches** (`main` or any long-lived integration branch) — force-push is only acceptable on one's own not-yet-reviewed feature branch.
- **Never commit generated artifacts** (`dist/`, build caches) **or secrets/credentials** (populated environment files, private keys, signing secrets for JWTs) — these are excluded via `.gitignore` and verified during review if a diff touches anything resembling configuration or credentials.

---

## 14. Commit Conventions

- **Conventional Commits format:** `<type>(<scope>): <imperative summary>` — e.g., `feat(reports): add export button`, `fix(auth): correct JWT expiry comparison`.
- **Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`, `ci` — chosen to match the actual nature of the change, not defaulted to `feat`/`chore` out of convenience.
- **Scope** names the affected lib/feature (e.g., `reports`, `auth`, `shared-ui`), matching the workspace's own naming vocabulary.
- **Imperative, present tense** ("add", "fix", "remove" — not "added"/"adds"/"removed").
- **Commit body explains *why*, not *what*** — the diff already shows what changed; the message earns its place by explaining motivation, trade-off, or context a diff can't convey.
- **One coherent, independently revertable change per commit** — a refactor and a feature addition are never mixed into the same commit, even if they touch the same file.
- **Reference the tracking issue/ticket** where one exists, so history stays traceable to product/architecture decisions.

---

## 15. Testing Standards

- **Test pyramid, weighted toward the Business layer:** the majority of tests are unit tests for Business Services/Stores and pure Utilities; Presentation components get behavior-focused component tests (renders correctly given state, emits correct events on interaction); a thin top layer of end-to-end tests covers golden paths only.
- **Business Services/Stores are tested against faked Ports**, never real HTTP/storage/JWT — the `testing/` secondary entry point per lib (Folder Structure Spec §22) is the source of these fakes.
- **Every Port has an agreed contract** its real Data-layer implementation and its Fake are both tested against, so the two cannot silently diverge over time.
- **Coverage is prioritized by risk, not chased as a raw percentage:** Business-layer authorization/RBAC logic and both shells' bootstrap/entry flows are held to the highest bar; Data/Infrastructure adapters are tested at their boundary (mocking the actual external system); Presentation is tested for behavior, not implementation detail.
- **Embedded-mode fail-closed behavior is a mandatory, non-negotiable test case:** invalid, expired, and tampered-JWT scenarios must each have an automated test asserting the defined error state renders and no report data or login form appears (Vision SC5).
- **Snapshot tests are avoided for anything with business meaning** — they are brittle and tend to be updated reflexively rather than reviewed; acceptable only for stable, purely presentational markup with no conditional business logic.
- **No test depends on execution order or on state shared with another test** — every test sets up and tears down its own state.

---

## 16. Code Review Checklist

A change is not approved until the reviewer can answer **yes** to every applicable item:

- [ ] Every new/changed file lives in the folder its role dictates (Folder Structure Spec), and its suffix matches that role (§1).
- [ ] No layer-boundary violation was introduced (Presentation/Data never imported directly by Business; Shared imports nothing from Business/Data/Infrastructure/Feature; no new circular imports).
- [ ] Components are Standalone, `OnPush`, use `inject()`, and use signal-based inputs/outputs where available.
- [ ] No constructor-parameter injection anywhere in the diff.
- [ ] Business Services/Stores depend on Ports, not concrete Data/Infrastructure classes.
- [ ] Signal Store mutations happen only through named intent methods — no exposed writable Signal setters.
- [ ] No hardcoded color/spacing/typography values in SCSS — design tokens used throughout.
- [ ] No raw `console.*` calls; logging (if any) goes through the Logging adapter with no sensitive data.
- [ ] Error handling follows §9: domain errors are typed, technical errors are normalized at the boundary, nothing renders a raw exception or stack trace to the user.
- [ ] If the change touches Embedded-mode auth/authorization, fail-closed behavior is preserved and covered by a test.
- [ ] No commented-out code, no untracked `TODO`s, comments (if any) explain "why" not "what."
- [ ] Public API changes (barrel exports) are doc-commented; a lib README is updated if its public surface or dependency rules changed.
- [ ] An ADR was added or updated if the change is architecturally significant (new lib, new cross-lib dependency pattern, new shared convention).
- [ ] Tests exist for new/changed Business logic, use faked Ports (not real HTTP), and avoid brittle snapshot tests for business-meaningful UI.
- [ ] Commit messages follow Conventional Commits with an accurate type/scope and an imperative summary.
- [ ] No secrets, credentials, or populated environment files are present in the diff.

---

## 17. Definition of Done

A unit of work is **Done** only when all of the following hold:

- [ ] A specification for the feature/change was written and explicitly approved before implementation began (standing project rule — no exceptions).
- [ ] The implementation matches the approved spec's scope — no unrequested scope expansion, no unfinished/partial paths left in place.
- [ ] The change passes lint, type-checking, and module-boundary enforcement with zero suppressions added to make it pass.
- [ ] Unit/integration tests exist for new or changed logic and pass, with coverage weighted per §15's risk priorities (Business/RBAC/both-shell entry flows especially).
- [ ] New or changed UI meets WCAG 2.1 AA (Vision NFR — Accessibility), verified manually where automated tooling can't cover it.
- [ ] If shared code (Shared, Business, Data, Infrastructure, or the `reports` Feature) was touched, both `shell-standalone` and `shell-embedded` were verified to still build and behave correctly — not just the shell the author was focused on.
- [ ] Documentation is current: doc-comments on any changed public API, lib README updated if applicable, ADR added for any architecturally significant decision.
- [ ] The Code Review Checklist (§16) was completed and the change was approved by at least one reviewer.
- [ ] Commit history and PR follow the Git/Commit Conventions (§13/§14).
- [ ] No open `TODO` without a linked tracking issue remains in the merged diff.

---

## 18. Open Questions

1. **Signal Store implementation pattern** — hand-rolled Signal-based Store classes vs. adopting `@ngrx/signals` (or an equivalent library) as the platform-standard, to be settled via its own ADR before the first Store (RBAC/session) is implemented; §4's behavioral conventions apply regardless of which is chosen.
2. **Component selector prefix** — this document assumes a single platform-wide `dms-` prefix; confirm this is acceptable given the "reusable platform for multiple enterprise products" goal, or whether a per-tenant/per-product prefixing scheme is needed for future white-label deployments.
3. **Squash-merge policy** — confirm squash-merge-on-PR is the intended `main`-history policy, versus a rebase-and-merge policy that preserves individual commits.

---

## 19. Next Steps

Pending approval, these standards apply to all subsequent feature specs and their implementations. Recommended next spec remains **RBAC / Authorization Model** — its Store and Service will be the first concrete artifacts these standards, and the open Signal Store decision (§18.1), get exercised against.
