# Implementation Backlog

**Project:** Enterprise Reporting Platform (dmsReports)
**Document type:** Implementation Backlog (Spec-Driven Development — Stage 4, derived from all approved specifications)
**Status:** Draft — pending approval
**Source specifications:** Product Vision · Software Architecture · Folder Structure · Engineering Standards · Routing Architecture · Authentication Architecture · Component Library · Dynamic Form Engine · Enterprise Data Table · Signal Store Architecture · API Framework · Enterprise Reporting Engine
**Date:** 2026-07-23

---

## 0. How to Read This Backlog

- **Hierarchy:** Epic → Feature → Story → Task → Subtask. IDs compose (`E4-F2-S1-T3-2` = Epic 4, Feature 2, Story 1, Task 3, Subtask 2).
- **Estimates:** Epics use T-shirt sizing (S/M/L/XL, in sprints). Stories use Fibonacci story points (1–13). Tasks and Subtasks use hours/days.
- **Independent implementability:** every Task (and Subtask, where present) names its own concrete deliverable and acceptance criterion — it can be picked up and completed without requiring another unfinished Task in the same Story to be done first, except where an explicit Dependency says otherwise.
- **Depth policy:** every Feature has fully enumerated Stories and Tasks. Subtask-level decomposition is given in full for foundational/high-complexity Tasks (workspace scaffolding, module boundaries, silent refresh, embedded JWT validation, table virtualization, form-schema compilation, pivot computation, generic repository) as a worked template — structurally repetitive Tasks (e.g., the 19 Shared components, the Enterprise Data Table's feature groups) follow the same decomposition shape, noted once per group rather than repeated verbatim for every item, to keep this document usable rather than mechanically bloated.
- **RBAC caveat:** the permission taxonomy itself (concrete permission keys, role→permission mappings) has no approved specification yet — every Story that depends on it is marked `⚠ blocked on RBAC taxonomy spec` and is otherwise fully plannable.

---

## 1. Epic Summary & Sequencing

| Epic | Title | Size | Priority | Depends on |
|---|---|---|---|---|
| E1 | Workspace & Engineering Foundations | L | P0 | — |
| E2 | Configuration & Theming | M | P0 | E1 |
| E3 | Core Cross-Cutting Infrastructure & API Framework | L | P0 | E1, E2 |
| E4 | Authentication & Session Management | L | P0 | E1, E3 |
| E5 | Routing & Shell Composition | M | P0 | E4 |
| E6 | Shared UI Component Library | XL | P0/P1 | E1, E2 |
| E7 | Dynamic Form Engine | L | P1 | E4, E6 |
| E8 | Enterprise Data Table | XL | P1 | E3, E6 |
| E9 | RBAC / Authorization Model | M | P0 | E4 (⚠ several stories blocked on taxonomy spec) |
| E10 | Enterprise Reporting Engine | XL | P2 | E5, E6, E7, E8, E9 |
| E11 | Notifications Platform | S | P1 | E3, E6 |

**Recommended sequencing:** E1 → E2 → E3 → E4 (with E9's `SessionContext`/guard stories interleaved) → E5 → E6 (parallelizable with E4/E5 once E1/E2 land) → E7/E8/E11 (parallelizable) → E10 last, since it composes everything else.

---

## 2. Epic 1 — Workspace & Engineering Foundations

*(Software Architecture Spec, Folder Structure Spec, Engineering Standards)*

### Feature E1-F1: Monorepo Workspace Scaffolding

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E1-F1-S1: Initialize workspace with `apps/shell-standalone` and `apps/shell-embedded` | 5 | — | Both apps build and serve independently; neither imports the other. |
| E1-F1-S2: Scaffold all `libs/*` per the Folder Structure Specification's directory tree | 8 | E1-F1-S1 | Every top-level lib (`core`, `shared`, `business/*`, `data/*`, `infrastructure/*`, `config/*`, `routing`, `features/*`) exists with a public barrel and a `testing/` secondary entry point. |

**Tasks — E1-F1-S1:**

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E1-F1-S1-T1: Create workspace root, choose Nx vs. Angular CLI multi-project tooling per ADR-0001 | 1d | — | Workspace builds; decision recorded as an accepted ADR update if it deviates from ADR-0001's draft. |
| E1-F1-S1-T2: Scaffold `apps/shell-standalone` | 4h | E1-F1-S1-T1 | `ng serve`-equivalent runs and renders an empty root route. |
| E1-F1-S1-T3: Scaffold `apps/shell-embedded` | 4h | E1-F1-S1-T1 | Serves independently on a separate port with an empty root route. |

**Subtasks — E1-F1-S1-T1** *(foundational — full decomposition given as the template for this document's depth policy):*
- E1-F1-S1-T1-1 (2h): Evaluate Nx vs. Angular CLI multi-project workspace against ADR-0001's stated decision criteria; document the concrete choice.
- E1-F1-S1-T1-2 (3h): Initialize the chosen tool's workspace config, TypeScript path aliases (`@dms/*`), and base `tsconfig`.
- E1-F1-S1-T1-3 (3h): Configure Prettier/ESLint base config per Engineering Standards §7 (import order/grouping rule enabled).

**Tasks — E1-F1-S2:** one task per top-level lib, each independently implementable:

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E1-F1-S2-T1: Scaffold `libs/core` (providers/, error-handling/, bootstrap/, stores/, tokens/, constants/, interceptors/) | 3h | E1-F1-S1-T1 | Empty lib builds; public barrel exports nothing yet but exists. |
| E1-F1-S2-T2: Scaffold `libs/shared` (ui/, layouts/, pipes/, directives/, validators/, utilities/, interfaces/, constants/, assets/, styles/, testing/) | 4h | E1-F1-S1-T1 | Lib builds; `libs/shared` has zero dependency on any other workspace lib, verified by a boundary-lint dry run. |
| E1-F1-S2-T3: Scaffold `libs/business/{auth,user,reports,dashboard,administration,notifications}` | 6h | E1-F1-S1-T1 | Each lib has its own `models/`, `interfaces/`, `stores/`, `services/`, `constants/`, `testing/` per Folder Structure Spec §6. |
| E1-F1-S2-T4: Scaffold `libs/data/{auth-data,reports-data,administration-data}` | 3h | E1-F1-S2-T3 | Each lib has `repositories/`, `dto/`, `mappers/`. |
| E1-F1-S2-T5: Scaffold `libs/infrastructure/{http,storage,jwt,embed-bridge,logging}` | 4h | E1-F1-S1-T1 | Each lib builds independently; none imports `libs/business` or `libs/data`. |
| E1-F1-S2-T6: Scaffold `libs/config/{environment,runtime-config,theming,feature-flags,mode-detection}` | 3h | E1-F1-S1-T1 | Each sub-lib has zero dependency on any other workspace lib (leaf layer). |
| E1-F1-S2-T7: Scaffold `libs/routing` (guards/, resolvers/) | 2h | E1-F1-S2-T3 | Builds; depends only on `libs/business`. |
| E1-F1-S2-T8: Scaffold `libs/features/{auth-login,dashboard,reports,administration}` | 4h | E1-F1-S2-T2, E1-F1-S2-T3, E1-F1-S2-T7 | Each Feature lib builds; `reports` is importable by both shell apps. |

### Feature E1-F2: Module Boundary Enforcement

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E1-F2-S1: Encode the Software Architecture Spec's dependency matrix (§7) as an automated lint rule | 8 | E1-F1-S2 | A deliberately-introduced violation (e.g., `libs/shared` importing `libs/business`) fails CI; a compliant import passes. |
| E1-F2-S2: Encode the Signal Store Spec's §3.3 named exception (App/Loader/Theme injectable from any layer except Shared) | 3 | E1-F2-S1 | Business/Feature/Presentation importing Core's three exception stores passes; Shared importing any of them fails. |

**Tasks — E1-F2-S1:**

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E1-F2-S1-T1: Choose and configure the boundary tool (Nx module-boundary tags or `eslint-plugin-boundaries`) | 1d | — | Tool runs in CI and locally via lint script. |
| E1-F2-S1-T2: Tag/configure every lib per its allowed/forbidden dependencies from Architecture Spec §7.1 | 1d | E1-F2-S1-T1 | Full matrix encoded; a test violation per forbidden edge is written and confirmed to fail. |
| E1-F2-S1-T3: Add a CI job that fails the build on any boundary violation | 2h | E1-F2-S1-T2 | CI red on violation, green otherwise. |

### Feature E1-F3: Engineering Standards Tooling

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E1-F3-S1: Enforce naming/suffix conventions (Engineering Standards §1) via lint | 5 | E1-F2-S1 | A file named against convention (e.g., a Business service not suffixed `.service.ts`) fails lint. |
| E1-F3-S2: Enforce component conventions (OnPush, `inject()`, Standalone) via lint | 5 | E1-F1-S2-T2 | A component missing `ChangeDetectionStrategy.OnPush` or using constructor injection fails lint. |
| E1-F3-S3: Set up commit-message linting (Conventional Commits) and PR template reflecting the Code Review Checklist (§16) | 3 | — | A non-conforming commit message is rejected by a commit hook; PR template renders the checklist. |

---

## 3. Epic 2 — Configuration & Theming

*(Software Architecture Spec §11, Folder Structure Spec §18/§21, Signal Store Spec §5.3)*

### Feature E2-F1: Environment & Runtime Configuration

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E2-F1-S1: Per-shell, per-target environment definitions | 3 | E1-F1-S2-T6 | `environment.<target>.ts` exists per shell/target; no secrets present. |
| E2-F1-S2: Runtime/tenant configuration loader | 5 | E2-F1-S1 | Loader resolves a tenant config object at bootstrap; schema-versioned per Software Architecture Spec §11 best practice. |

**Tasks — E2-F1-S2:**

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E2-F1-S2-T1: Define versioned runtime-config schema | 4h | — | Schema documented; a malformed config fails validation at load with a clear error, not a silent default. |
| E2-F1-S2-T2: Implement the loader against the schema | 1d | E2-F1-S2-T1 | Valid config loads; invalid config surfaces a startup error, not a partial app render. |

### Feature E2-F2: Mode Detection

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E2-F2-S1: Resolve Standalone vs. Embedded mode at bootstrap | 3 | E1-F1-S2-T6 | `App Store`'s `mode` Signal is correctly `standalone`/`embedded` per which shell bundle is running. |

### Feature E2-F3: Theming & Design Tokens

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E2-F3-S1: Define the design-token contract (CSS custom properties) consumed by Shared components | 5 | E1-F1-S2-T2 | Token names documented and applied to at least one Shared component (Button) with no hardcoded values. |
| E2-F3-S2: Implement Theme Store (Signal Store Spec §5.3) | 8 | E2-F3-S1, E2-F1-S2 | Changing `colorScheme`/`density`/tenant tokens updates `:root` CSS custom properties via an `effect()`; Shared components visually update with no DI dependency on the store. |
| E2-F3-S3: OS-level `prefers-color-scheme`/`prefers-reduced-motion` integration | 3 | E2-F3-S2 | `colorScheme: 'system'` follows OS changes live; motion is disabled under `prefers-reduced-motion: reduce`. |

### Feature E2-F4: Feature Flags

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E2-F4-S1: Feature-flag resolution service | 3 | E2-F1-S2 | A flag's value is readable synchronously after bootstrap; toggling a flag in config changes app behavior without a code change. |

---

## 4. Epic 3 — Core Cross-Cutting Infrastructure & API Framework

*(Signal Store Spec §5.1/§5.2, API Framework Spec — all sections)*

### Feature E3-F1: App Store & Bootstrap

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E3-F1-S1: Implement App Store (Signal Store Spec §5.1) | 5 | E2-F2-S1 | `mode`, `tenantId`, `isOnline`, `bootstrapStatus` Signals populate correctly at startup. |
| E3-F1-S2: Connectivity adapter (online/offline detection) | 3 | E1-F1-S2-T5 | `isOnline` flips correctly when the browser's connectivity changes (simulated in tests). |

### Feature E3-F2: Loader Store & Global Loading Indicator

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E3-F2-S1: Implement Loader Store (Signal Store Spec §5.2) | 5 | E1-F1-S2-T1 | `startTask`/`endTask`/`withLoading` correctly toggle `isGlobalLoading`; concurrent tasks tracked independently. |
| E3-F2-S2: Root-level global loading bar, mounted once per shell | 3 | E3-F2-S1, E2-F3-S2 | Loading bar renders at shell root only (not injected into arbitrary Feature components, per Signal Store Spec §3.3). |

### Feature E3-F3: Generic API Framework — REST Client & Interceptor Pipeline

*(API Framework Spec §3–§4)*

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E3-F3-S1: Implement the generic `RestClient` contract over Angular `HttpClient` | 5 | E1-F1-S2-T5 | `get`/`post`/`put`/`patch`/`delete` all resolve base URL from Configuration; no call site hardcodes a URL. |
| E3-F3-S2: Implement and register the full interceptor pipeline in the order defined in API Framework Spec §4 | 8 | E3-F3-S1 | A test asserting header/log order across all 9 pipeline stages passes; order is verifiable, not incidental. |

**Tasks — E3-F3-S2** *(one per interceptor, each independently implementable and testable in isolation):*

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E3-F3-S2-T1: `correlationIdInterceptor` | 4h | E3-F3-S1 | Every outgoing request carries a unique `X-Correlation-Id`; a retried request reuses the original ID with an attempt marker. |
| E3-F3-S2-T2: `tracingInterceptor` | 4h | E3-F3-S2-T1 | W3C `traceparent` header present and well-formed on every request. |
| E3-F3-S2-T3: `loggingInterceptor` | 4h | E3-F3-S2-T1 | Request/response logged with correlation ID, method, path, status, duration; no body/query-string content logged. |
| E3-F3-S2-T4: `cacheInterceptor` | 1d | E3-F3-S1 | A repeated identical GET within TTL short-circuits before dispatch; a mutating request is never cached. |
| E3-F3-S2-T5: `timeoutInterceptor` | 4h | E3-F3-S1 | A request exceeding its configured timeout aborts the underlying call (verified via a spy on the abort signal), not just a logical give-up. |
| E3-F3-S2-T6: `retryInterceptor` | 1d | E3-F3-S2-T5 | A simulated `503` on a GET retries with backoff up to the configured max; a `403` never retries; a plain POST without an idempotency key never retries. |

### Feature E3-F4: Upload, Download, Cancellation, Polling

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E3-F4-S1: File upload with progress Signal | 5 | E3-F3-S1 | `uploadProgress` Signal updates during a simulated multipart upload; cancellable mid-flight. |
| E3-F4-S2: File download with filename extraction | 3 | E3-F3-S1 | Filename derived from `Content-Disposition` when present; falls back to a caller-supplied default otherwise. |
| E3-F4-S3: Request cancellation contract | 5 | E3-F3-S1 | A cancelled request never surfaces as an `Error` in the typed error taxonomy; composable by component-destroy and by explicit supersede. |
| E3-F4-S4: Polling utility | 5 | E3-F4-S3 | Polling stops on destroy; backs off after consecutive failures; pauses when `document.visibilityState` is hidden. |

### Feature E3-F5: Error Mapping, Response Mapping, Generic Repository

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E3-F5-S1: Typed domain-error taxonomy + `errorNormalizationInterceptor` | 5 | E3-F3-S2 | Every HTTP status maps to exactly one documented typed error (API Framework Spec §5.9 table); cancellation is excluded from the taxonomy. |
| E3-F5-S2: Response-mapping stage (DTO → domain Model) | 3 | E3-F5-S1 | A malformed response produces a `MappingError`, never an uncaught exception. |
| E3-F5-S3: Generic Repository base (`getById`/`list`/`create`/`update`/`delete`) | 8 | E3-F5-S2 | `list()`'s request/response shape is verified compatible with the Enterprise Data Table's `DataRequest`/`DataResult` (E8) via a shared contract test. |
| E3-F5-S4: `HttpReportsRepository` composing Generic Repository | 5 | E3-F5-S3, E1-F1-S2-T4 | Implements `ReportsRepositoryPort`; passes the shared Port contract-test suite (Engineering Standards §15). |

---

## 5. Epic 4 — Authentication & Session Management

*(Authentication Architecture Spec — all sections; Signal Store Spec §4.1/§4.2/§4.3)*

### Feature E4-F1: Standalone Authentication

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F1-S1: Login flow (`auth-login` Feature + Auth Store) | 8 | E3-F3-S2, E1-F1-S2-T8 | Successful login sets `authStatus = authenticated`; access token held in memory only, never in `localStorage`. |
| E4-F1-S2: Silent refresh (proactive + reactive) | 8 | E4-F1-S1 | Proactive timer refreshes before expiry with no visible interruption; a simulated missed timer still recovers via the reactive 401 path. |
| E4-F1-S3: Session timeout (idle + absolute) | 5 | E4-F1-S1 | Idle countdown modal appears at the configured threshold; unacknowledged countdown logs the user out; absolute timeout cannot be extended by activity. |
| E4-F1-S4: Logout | 3 | E4-F1-S1 | Backend revoke called; in-memory state cleared; redirect to `/login`; cache cleared (API Framework Spec §5.5 security rule). |

**Tasks — E4-F1-S2** *(foundational — full decomposition):*

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F1-S2-T1: Proactive refresh timer scheduling | 1d | E4-F1-S1 | Timer fires at ~80% of token lifetime; reschedules after each successful refresh. |
| E4-F1-S2-T2: Single-flight refresh (dedupe concurrent 401s) | 1d | E4-F1-S2-T1 | A test firing 5 concurrent requests against an expired token results in exactly one refresh call. |
| E4-F1-S2-T3: Refresh failure → session expiry transition | 4h | E4-F1-S2-T2 | A rejected refresh transitions `authStatus` to `expired` and redirects to `/login`, never silently retries forever. |

**Subtasks — E4-F1-S2-T2:**
- E4-F1-S2-T2-1 (4h): Implement an in-flight-refresh promise/Signal guard shared across callers.
- E4-F1-S2-T2-2 (4h): Write the concurrency test asserting exactly one network call for N simultaneous 401s.

### Feature E4-F2: Embedded Authentication (Iframe Token)

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F2-S1: `postMessage` token delivery (embed-bridge) | 5 | E1-F1-S2-T5, E1-F1-S1-T3 | Token accepted only from an allow-listed origin; rejected otherwise with no partial state constructed. |
| E4-F2-S2: JWT validation pipeline | 8 | E4-F2-S1 | Structural check, algorithm allow-list, signature, `exp`/`iss`/`aud` all independently tested with both valid and invalid fixtures. |
| E4-F2-S3: Token refresh via host `postMessage` handshake | 5 | E4-F2-S2 | Near-expiry triggers a `token-refresh-request`; a timely host response updates `SessionContext` in place with no interruption; a late/absent response transitions to Unauthorized. |
| E4-F2-S4: Session termination (`session-terminate` message + natural expiry) | 3 | E4-F2-S2 | Either trigger clears `SessionContext` and transitions to Unauthorized. |

**Tasks — E4-F2-S2** *(foundational — full decomposition):*

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F2-S2-T1: Structural + algorithm allow-list check | 4h | E4-F2-S1 | A token with `alg: none` or an unlisted algorithm is rejected regardless of payload content. |
| E4-F2-S2-T2: Signature verification against per-tenant public key/JWKS | 1d | E4-F2-S2-T1 | Valid signature accepted; tampered payload rejected. |
| E4-F2-S2-T3: Claims validation (`exp`/`nbf`/`iss`/`aud` exact match, clock-skew tolerance) | 1d | E4-F2-S2-T2 | Expired, wrong-issuer, and wrong-audience fixtures all rejected; a token within clock-skew tolerance of expiry is accepted. |
| E4-F2-S2-T4: `SessionContext` derivation on success | 4h | E4-F2-S2-T3 | Claims map correctly to `SessionContext`'s roles/permissions/`reportScope` shape. |

### Feature E4-F3: Shared SessionContext & AuthorizationService

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F3-S1: `SessionContext` common shape | 3 | E4-F1-S1, E4-F2-S2 | Identical shape populated by both Standalone and Embedded paths, verified by a shared type-conformance test. |
| E4-F3-S2: `AuthorizationService.evaluate()` | 5 ⚠ blocked on RBAC taxonomy spec | E4-F3-S1, E9-F1-S1 | Given a `SessionContext` and a permission key, returns a deterministic allow/deny; identical result regardless of which shell produced the `SessionContext`. |

### Feature E4-F4: Functional Guards

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F4-S1: `authGuard` | 5 | E4-F1-S1 | Authenticated → allow immediately; unauthenticated → one silent-refresh attempt, then redirect to `/login` with `returnUrl`. |
| E4-F4-S2: `jwtGuard` | 5 | E4-F2-S2 | Validates once per embed instance; cached result invalidated only by a refresh or termination event, not re-run on every internal navigation. |
| E4-F4-S3: `roleGuard` | 5 | E4-F3-S2 | Identical behavior regardless of upstream guard; denies render Forbidden in place (no redirect loop). |

### Feature E4-F5: Auth-Related Interceptors

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F5-S1: `authTokenInterceptor` | 3 | E4-F3-S1, E3-F3-S1 | Attaches current token from `SessionContext`; never re-reads storage directly. |
| E4-F5-S2: `refreshOnUnauthorizedInterceptor` | 8 | E4-F1-S2, E4-F2-S3 | Standalone: 401 triggers refresh-and-retry-once. Embedded: 401 requests a fresh token from host, retries once, else surfaces Unauthorized. |

### Feature E4-F6: User Store & Permission Store

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E4-F6-S1: User Store implementation (Signal Store Spec §4.2) | 5 | E4-F1-S1, E3-F5-S3 | Profile fetch triggers reactively on `isAuthenticated → true`; Embedded mode short-circuits to claims-derived minimal profile. |
| E4-F6-S2: Permission Store implementation (Signal Store Spec §4.3) | 5 ⚠ blocked on RBAC taxonomy spec | E4-F3-S1 | `can()`/`canAny()`/`canAll()` correct against fixture permission sets; never persisted across reload. |

---

## 6. Epic 5 — Routing & Shell Composition

*(Routing Architecture Spec — all sections)*

### Feature E5-F1: Standalone Shell Routing

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E5-F1-S1: Full Standalone route table (Routing Spec §6.1) | 5 | E4-F4-S1, E4-F4-S3, E1-F1-S2-T8 | Every route in §6.1's table present with its exact guard chain; navigating to each renders the expected Feature. |
| E5-F1-S2: `redirectIfAuthenticatedGuard` for `/login` | 2 | E4-F4-S1 | An authenticated user visiting `/login` is redirected to `/dashboard`. |

### Feature E5-F2: Embedded Shell Routing

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E5-F2-S1: Full Embedded route table (Routing Spec §6.2) | 5 | E4-F4-S2, E4-F4-S3 | Route table contains only `/report/:reportId` + error routes; a structural test asserts `/login`/`/dashboard`/`/administration` are absent from the compiled route config, not merely unlinked. |

### Feature E5-F3: Error Routes

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E5-F3-S1: Shared, variant-parameterized error component (404/500/Unauthorized/Forbidden) | 5 | E1-F1-S2-T2 | One component, four visually/textually distinct variants; no business logic inside it. |
| E5-F3-S2: Wire error routes + Core global error handler → `/error` (500) | 5 | E5-F3-S1, E3-F2-S1 | An unhandled exception navigates to `/error`; a 404 renders without a redirect loop; a Forbidden renders in place per Routing Spec §4. |

---

## 7. Epic 6 — Shared UI Component Library

*(Component Library Spec — all 19 components + shared conventions §1.2/§1.3)*

### Feature E6-F1: Form Control Contract & Conventions

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E6-F1-S1: Implement the shared Form Control Contract | 5 | E1-F1-S2-T2 | A conformance test suite exists that any of the six form components (§6.2) can be run against. |

### Feature E6-F2: Form Controls

*(Buttons, Inputs, Select, Autocomplete, Checkbox, Radio, Toggle — each Story follows the identical shape: implement per its Component Library section, with Tasks for structure/inputs-outputs, accessibility, theming, and a conformance test against E6-F1-S1 where applicable.)*

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E6-F2-S1: Buttons | 5 | E2-F3-S1 | All variants/sizes render per Component Library §2; `ariaLabel` enforced for icon-only usage. |
| E6-F2-S2: Inputs | 5 | E6-F1-S1 | Form Control Contract conformance passes; error slot wired to `aria-describedby`. |
| E6-F2-S3: Select | 8 | E6-F1-S1 | ARIA combobox/listbox pattern verified with a keyboard-navigation test; virtual scroll engages above threshold. |
| E6-F2-S4: Autocomplete | 8 | E6-F2-S3 | Debounce/cancel-on-supersede verified; `aria-live` result-count announcement fires. |
| E6-F2-S5: Checkbox | 3 | E6-F1-S1 | Tri-state (`indeterminate`) works; label always programmatically associated. |
| E6-F2-S6: Radio | 3 | E6-F1-S1 | Roving-tabindex keyboard navigation verified. |
| E6-F2-S7: Toggle | 3 | E6-F1-S1 | `role="switch"` distinct from Checkbox's `role="checkbox"`, verified by an a11y test. |

**Tasks — E6-F2-S1 (template applied identically to E6-F2-S2 through S7):**

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E6-F2-S1-T1: Structure, Inputs/Outputs, Signals | 4h | — | Matches Component Library §2's table exactly. |
| E6-F2-S1-T2: Accessibility (ARIA roles/keyboard) | 4h | E6-F2-S1-T1 | Automated ARIA-attribute assertions pass. |
| E6-F2-S1-T3: Theming (design-token-only styling) | 3h | E6-F2-S1-T1, E2-F3-S1 | Zero hardcoded color/spacing values, verified by a lint rule scanning component SCSS. |
| E6-F2-S1-T4: Variants + unit/interaction tests | 4h | E6-F2-S1-T1..T3 | All documented variants covered by a test case each. |

### Feature E6-F3: Navigation & Layout Components

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E6-F3-S1: Tabs | 8 | E2-F3-S1 | ARIA tablist pattern + manual/automatic activation modes both verified. |
| E6-F3-S2: Accordion | 5 | E2-F3-S1 | Single/multi-expand modes; collapsed panel content removed from render tree by default. |
| E6-F3-S3: Cards | 5 | E2-F3-S1 | Clickable vs. static cards have correct/absent ARIA roles respectively (§11's anti-pattern check). |
| E6-F3-S4: Breadcrumb | 3 | E2-F3-S1 | Collapse-to-overflow-menu behavior above `maxVisible`. |
| E6-F3-S5: Pagination | 5 | E2-F3-S1 | `currentPage` clamps to `[1, totalPages]`, correction observable via output. |

*(Each Story's Tasks follow the E6-F2-S1 template: structure/Signals, accessibility, theming, variants+tests.)*

### Feature E6-F4: Overlay & Feedback Components

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E6-F4-S1: Dialogs | 8 | E2-F3-S1 | Focus trapped while open; focus restored to trigger on close; `Escape`/backdrop dismissal configurable. |
| E6-F4-S2: Snackbars | 5 | E2-F3-S1 | Auto-dismiss timer pauses on hover/focus; `alert` vs. `status` role by variant. |
| E6-F4-S3: Notifications (component only — Store is E11) | 5 | E6-F4-S2 | Unread state conveyed both visually and via accessible text, never color alone. |
| E6-F4-S4: Loader | 3 | E2-F3-S1 | `label` mandatory when no adjacent visible text explains the loading context. |
| E6-F4-S5: Skeleton | 3 | E2-F3-S1 | Shimmer disabled under `prefers-reduced-motion: reduce`; container owns the single `aria-live` announcement. |

### Feature E6-F5: Data Visualization Components

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E6-F5-S1: Charts (bar/line/pie/area/donut contract) | 13 | E2-F3-S1 | Accessible data-table fallback rendered alongside every chart type; colors sourced only from the token palette. |
| E6-F5-S2: Tables (base, non-Enterprise version per Component Library §20) | 13 | E6-F2-S3 (Select, for page-size selector) | Virtual scrolling engages above threshold; ARIA-grid roles present even when virtualized. *(Superseded in scope by Epic 8 — this story delivers the Component Library's baseline; Epic 8 extends it.)* |

---

## 8. Epic 7 — Dynamic Form Engine

*(Dynamic Form Engine Spec — all sections)*

### Feature E7-F1: Schema Compiler & Core Engine

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E7-F1-S1: JSON schema parser/validator (schemaVersion compatibility check) | 5 | E1-F1-S2-T3 | Malformed or unsupported-version schema rejected at compile time with a clear error, never a silent partial render. |
| E7-F1-S2: Schema compilation → Typed/Reactive Form tree | 8 | E7-F1-S1 | Nested Groups and Form Arrays (§4.2) both compile correctly, verified against fixture schemas. |
| E7-F1-S3: `FormEngineStore` (Signal Store per Dynamic Form Engine §5) | 8 | E7-F1-S2 | `values`/`errors`/`visibility`/`effectiveReadonly`/`isValid` Signals all update correctly against a fixture form. |

**Tasks — E7-F1-S2** *(foundational — full decomposition):*

| Task | Est | Depends on | Acceptance Criteria |
|---|---|---|---|
| E7-F1-S2-T1: Leaf field compilation (text/number/select/etc.) | 1d | E7-F1-S1 | Each field type in §4.3's catalog compiles to its corresponding control. |
| E7-F1-S2-T2: Group (nested) field compilation | 4h | E7-F1-S2-T1 | Arbitrary nesting depth compiles correctly. |
| E7-F1-S2-T3: Array (repeating) field compilation | 1d | E7-F1-S2-T2 | `minItems`/`maxItems` enforced; add/remove produce correctly-scoped child controls. |

### Feature E7-F2: Conditional Visibility & Permission Resolution

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E7-F2-S1: Condition expression evaluator (`field`/`all`/`any`/`not`, path scoping) | 8 | E7-F1-S3 | `$root.` scoping resolves correctly from within a nested array item; dependency-tracked recompute verified (unrelated field change doesn't trigger re-evaluation). |
| E7-F2-S2: Permission resolution (merges `AuthorizationService` into effective schema) | 5 ⚠ blocked on RBAC taxonomy spec | E7-F2-S1, E4-F3-S2 | `permission.view` failure fully hides a field (not merely disables); `permission.edit` failure renders read-only. |
| E7-F2-S3: Readonly/validation exclusion rule | 3 | E7-F2-S2 | A non-editable field's stored value is excluded from validity computation, per Dynamic Form Engine §8's critical rule. |

### Feature E7-F3: Validators

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E7-F3-S1: Sync validator library (required/pattern/min/max/etc.) | 5 | E7-F1-S2 | Each documented validator type covered by a passing/failing fixture pair. |
| E7-F3-S2: Async validators (debounce, cancel-on-supersede) | 5 | E3-F4-S3 | New keystroke cancels an in-flight async validation; pending state exposed as a Signal. |
| E7-F3-S3: Cross-field validators (group-scoped, dependency-tracked) | 5 | E7-F2-S1 | A `dateRange` validator only re-runs when `startDate`/`endDate` change, never on unrelated field changes. |

### Feature E7-F4: Layout Strategies

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E7-F4-S1: Accordion form layout | 5 | E7-F1-S3, E6-F3-S2 | Each top-level group renders as one Accordion panel; cross-panel cross-field validators still function. |
| E7-F4-S2: Wizard form layout | 8 | E7-F1-S3, E6-F3-S1 | Forward navigation blocked until current step's fields are valid; step-level `visibility` skips a step entirely; lazy step construction verified (unvisited step's controls not built upfront). |

### Feature E7-F5: API-Driven Dropdowns

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E7-F5-S1: Generic `DynamicOptionsPort` + default implementation | 5 | E3-F5-S3 | `endpointKey` resolves to an actual call without the schema knowing a raw URL. |
| E7-F5-S2: Cascading/dependent dropdowns (`dependsOn`) | 5 | E7-F5-S1 | Changing the depended-on field re-fetches, cancels a stale in-flight fetch, and clears/disables the dependent field when its dependency is empty. |

---

## 9. Epic 8 — Enterprise Data Table

*(Enterprise Data Table Spec — all sections; supersedes E6-F5-S2's baseline)*

### Feature E8-F1: Column Model & Table View Persistence

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F1-S1: `ColumnDefinition` model + dynamic column-set reconciliation | 5 | E6-F5-S2 | Changing the column set at runtime key-matches persisted overrides; unknown new columns get a sensible default position. |
| E8-F1-S2: Hide/Show columns (Column Settings panel) | 5 | E8-F1-S1, E6-F4-S1 (Dialog) | Toggling visibility updates render immediately; "Reset to Default" restores base config. |
| E8-F1-S3: `TableView` persistence (full config, not columns alone) | 8 | E8-F1-S2, E3-F5-S3 | Switching a saved View is one atomic state transition (no flash of inconsistent intermediate render), verified by a rendering-order test. |
| E8-F1-S4: Column reordering (drag + keyboard-accessible equivalent) | 8 | E8-F1-S1 | Both interaction paths produce an identical resulting order; ARIA announcement fires. |
| E8-F1-S5: Column resize (drag + keyboard-accessible equivalent) | 5 | E8-F1-S1 | Resize preview uses a transform, not a full re-render, verified by a render-count assertion during drag. |
| E8-F1-S6: Sticky header + pinned/sticky columns (unified, §7.1) | 5 | E8-F1-S1 | Header remains visible on vertical scroll; pinned column remains visible on horizontal scroll; implemented as one mechanism, not two. |

### Feature E8-F2: Data Operations

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F2-S1: `DataSourcePort` (client in-memory + server-backed implementations) | 8 | E3-F5-S3 | Both implementations pass one shared contract-test suite. |
| E8-F2-S2: Pagination (discrete) + rows-per-page | 5 | E8-F2-S1, E6-F3-S5 (Pagination) | Page-size selection persists as part of the active `TableView`. |
| E8-F2-S3: Sorting + multi-sort | 5 | E8-F2-S1 | Sort state is always an ordered array; Shift+click appends a numbered secondary sort. |
| E8-F2-S4: Column filters + Global Search | 8 | E8-F2-S1 | Debounced search; per-column filter types (text/select/date-range/number-range) all function. |
| E8-F2-S5: Advanced Search (Dynamic Form Engine reuse) | 5 | E7-F1-S3, E8-F2-S4 | Advanced Search panel renders a Dynamic Form Engine schema; produces the same filter shape as column filters. |

### Feature E8-F3: Hierarchical & Grouped Data

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F3-S1: `RowModel` abstraction (flat/grouped/tree) | 8 | E8-F2-S1 | All three modes render correctly against fixture data. |
| E8-F3-S2: Grouping + aggregate group-header rows | 8 | E8-F3-S1, E10-F7-S1 (shared Aggregation contract) | Group expand/collapse independent per group; server-mode grouping passed through `DataSourcePort`. |
| E8-F3-S3: Tree data + lazy child-loading | 8 | E8-F3-S1 | Children fetched only on first expand for server-backed trees. |
| E8-F3-S4: Row Expansion mechanic (Expandable Rows / Master-Detail) | 5 | E8-F3-S1 | One mechanic serves both use cases; Feature-projected detail template renders correctly. |

### Feature E8-F4: Selection

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F4-S1: Row selection (single/multiple) | 5 | E8-F2-S1, E6-F2-S5 (Checkbox) | Keyboard (Space/Shift+Arrow) selection fully functional. |
| E8-F4-S2: Bulk "select all matching filter" banner + exclusion-set model | 8 | E8-F4-S1 | Selecting all-on-page under server pagination surfaces the banner; "select all matching" never materializes every row ID client-side. |
| E8-F4-S3: Pinned rows | 5 | E8-F3-S1 | Pinned rows render in a non-virtualized band, independent of sort/scroll. |

### Feature E8-F5: Toolbar & Export

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F5-S1: Toolbar slot contract | 5 | E8-F1-S2 | Title/search/advanced-search/column-settings/View-switcher/custom-actions/export-menu all independently projectable. |
| E8-F5-S2: `ExportPort` + CSV/Excel/PDF export | 8 | E3-F5-S1 | Scope selection (page/full-result/selection) all function; large-scope export delegates to a backend-generated file per A3. |
| E8-F5-S3: Print mode (DOM-expansion out of virtualization) | 5 | E8-F5-S1 | Printed output includes rows beyond the currently-virtualized window. |

### Feature E8-F6: Virtualization & Responsive Rendering

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F6-S1: Row virtualization | 8 | E8-F2-S1 | Only visible window + buffer mounted, verified by a DOM-node-count assertion against a 10k-row fixture. |
| E8-F6-S2: Column virtualization | 8 | E8-F6-S1 | Pinned columns exempted; only near-viewport columns mounted for a wide-column fixture. |
| E8-F6-S3: Responsive "pop-in" layout | 8 | E8-F1-S1 | Below the configured breakpoint, lower-`responsivePriority` columns collapse into a stacked list; `ResizeObserver`-driven, not window-resize-driven. |

**Subtasks — E8-F6-S1** *(foundational — full decomposition):*
- E8-F6-S1-1 (1d): Viewport-window calculation + buffer sizing.
- E8-F6-S1-2 (1d): Recycled row/cell view-instance pooling (ties to Memory Optimization, §14).
- E8-F6-S1-3 (4h): ARIA `aria-rowindex`/`aria-colindex` correctness under virtualization.
- E8-F6-S1-4 (4h): Benchmark test against a 50k–100k-row synthetic dataset (Testing Strategy §15).

### Feature E8-F7: State, Loading & Error UX

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F7-S1: Skeleton loading (initial) vs. Loading Overlay (subsequent) | 5 | E6-F4-S5, E8-F2-S1 | Initial load shows column-matched skeleton rows; a re-sort of already-visible data shows an overlay, preserving scroll position. |
| E8-F7-S2: Retry (re-issues exact last request) | 3 | E8-F2-S1 | Retry re-sends identical page/sort/filter/search/group parameters. |
| E8-F7-S3: Error / Empty / Offline — three distinct states | 5 | E5-F3-S1 | Each renders a visually/textually distinct illustrated state; Empty is never conflated with Error. |

### Feature E8-F8: Keyboard Navigation & Accessibility

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E8-F8-S1: Full ARIA-grid keyboard pattern | 8 | E8-F6-S1 | Roving tabindex, Home/End/PageUp/PageDown/Ctrl+Home/Ctrl+End all verified by an automated keyboard-interaction test. |
| E8-F8-S2: Accessibility regression test suite | 5 | E8-F8-S1 | Automated ARIA role/attribute assertions run in CI for every subsequent Table change. |

---

## 10. Epic 9 — RBAC / Authorization Model

*(Referenced throughout Epics 4/7/8/10 as a placeholder dependency — no approved taxonomy spec exists yet.)*

### Feature E9-F1: Permission Taxonomy

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E9-F1-S1: Author and approve the RBAC / Authorization Model specification | — (spec, not implementation) | — | Spec approved through the same SDD process as all prior documents in this backlog's source list. **Blocks:** E4-F3-S2, E4-F6-S2, E7-F2-S2, and all E10 stories marked ⚠. |
| E9-F1-S2: Concrete permission-key catalog + role→permission default mapping | 5 | E9-F1-S1 | Every permission key referenced illustratively elsewhere in this backlog (`reports:filter:view`, `admin:*`, etc.) has a real, documented definition. |

### Feature E9-F2: RBAC Administration

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E9-F2-S1: Role/permission administration UI (Administration Feature) | 8 | E9-F1-S2, E7-F1-S3 | An administrator can view/edit role→permission mappings; changes take effect on next `refreshPermissions()` without requiring re-login. |

---

## 11. Epic 10 — Enterprise Reporting Engine

*(Enterprise Reporting Engine Spec — all sections; composes Epics 4–9)*

### Feature E10-F1: Dashboard Composition & Widgets

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F1-S1: `Widget` model + `DashboardStore` extension | 5 | E4-F6 (Dashboard Store base, Signal Store Spec) | Widget grid layout persists per-user; each widget type (`card`/`chart`/`table`/`pivot`) resolves to its component. |
| E10-F1-S2: Viewport-driven lazy widget loading | 5 | E10-F1-S1 | A widget below the fold does not fetch data until scrolled into view. |
| E10-F1-S3: Auto-refresh per widget | 3 | E10-F1-S1, E3-F4-S4 (Polling) | Interval cleared on destroy; respects tab-visibility pause. |

### Feature E10-F2: Filters — Global Cascade & Local Scope

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F2-S1: Dashboard-level Filter Bar (dynamic field union across widgets) | 8 | E7-F1-S3, E10-F1-S1 | Filter Bar's available fields derive from the union of currently-visible widgets' filterable fields, not a fixed list. |
| E10-F2-S2: Global-to-widget filter cascade | 5 | E10-F2-S1 | A global filter applies only to widgets whose data binding declares a matching field; non-matching widgets unaffected. |

### Feature E10-F3: Drill Down & Drill Through

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F3-S1: `DrillContext` breadcrumb stack (Drill Down) | 5 | E6-F5-S1 (Charts) | Clicking a chart segment re-renders the same widget at a more detailed level; breadcrumb allows returning to a prior level. |
| E10-F3-S2: Drill Through navigation + parameter mapping | 8 | E10-F3-S1, E4-F4-S3 (roleGuard) | Navigates to a different `reportId` via the Router (not an in-app shortcut); target report's permission is independently re-checked, verified by a test using a user authorized for the source but not the target. |

### Feature E10-F4: Saved Reports, Bookmarks, Favorites

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F4-S1: `SavedReportsRepositoryPort` + Save Report UI | 8 | E3-F5-S3, E7-F1-S3 | Saving produces a new, independently addressable entity; editing it never mutates the original report definition. |
| E10-F4-S2: `BookmarksRepositoryPort` + Bookmark capture/restore | 5 | E3-F5-S3 | Restoring a bookmark reproduces the exact filter/sort/drill state at capture time. |
| E10-F4-S3: Favorites (flag on User Store preferences) | 3 | E4-F6-S1 (User Store) | Toggling a favorite persists via the User preferences port; no configuration snapshot is created. |

### Feature E10-F5: Scheduled Reports

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F5-S1: `ScheduleDefinition` authoring form (Dynamic Form Engine) | 5 | E7-F1-S3, E3-F5-S3 | Schedule creation/edit persists via `SchedulesRepositoryPort`; frontend never simulates execution. |
| E10-F5-S2: Schedule list + run-history display | 5 | E10-F5-S1 | Run history (last run, status, delivered-to count) rendered from backend-reported data only. |

### Feature E10-F6: Share Links & Embedding

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F6-S1: `ShareLinksRepositoryPort` (`create`/`revoke`/`resolve`) | 8 | E3-F5-S3, E4-F3-S1 | A generated link resolves to a scoped access grant; revocation immediately invalidates it. |
| E10-F6-S2: Privilege-escalation prevention (scope = intersection at resolution time) | 8 | E10-F6-S1 | Test: sharer's permission is reduced after link creation → link's effective access reduces accordingly on next resolution, not just at creation time. |
| E10-F6-S3: Confirm Embedded Report Viewer is identical to Standalone/Dashboard Report Viewer (no separate code path) | 3 | E5-F2-S1, E10-F1-S1 | A structural test asserts both mounts resolve to the same component/module. |

### Feature E10-F7: Pivot Table & Aggregations

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F7-S1: Shared `AggregationFunction` contract (sum/avg/count/countDistinct/min/max) | 5 | — | Used identically by both Table grouping (E8-F3-S2) and Pivot value fields (below) — a shared unit-test suite runs against both consumers. |
| E10-F7-S2: Pivot computation engine (row/column/value field cross-tabulation) | 13 | E10-F7-S1 | Data-derived column headers computed correctly from fixture data; memoized against its own input signature. |
| E10-F7-S3: Pivot Table rendering component | 8 | E10-F7-S2, E8-F6-S1 (virtualization internals reused) | Reuses Table's virtualization/cell-rendering conceptually; renders a correct 2D matrix. |
| E10-F7-S4: Interactive field drag-and-drop + keyboard-accessible equivalent | 8 | E10-F7-S3, E8-F1-S4 (keyboard-accessible reorder precedent) | Both interaction paths reconfigure row/column/value assignment identically. |
| E10-F7-S5: Server-side pivot delegation above distinct-combination threshold | 5 | E10-F7-S2, E8-F2-S1 | Above the configured threshold, computation delegates to a backend aggregation query rather than computing client-side. |

### Feature E10-F8: Export & Print (Dashboard-Level)

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E10-F8-S1: Dashboard snapshot mode (temporarily disables lazy loading for export/print) | 8 | E10-F1-S2, E8-F5-S2 | All widgets render in full during the snapshot; normal lazy/virtualized rendering resumes immediately after. |
| E10-F8-S2: Combined multi-widget export document assembly | 8 | E10-F8-S1 | One combined PDF/print output contains every widget's own rendered export in dashboard order. |

---

## 12. Epic 11 — Notifications Platform

*(Signal Store Spec §4.6; Component Library §13/§14)*

### Feature E11-F1: Toast/Snackbar Queue

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E11-F1-S1: Notification Store — ephemeral toast half | 5 | E6-F4-S2 (Snackbar component), E1-F1-S2-T3 | `showToast()`/`dismissToast()` function correctly; queue ordering verified; auto-dismiss timer pauses on hover/focus. |

### Feature E11-F2: Persistent Notification Center

| Story | Points | Depends on | Acceptance Criteria |
|---|---|---|---|
| E11-F2-S1: `NotificationsRepositoryPort` + backend sync | 8 | E3-F5-S3 | Fetch/mark-read/mark-all-read all persist server-side. |
| E11-F2-S2: Notification Center UI (dropdown + full-page variants) | 5 | E11-F2-S1, E6-F4-S3 | Same underlying list renderer serves both presentation variants. |

---

## 13. Cross-Epic Traceability Notes

- Every Story in **E10** (Reporting Engine) depends on at least one Story in **E6, E7, E8**, confirming the Reporting Engine spec's own framing as an assembly rather than new architecture.
- Stories marked **⚠ blocked on RBAC taxonomy spec** (E4-F3-S2, E4-F6-S2, E7-F2-S2, E9-F1-S1/S2, and transitively several E10 stories) are otherwise fully plannable and estimable now — only their final acceptance testing needs the concrete permission catalog.
- The Generic Repository (E3-F5-S3) is a hard dependency for every Data-layer repository across E4, E10, and E11 — recommend prioritizing it immediately after the interceptor pipeline (E3-F3-S2).

---

## 14. Next Steps

This backlog is ready for sprint planning. Recommended first two sprints: **E1 (Workspace & Engineering Foundations)** in full, followed immediately by **E9-F1-S1** (finally authoring the RBAC taxonomy spec) in parallel with **E2/E3**, since so much of E4/E7/E8/E10 is otherwise blocked waiting on it.
