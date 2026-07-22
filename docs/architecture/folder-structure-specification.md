# Folder Structure Specification

**Project:** Enterprise Reporting Platform (dmsReports)
**Document type:** Architecture Detail Spec (Spec-Driven Development — Stage 1b)
**Status:** Draft — pending approval
**Depends on:** [Product Vision](../product-vision.md), [Software Architecture Specification](software-architecture-specification.md), [ADR-0001](../adr/0001-layered-architecture-and-workspace-structure.md)
**Date:** 2026-07-22

---

## 1. Purpose of This Document

The Software Architecture Specification (§6) established the top-level workspace layout (`apps/`, `libs/core`, `libs/shared`, `libs/business`, `libs/data`, `libs/infrastructure`, `libs/config`, `libs/routing`, `libs/features`) and the layer dependency rules. This document drills one level deeper: it defines every **sub-folder** that appears inside those layers — Core, Shared, Features, Layouts, Assets, Styles, Stores, Services, Models, Interfaces, Utilities, Pipes, Directives, Validators, Guards, Resolvers, Interceptors, Configuration, Constants, Tokens, Environment, and Testing — with, for each: **Purpose, Responsibilities, Allowed dependencies, Forbidden dependencies, Naming conventions, Best practices**.

No implementation code appears below — only structure, contracts, and naming/organizational rules.

### 1.1 Assumptions

- The layer model and dependency matrix from the Software Architecture Specification (§7) are approved and in force; this document does not redefine layer boundaries, only the folders within them.
- File-naming conventions given here (suffixes like `.store.ts`, `.port.ts`) describe *what a file is for*, not its contents — they are organizational metadata, not implementation.

### 1.2 Dependencies

- Requires the Software Architecture Specification's layer definitions (§8–§16) as the authority for which top-level `libs/*` each folder below lives inside.
- Feeds directly into the upcoming RBAC, Authentication, and Theming specs, which will populate (not restructure) these folders.

### 1.3 Acceptance Criteria

- [ ] All 22 requested folders are documented with all six required attributes each.
- [ ] Every folder's "allowed/forbidden dependencies" is stated in terms of the layer names already defined in the Software Architecture Specification (no new, undefined layers introduced).
- [ ] Naming-overlap conflicts inherent in the requested list (e.g., "Services" vs. Business/Infrastructure boundary, "Constants" vs. "Tokens") are explicitly resolved, not silently glossed over.
- [ ] A consolidated directory tree shows where every folder sits in the workspace.
- [ ] No implementation code is present.

---

## 2. Resolved Ambiguities

A few of the requested folder names map naturally onto *multiple* architectural layers, or overlap with each other. Rather than force one physical folder to serve conflicting purposes, this spec resolves each explicitly:

| Requested name | Resolution |
|---|---|
| **Services** | Reserved for **Business-layer application/use-case services**. Infrastructure's technical wrappers (HTTP, storage, JWT, embed-bridge) are called **Adapters**, not Services, precisely so a grep for "service" never turns up a boundary-ambiguous result. Data-layer classes are called **Repositories**, not Services. |
| **Models** | Reserved for **pure domain models** (Business layer only — no HTTP/serialization concerns). Wire-format types are **DTOs**, living only in the Data layer, converted to/from Models by Data-layer mappers. Presentation-only shapes (e.g., a table's view-row shape) are **View Models**, living inside the Feature/Presentation folder that uses them, never in `models/`. |
| **Interfaces** | Split by intent: **Ports** (Business-layer contracts implemented by Data/Infrastructure, e.g. `ReportsRepositoryPort`) live inside `libs/business/*/interfaces`. **Structural/shared interfaces** with no business meaning (e.g., a generic `Paginated<T>` envelope) live in `libs/shared/interfaces`. A file must not require both a domain import and a generic-shape import to make sense — that split point tells you which folder it belongs in. |
| **Constants** | Split by ownership: **domain constants** (role names, permission keys, report-status enums) live beside the Business lib that owns that concept. **Generic/technical constants** (date-format strings, breakpoint values, storage-key prefixes) live in `libs/shared/constants` or `libs/core/constants`. |
| **Tokens** | Reserved specifically for **Angular `InjectionToken` definitions** (DI wiring), not to be confused with "design tokens" (which are a Styles/Theming concept, see §6.6) or "JWT tokens" (an Infrastructure/security concept, see §16.6). Each is documented separately below with this distinction called out again to prevent confusion in code review. |
| **Directives / Validators** | Split by whether business/authorization logic is required. **Generic** directives and validators (no domain knowledge — e.g., `appClickOutside`, a `required`/`pattern` validator) live in Shared. **Business-aware** ones (e.g., a permission-gating structural directive, an async "report name must be unique" validator) live inside the owning Feature or Business-adjacent presentation folder — never in Shared, since that would force Shared to depend on Business (forbidden). This is called out again in §13 and §14. |

---

## 3. Consolidated Directory Tree

```
dms-reports/
├── apps/
│   ├── shell-standalone/
│   │   └── src/
│   │       ├── layouts/                  # §5 — shell-specific layout composition
│   │       ├── app.routes.ts
│   │       └── app.config.ts             # DI wiring: ports → concrete implementations
│   └── shell-embedded/
│       └── src/
│           ├── layouts/                  # minimal/no-chrome layout
│           ├── app.routes.ts
│           └── app.config.ts
│
├── libs/
│   ├── core/
│   │   └── src/
│   │       ├── interceptors/             # §17 — registration composition (impl. in infrastructure/http)
│   │       ├── tokens/                   # §20 — app-wide DI tokens (session store token, mode token)
│   │       ├── constants/                # §19 — app-wide technical constants
│   │       ├── error-handling/
│   │       └── bootstrap/
│   │
│   ├── shared/
│   │   └── src/
│   │       ├── ui/                       # dumb presentational components
│   │       ├── layouts/                  # §5 — reusable structural templates
│   │       ├── pipes/                    # §12
│   │       ├── directives/               # §13 — generic only
│   │       ├── validators/               # §14 — generic only
│   │       ├── utilities/                # §11
│   │       ├── interfaces/               # §10 — generic/structural only
│   │       ├── constants/                # §19 — generic/technical only
│   │       ├── assets/                   # §6 — shared design-system media
│   │       ├── styles/                   # §7 — global styles/theming scaffolding
│   │       └── testing/                  # §22 — shared test builders/mocks
│   │
│   ├── business/
│   │   ├── auth/
│   │   │   └── src/
│   │   │       ├── models/               # §9
│   │   │       ├── interfaces/           # §10 — Ports (e.g. AuthorizationPort)
│   │   │       ├── stores/               # §8 — Signal-based session/authorization state
│   │   │       ├── services/             # §8 — application/use-case services
│   │   │       ├── constants/            # §19 — role/permission constants
│   │   │       └── testing/              # §22 — mock port implementations
│   │   ├── reports/                      # same internal shape as auth
│   │   ├── dashboard/
│   │   └── administration/
│   │
│   ├── data/
│   │   ├── auth-data/
│   │   │   └── src/
│   │   │       ├── repositories/         # implements Business ports
│   │   │       ├── dto/                  # wire-format types (never exported outside Data)
│   │   │       └── mappers/              # DTO ⇄ domain Model
│   │   ├── reports-data/
│   │   └── administration-data/
│   │
│   ├── infrastructure/
│   │   ├── http/
│   │   │   └── src/
│   │   │       ├── adapters/
│   │   │       └── interceptors/         # §17 — functional interceptor implementations
│   │   ├── storage/
│   │   ├── jwt/
│   │   ├── embed-bridge/
│   │   └── logging/
│   │
│   ├── config/
│   │   ├── environment/                  # §21
│   │   ├── runtime-config/
│   │   ├── theming/                      # §7 — design tokens (theme values, not DI tokens)
│   │   ├── feature-flags/
│   │   └── mode-detection/
│   │
│   ├── routing/
│   │   └── src/
│   │       ├── guards/                   # §15
│   │       └── resolvers/                # §16
│   │
│   └── features/
│       ├── auth-login/
│       │   └── src/
│       │       ├── validators/           # §14 — business-aware, feature-local
│       │       ├── directives/           # §13 — business-aware, feature-local (if any)
│       │       └── testing/
│       ├── dashboard/
│       ├── reports/
│       └── administration/
│
└── tools/
    ├── boundaries/                        # dependency-rule enforcement config
    └── testing/                           # §22 — workspace-level e2e / test harness config
```

---

## 4. Core

**Purpose:** The single composition-glue layer instantiated once per shell — where app-wide singletons are wired, not where features live.

**Responsibilities:**
- House DI wiring artifacts (tokens, interceptor *registration*) and app-wide constants/error handling that must exist exactly once.
- Provide the mode-bootstrap mechanism that both shells use to resolve Standalone vs. Embedded at startup.

**Allowed dependencies:** Configuration, Infrastructure, Business (only to obtain the concrete session/auth service exposed as a singleton).

**Forbidden dependencies:** Feature, Presentation, Data (Core must never import a concrete Data repository directly — it wires ports to implementations via tokens, it does not use Data's classes itself for any business purpose).

**Naming conventions:** `core` (singular, lowercase); internal sub-folders lowercase-plural (`tokens/`, `constants/`, `interceptors/`).

**Best practices:**
- Keep Core intentionally small — if a file could plausibly belong to a Feature, it does not belong in Core.
- Never add UI components to Core beyond a root error-boundary/shell placeholder.
- Treat any growth in Core as a warning sign of leaking business logic into composition glue.

---

## 5. Layouts

**Purpose:** Reusable *structural* page templates (header + sidenav + content region, or bare content-only region) that a shell composes around Feature routes.

**Responsibilities:**
- Define the structural regions of a page (e.g., `StandaloneShellLayout` with header/nav/footer slots; `EmbeddedLayout` with a single content region and no chrome, per Vision FR-2.5).
- Compose Shared UI primitives (header bar, side nav) into a slotted structure — contain no business logic themselves.

**Allowed dependencies:** Shared (UI primitives, styles), Configuration (theming, to render tenant branding in the header/nav region).

**Forbidden dependencies:** Business, Data, Infrastructure, Feature (a layout must not know what feature is rendered inside its content slot — it only provides the slot).

**Naming conventions:** `*.layout.ts` suffix (e.g., `standalone-shell.layout.ts`, `embedded.layout.ts`); folder is plural `layouts/`.

**Best practices:**
- One layout per structurally distinct shell composition — do not create a new layout for minor visual variants; use theming for that instead.
- The Embedded shell should use a deliberately minimal layout (or none) — do not reuse the Standalone shell's chrome-bearing layout even partially, per Vision FR-2.5 ("no navigation").
- Layouts route-outlet only; they never fetch data.

---

## 6. Assets

**Purpose:** Static, non-code media — images, icons, fonts, static JSON (e.g., default i18n bundles) — versioned alongside the code that depends on them.

**Responsibilities:**
- Hold shared design-system media (default logo, illustrations, icon set) in `libs/shared/assets`.
- Each shell app may hold its own `apps/<shell>/src/assets` for shell-specific static files (e.g., a favicon) that are not shared.

**Allowed dependencies:** None (assets are leaf, referenced by URL/import, not importing anything themselves).

**Forbidden dependencies:** N/A — assets do not depend on code; but code in Business/Data/Infrastructure must never reference Feature- or shell-specific assets directly (keeps them portable).

**Naming conventions:** lowercase-kebab-case filenames (`report-empty-state.svg`, `logo-default.png`); group by type in sub-folders (`icons/`, `images/`, `fonts/`).

**Best practices:**
- Default (non-tenant) branding assets live in `libs/shared/assets` and are overridden at runtime by tenant-supplied URLs from the Configuration/theming layer for white-label deployments — assets folders should not be forked per tenant.
- Keep binary asset size and count under review; large media belongs in a CDN/config-driven URL, not bundled.

---

## 7. Styles

**Purpose:** Global styling scaffolding — resets, mixins, and the design-token *consumption* layer (CSS custom properties) that Shared components and Layouts render against.

**Responsibilities:**
- Define global CSS resets and typography baseline.
- Define the *shape* of design tokens (e.g., `--color-primary`, `--spacing-md`) that components consume; the *values* for a given tenant are supplied at runtime by `libs/config/theming` (Configuration Layer), keeping Styles theme-structure-aware but theme-value-agnostic.

**Allowed dependencies:** Configuration (theming — for the token contract/shape only, not hardcoded tenant values).

**Forbidden dependencies:** Business, Data, Infrastructure, Feature (styling must never encode business rules or be feature-specific at the global level — feature-specific styles are co-located with their components instead).

**Naming conventions:** `_reset.scss`, `_tokens.scss`, `_mixins.scss` (partial-file underscore convention); one global entry point (`styles.scss`) per shell app importing from `libs/shared/styles`.

**Best practices:**
- Never hardcode a tenant's brand color in global Styles — only reference the token variable, so white-label re-theming (Vision G5) requires zero style-file changes.
- Component-scoped styles stay with their component in Shared/Feature folders; global Styles is only for cross-cutting resets/tokens/mixins.

---

## 8. Stores (and Services)

Treated together because they are the two building blocks of the **Business layer's** runtime behavior (see §2 resolution: "Services" = Business application services).

### 8.1 Stores

**Purpose:** Signal-based, reactive state containers for a bounded context (e.g., `ReportsStore`, `SessionStore`).

**Responsibilities:**
- Hold and expose domain state as read-only Signals to Presentation.
- Mutate state only through explicit methods (no direct external mutation), keeping state transitions intentional and traceable.

**Allowed dependencies:** Services (within the same Business lib), Interfaces/Ports (to call Data through an injected port, never a concrete Data class).

**Forbidden dependencies:** Presentation, Data (concrete classes), Infrastructure, Feature.

**Naming conventions:** `*.store.ts` (e.g., `reports.store.ts`); class name suffix `Store` (e.g., `ReportsStore`).

**Best practices:**
- One store per bounded context, not per component — stores are shared state, not component-local UI state (component-local view state stays in the component itself as a local Signal).
- Keep a store's public surface to Signals + intent methods; never expose a mutable Signal setter directly to Presentation.

### 8.2 Services

**Purpose:** Stateless (or minimally-stateful) application/use-case orchestration — the "verbs" of the Business layer (e.g., "evaluate authorization for report X").

**Responsibilities:**
- Orchestrate calls across one or more Ports and domain rules to fulfill a single use-case.
- Contain the platform's actual business rules (e.g., RBAC evaluation logic).

**Allowed dependencies:** Interfaces/Ports, Models, Constants (domain).

**Forbidden dependencies:** Presentation, Data (concrete classes — only their Port interfaces), Infrastructure, Routing, Feature.

**Naming conventions:** `*.service.ts` suffix reserved exclusively for Business-layer application services (per §2 resolution — Infrastructure uses `*.adapter.ts`, Data uses `*.repository.ts`).

**Best practices:**
- If a "service" only forwards calls to an adapter with no rule/decision logic of its own, question whether it belongs in Business at all — it may be redundant plumbing.
- Keep RBAC/authorization evaluation centralized in one service per context, consumed identically by both `roleGuard` (Standalone) and `jwtGuard` (Embedded), per Vision FR-3.2.

---

## 9. Models

**Purpose:** Pure domain model definitions — the vocabulary of the business (`Report`, `User`, `Role`, `Permission`, `Session`, `Dashboard`).

**Responsibilities:** Represent business concepts independent of transport format (no HTTP/JSON-shape concerns) or UI-shape concerns.

**Allowed dependencies:** Other Models, domain Constants only.

**Forbidden dependencies:** Angular (`@angular/core` etc.), Data (DTOs), Infrastructure, Presentation, RxJS/Signals framework types where avoidable — Models should be as close to plain TypeScript as possible.

**Naming conventions:** `*.model.ts` (e.g., `report.model.ts`); type/interface name with no suffix (`Report`, not `ReportModel`) since the folder already conveys that.

**Best practices:**
- Never reuse a Data-layer DTO as a Model, even if their shapes currently match — they will diverge, and the mapper in Data is exactly the seam that absorbs that divergence.
- Keep Models free of methods that require injected dependencies; pure data shape plus, at most, trivial pure functions (e.g., a `isExpired(session)` free function is fine; a method requiring `inject()` is not — that belongs in a Service).

---

## 10. Interfaces

**Purpose:** Contracts — the mechanism enabling Dependency Inversion (Business defines, Data/Infrastructure implement) and any generic structural shapes reused across layers.

**Responsibilities:**
- **Ports** (in `libs/business/*/interfaces`): repository/gateway contracts Business depends on and Data implements (e.g., `ReportsRepositoryPort`).
- **Shared structural interfaces** (in `libs/shared/interfaces`): generic, business-agnostic shapes (e.g., `Paginated<T>`, `SortOrder`).

**Allowed dependencies:** Models (Ports may reference domain Models in their method signatures); nothing else.

**Forbidden dependencies:** Concrete implementations of any kind — an interface file must never import a class that implements it (that would invert the intended direction).

**Naming conventions:** Ports suffixed `*Port` (e.g., `ReportsRepositoryPort`), file `*.port.ts`; generic shared interfaces suffixed by their concept only, file `*.interface.ts`.

**Best practices:**
- A Port belongs to the Business lib that *consumes* it, not the Data lib that implements it — ownership follows the Dependency Inversion direction.
- Keep Ports narrow (interface segregation) — a `ReportsRepositoryPort` should not also expose administration-data methods; split by bounded context.

---

## 11. Utilities

**Purpose:** Pure, stateless helper functions with no framework or business dependency (formatting, date/number transforms, generic array/string helpers).

**Responsibilities:** Provide small, composable, side-effect-free functions usable from any layer that's allowed to depend on Shared.

**Allowed dependencies:** None beyond the language/standard library.

**Forbidden dependencies:** Angular DI (`inject()`), Business, Data, Infrastructure — a utility that needs `inject()` is a Service, not a Utility, and belongs in the layer that owns that concern.

**Naming conventions:** `*.util.ts` or grouped by concept (`date.util.ts`, `currency.util.ts`); exported functions are plain named functions, not classes.

**Best practices:**
- If a "utility" starts needing configuration or DI, it has outgrown Utilities — promote it to a Service in the appropriate layer.
- Favor small, well-tested pure functions here; they are the cheapest code in the workspace to unit test exhaustively.

---

## 12. Pipes

**Purpose:** Angular template-transform primitives for presentation-only formatting (currency, date, truncate, status-label).

**Responsibilities:** Convert a bound value into a display string/value inside a template — no side effects, no business decisions.

**Allowed dependencies:** Utilities (for the actual formatting logic), Configuration (e.g., a locale/format setting) — but not Business or Data.

**Forbidden dependencies:** Business, Data, Infrastructure, Feature.

**Naming conventions:** `*.pipe.ts`, pipe name in camelCase matching the file (e.g., `report-status.pipe.ts` → `reportStatus`).

**Best practices:**
- A pipe that needs to know "is this report visible to the current user" is doing authorization, not formatting — that decision belongs in a Business Service/Store, exposed to the template as data, not computed inside a Pipe.
- Keep pipes pure (`pure: true`) unless there is a specific, documented reason not to.

---

## 13. Directives

**Purpose:** Reusable DOM behavior/attribute logic attached to elements (tooltip, click-outside, autofocus, generic structural directives).

**Responsibilities:** Encapsulate cross-cutting DOM behavior with no business meaning.

**Allowed dependencies:** Utilities only.

**Forbidden dependencies:** Business, Data, Infrastructure — **with one named exception**: a business-aware directive (e.g., a permission-gating structural directive like `*appHasPermission`) is a legitimate, common need, but it must **not** live in `libs/shared/directives` because that would force Shared to depend on Business (forbidden per the Architecture Spec's dependency matrix). Such directives live inside the owning Feature (or a dedicated `libs/business/auth/presentation` export consumed only by Features, never by Shared) so the dependency-on-Business is contained to code that is already allowed to depend on Business.

**Naming conventions:** `*.directive.ts`, selector in camelCase prefixed `app` (e.g., `appClickOutside`).

**Best practices:**
- Default to Shared for any directive with zero business awareness; the moment a directive needs to ask "is this user allowed to...", move it out of Shared per the exception above.
- Keep directives single-purpose; compose multiple directives on an element rather than building one directive with branching modes.

---

## 14. Validators

**Purpose:** Reactive Forms validator functions.

**Responsibilities:**
- **Generic validators** (Shared): stateless, synchronous, no business knowledge (`required`, `pattern`, `minLength`, cross-field "passwords match").
- **Business-aware validators** (Feature-local): asynchronous or rule-driven validators that must call into Business (e.g., "report name must be unique," "role assignment must not exceed tenant's license seat count").

**Allowed dependencies:** Generic validators → Utilities only. Feature-local validators → Business (via injected Service/Port), Shared (generic validators to compose with).

**Forbidden dependencies:** Generic validators must never import Business, Data, or Infrastructure — the same Shared-purity rule as Directives, and for the same reason (see §13).

**Naming conventions:** `*.validator.ts`; exported factory functions suffixed `Validator` (e.g., `uniqueReportNameValidator`).

**Best practices:**
- Prefer synchronous, generic validators wherever a rule doesn't truly require a backend/business check — async validators have UX cost (debounce, loading state) and should be reserved for cases that genuinely need them.
- Co-locate a business-aware validator with the form that uses it inside its Feature folder, not in a shared location, unless a second Feature genuinely needs the identical rule (then promote it to the owning Business lib, not to Shared).

---

## 15. Guards

**Purpose:** Functional route-activation gates (per project constraint: functional guards only, no class-based guards).

**Responsibilities:**
- `authGuard` — Standalone session-authenticated check.
- `roleGuard` — RBAC route-level gating for Standalone.
- `jwtGuard` — Embedded JWT presence/validity + authorization check.

**Allowed dependencies:** Business (to call the shared authorization Service/Store — guards make no decisions themselves, only orchestrate the check and redirect/allow).

**Forbidden dependencies:** Data (concrete classes), Infrastructure (guards call Business, which in turn may use a Port implemented by Infrastructure-backed Data — guards never reach past Business), Presentation, Feature (a guard must not import a specific feature component; it only allows/redirects a route).

**Naming conventions:** `*.guard.ts`, function name suffixed `Guard` (e.g., `roleGuard`), applied via the route's `canActivate` array.

**Best practices:**
- Keep guards thin — orchestration only ("call the authorization service, act on its answer"), never embed the RBAC rule itself in the guard.
- One guard, one concern — compose multiple guards on a route rather than building one guard with branching logic per mode.

---

## 16. Resolvers

**Purpose:** Functional route resolvers that pre-fetch data required before a route activates.

**Responsibilities:** Call a Business Service/Store to ensure required data is available (or in-flight) before the routed component renders, reducing loading-state flicker.

**Allowed dependencies:** Business (same rule as Guards — never Data/Infrastructure directly).

**Forbidden dependencies:** Data (concrete classes), Infrastructure, Presentation, Feature.

**Naming conventions:** `*.resolver.ts`, function name suffixed `Resolver`.

**Best practices:**
- Use resolvers sparingly — prefer Signal-based, component-driven loading states for most cases; reserve resolvers for data that truly must exist before first render (e.g., avoiding a flash of "unauthorized" before an authorization check resolves).
- A resolver must not swallow errors silently; a failed resolve should route to a defined error/empty state, not a blank screen.

---

## 17. Interceptors

**Purpose:** Functional HTTP interceptors (per project constraint: functional interceptors only).

**Responsibilities:**
- Attach auth headers/tokens to outgoing requests.
- Normalize error responses into a consistent shape.
- Emit request/response telemetry.

**Allowed dependencies:** Infrastructure (their natural home — HTTP is a technical concern), Configuration (API base URL, whether telemetry is enabled).

**Forbidden dependencies:** Business (an interceptor must not itself decide *whether* a user is authorized — it only attaches whatever token/header Core/Business already determined is current), Data, Presentation, Feature.

**Naming conventions:** `*.interceptor.ts`, function name suffixed `Interceptor` (e.g., `authTokenInterceptor`), registered centrally in Core.

**Best practices:**
- Interceptors are implemented in `libs/infrastructure/http/interceptors` but *registered* (composed into the HTTP client chain) in Core — implementation and registration are intentionally separated so Core stays declarative.
- Keep each interceptor single-purpose (one for auth headers, a separate one for error mapping) rather than one large interceptor doing everything.

---

## 18. Configuration

**Purpose:** The seam for environment, runtime, tenant, and mode configuration — the Configuration Layer already defined in the Architecture Specification (§11), detailed here at the sub-folder level.

**Responsibilities:** See Architecture Spec §11 — environment config, runtime/tenant config, theming, feature flags, mode detection.

**Allowed dependencies:** None (leaf layer).

**Forbidden dependencies:** Every other layer — Configuration must remain a pure, dependency-free leaf so any layer can safely read it without creating cycles.

**Naming conventions:** One sub-folder per concern (`environment/`, `runtime-config/`, `theming/`, `feature-flags/`, `mode-detection/`); config value objects suffixed `Config` (e.g., `ThemeConfig`).

**Best practices:**
- Never let Configuration grow business logic ("if role is admin, enable flag X" belongs in Business, not here — Configuration only stores and exposes the flag's current value).
- Version the runtime-config schema explicitly so tenant-supplied configuration (white-label) can be validated at load time rather than failing silently deep in the app.

---

## 19. Constants

**Purpose:** Named, static values used in place of magic strings/numbers — split by ownership per §2's resolution.

**Responsibilities:**
- **Domain constants** (co-located with their owning Business lib): role names, permission keys, report-status enumerations.
- **Generic/technical constants** (`libs/shared/constants` or `libs/core/constants`): date-format strings, breakpoint values, storage-key prefixes, HTTP header names.

**Allowed dependencies:** None (constants are leaves; they may reference other constants within the same ownership group only).

**Forbidden dependencies:** Constants files must never import Services, Stores, or components — if a "constant" needs computed derivation from injected state, it is not a constant.

**Naming conventions:** `SCREAMING_SNAKE_CASE` for primitive constant values; `PascalCase` for constant enum-like objects (e.g., `ReportStatus`); file suffix `*.constants.ts`.

**Best practices:**
- Never duplicate the same conceptual constant (e.g., a role name string) in more than one place — domain constants belong to exactly one Business lib and are imported from there by anything with permission to depend on that lib.
- Prefer TypeScript `as const` unions/enums over bare string literals scattered through the codebase.

---

## 20. Tokens

**Purpose:** Angular `InjectionToken` definitions used to wire interfaces (Ports) to concrete implementations, and to inject Configuration values — the DI mechanism that makes Dependency Inversion (§10) actually work at runtime.

**Responsibilities:**
- Define one token per Port (e.g., `REPORTS_REPOSITORY_TOKEN` for `ReportsRepositoryPort`) alongside that Port's definition.
- Define app-wide tokens in Core (e.g., a mode-detection result token) where no specific Business lib owns the concept.

**Allowed dependencies:** The Interface/Port or Configuration shape the token represents.

**Forbidden dependencies:** Concrete implementation classes (a token file defines the *shape* of what can be provided, not which implementation is provided — that binding happens only in each shell's `app.config.ts`).

**Naming conventions:** `SCREAMING_SNAKE_CASE` constant name suffixed `_TOKEN` (e.g., `AUTHORIZATION_PORT_TOKEN`); file `*.token.ts`, typically co-located with the Port it represents rather than in one giant central file.

**Best practices:**
- Do not confuse DI Tokens with design tokens (§7, Styles) or JWT tokens (Infrastructure/security) — this is purely a naming-collision risk worth flagging explicitly in onboarding docs and code review.
- Co-locate a Port's token with the Port itself so the contract and its DI handle are discovered together.

---

## 21. Environment

**Purpose:** Build-time and deploy-time environment definitions (API base URL per environment, build flags), part of the Configuration Layer.

**Responsibilities:** Provide one environment definition per deploy target (e.g., local, staging, production) per shell, since Standalone and Embedded may point at different API base paths or have different feature flags enabled.

**Allowed dependencies:** None.

**Forbidden dependencies:** All other layers — like Configuration generally, Environment must stay a dependency-free leaf.

**Naming conventions:** `environment.<target>.ts` (e.g., `environment.production.ts`) or the workspace-tool-standard equivalent; exported object named `environment`.

**Best practices:**
- Do not put tenant/white-label branding values in Environment files — that is runtime-config/theming's job (Environment is build-time and per-deploy-target, not per-tenant).
- Keep secrets out of Environment entirely; it holds configuration, not credentials.

---

## 22. Testing

**Purpose:** Test utilities, fixtures, and harnesses that are reused *across* files/libs — distinct from the individual `*.spec.ts` files that stay co-located with the source they test.

**Responsibilities:**
- Provide reusable domain-model builders/factories (e.g., a `buildReport(overrides)` fixture builder) so tests across the workspace construct consistent, valid test data.
- Provide mock/fake implementations of Business Ports (e.g., an in-memory `FakeReportsRepository implements ReportsRepositoryPort`) that Presentation/Feature tests can inject in place of the real Data-layer implementation.
- House workspace-level end-to-end test configuration/harnesses under `tools/testing`.

**Allowed dependencies:** Whatever the *owning* lib may depend on (e.g., `libs/business/reports/testing` may depend on that lib's own Models/Interfaces to build valid fixtures) — testing folders inherit their parent lib's dependency rules, they do not get special exemptions to reach into forbidden layers.

**Forbidden dependencies:** A testing folder must never be imported by non-test code — it exists purely to be a `devDependency`-equivalent consumer, never a runtime one.

**Naming conventions:** `testing/` as a secondary entry point per lib (not a single monolithic test-utils package); fixture builders prefixed `build*` (e.g., `buildReport`); fakes prefixed `Fake*` (e.g., `FakeReportsRepository`). Unit spec files stay co-located with source as `*.spec.ts`, never moved into `testing/`.

**Best practices:**
- Keep one `testing/` secondary entry point per lib rather than a single cross-cutting test-utilities lib — this keeps the dependency graph honest (a Feature's tests importing `business/reports/testing` still respects the Feature→Business allowed dependency, rather than reaching sideways through an unrelated shared package).
- A `Fake*` Port implementation belongs beside the real thing's Port definition (in the owning Business lib's `testing/`), not beside the concrete Data-layer implementation — tests should be able to run without pulling in Data/Infrastructure at all.

---

## 23. Best Practices — Cross-Cutting Summary

- **One concern, one folder, one owner.** Every file should be placeable by asking "what layer owns this decision?" — if the answer is ambiguous, that is a signal the folder taxonomy (or the code itself) needs revisiting before it is written, not after.
- **Shared stays pure.** The single most valuable invariant in this structure is that `libs/shared/*` never depends on Business/Data/Infrastructure — it is what keeps the Embedded bundle lean and what makes white-labeling safe. Treat any proposed exception with high scrutiny (see the Directives/Validators exception pattern in §13/§14 for how to handle genuine business-aware UI needs without breaking this invariant).
- **Naming suffixes are load-bearing.** `.store.ts` / `.service.ts` / `.repository.ts` / `.adapter.ts` / `.port.ts` / `.guard.ts` / `.resolver.ts` / `.interceptor.ts` / `.pipe.ts` / `.directive.ts` / `.validator.ts` / `.token.ts` / `.model.ts` / `.constants.ts` are not decoration — a reviewer should be able to tell which layer a file belongs to from its suffix alone, without opening it.
- **Enforce, don't trust.** As stated in the Architecture Specification (§7.2, rule 8), every allowed/forbidden dependency above must be encodable as a lint/module-boundary rule; this document is the source of truth those rules are generated from.

---

## 24. Open Questions

1. Whether business-aware Directives/Validators (§13/§14 exception) should live inside each consuming Feature independently, or be consolidated into a single `libs/features/auth/presentation` export shared by all Features that need permission-gating UI — recommend the latter once a second Feature needs the same directive, to avoid duplicating the exception three times over.
2. Whether `libs/shared/testing` (generic test builders with zero business meaning, e.g., DOM-testing helpers) should exist alongside per-Business-lib `testing/` secondary entry points, or whether generic testing helpers belong in `tools/testing` instead — recommend `libs/shared/testing` for anything importable like ordinary Shared code, and `tools/testing` reserved for e2e/workspace-level harness configuration only.

---

## 25. Next Steps

This folder structure is ready to be validated against the first concrete feature slice once the RBAC / Authorization Model spec (recommended next) defines what actually populates `libs/business/auth`'s `models/`, `interfaces/`, `stores/`, and `services/` folders.
