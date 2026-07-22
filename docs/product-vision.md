# Product Vision Document

**Project:** Enterprise Reporting Platform (dmsReports)
**Document type:** Product Vision (Spec-Driven Development — Stage 0)
**Status:** Draft — pending approval
**Author:** Principal Frontend Architecture (with stakeholder input)
**Date:** 2026-07-22

---

## 1. Vision

Build a single Angular 20 codebase that delivers enterprise-grade reporting capability through **two distinct consumption modes** without duplicating business logic, UI primitives, or data access code:

1. **Standalone Application** — a fully-featured, self-contained reporting portal with authentication, navigation, dashboards, report catalog, and administration, used directly by end users and administrators.
2. **Embedded Application** — a lightweight, headless report surface that a host application loads inside an `<iframe>`, authenticated via a signed JWT passed in from the host, exposing only the report itself with no chrome, no login, and no navigation.

The platform is architected from day one as a **reusable product**, not a single application — it must be white-label-ready so that multiple enterprise brands/tenants can consume it under their own visual identity and domain without forking the codebase.

The unifying idea: **one core (reporting engine, data layer, design system, RBAC model)**, two **shells** (Standalone Shell, Embedded Shell) that compose it differently, and an **N**th white-label theme layer that customizes it visually per tenant.

---

## 2. Goals

| # | Goal |
|---|------|
| G1 | Deliver a single deployable Angular application that serves both Standalone and Embedded modes from one build artifact (or a shared library consumed by two thin shells), avoiding logic duplication. |
| G2 | Provide secure, mode-appropriate authentication: full login/session flow for Standalone; signed-JWT hand-off (no credential UI) for Embedded. |
| G3 | Provide Role Based Access Control (RBAC) that gates navigation, reports, and administration features consistently across both modes. |
| G4 | Ship a reporting core (report rendering, filtering, export, data binding) that is mode-agnostic — the same report component renders identically whether reached via dashboard navigation or direct embed deep-link. |
| G5 | Design the UI/theming layer so that a new enterprise tenant can be white-labeled (branding, colors, logo, domain) via configuration, not code changes. |
| G6 | Establish architecture (Standalone Components, Signals, functional guards/interceptors, `inject()`) that scales to additional future shells (e.g., mobile web, desktop wrapper) without rework. |
| G7 | Keep the Embedded mode's attack surface and payload minimal (fast load, no unused login/dashboard code shipped to the iframe context where technically feasible). |
| G8 | Make every architectural decision traceable via ADRs so future teams building on this platform understand *why*, not just *what*. |

---

## 3. Non-Goals

Explicitly out of scope for this vision (may be revisited in dedicated future specs, but are not assumed or designed for now):

| # | Non-Goal | Rationale |
|---|----------|-----------|
| NG1 | Multi-tenant SaaS billing / subscription management | This is a platform capability question, not a reporting-UI concern; belongs to a separate commercial system. |
| NG2 | Native mobile applications (iOS/Android) | Web-first (including embedded web) only in this phase. |
| NG3 | Report *authoring*/design tooling (drag-drop report builder) | This vision covers report *consumption* (viewing, filtering, exporting existing reports), not report creation tooling. |
| NG4 | Offline-first / disconnected operation | Assumes online connectivity to backend APIs at all times. |
| NG5 | Full white-label implementation (tenant onboarding pipeline, per-tenant infra provisioning) | Only the *extensibility seams* (theming, config-driven branding) are in scope now; the operational white-label rollout process is a future initiative. |
| NG6 | Cross-origin embedding without a host-issued JWT (e.g., public/anonymous embeds) | Embedded mode assumes a trusted host application performs its own auth and issues the signed JWT. |
| NG7 | Backend/API design and data pipeline architecture | This vision is scoped to the frontend platform; backend contracts are a dependency, not a deliverable here. |

---

## 4. User Personas

| Persona | Mode(s) | Description | Key Needs |
|---|---|---|---|
| **P1 — Business User (Report Viewer)** | Standalone | An operational/business staff member who logs in daily to view dashboards and run reports relevant to their role. | Fast login, clear navigation, relevant reports surfaced by role, easy filtering/export. |
| **P2 — Report Administrator** | Standalone | Manages report catalog, user-role-report mappings, and platform configuration for their organization. | Robust admin UI, RBAC management, audit visibility, safe bulk operations. |
| **P3 — Platform/Tenant Administrator** | Standalone | Enterprise IT admin responsible for provisioning the platform for their organization, incl. branding and SSO configuration. | White-label config, integration setup, security controls. |
| **P4 — Host Application End User** | Embedded | A user of a *third-party host product* (e.g., a CRM, ERP, or internal portal) who sees a single report embedded inline within that host's UI. Typically unaware they're using "our" platform. | Instant, seamless report rendering with zero extra login friction, visually consistent with the host page. |
| **P5 — Host Application Developer/Integrator** | Embedded | Engineer at the partner/host company responsible for embedding the iframe and issuing signed JWTs from their own backend. | Clear JWT contract, predictable iframe sizing/behavior, minimal integration surface, good error signaling. |
| **P6 — Platform Engineering Team (us)** | Both | The team building and evolving this platform across many enterprise consumers. | Reusable architecture, low duplication, clear extension points for new tenants/shells. |

---

## 5. Functional Requirements

### 5.1 Mode 1 — Standalone Application

| ID | Requirement |
|---|---|
| FR-1.1 | System shall present a Login screen for unauthenticated users attempting to access the Standalone shell. |
| FR-1.2 | System shall authenticate users against an identity provider (exact protocol — OIDC/SAML/credentials — to be determined in the Authentication spec) and establish an authenticated session. |
| FR-1.3 | System shall present a Dashboard as the authenticated landing experience, summarizing/surfacing reports relevant to the user's role. |
| FR-1.4 | System shall provide a Reports section where users can browse, search, open, filter, and export reports they are authorized to view. |
| FR-1.5 | System shall provide an Administration section for managing users, roles, report-to-role mappings, and (future) tenant/white-label configuration, visible only to authorized administrator roles. |
| FR-1.6 | System shall enforce Role Based Access Control on navigation (menu items hidden/disabled per role), on routes (guarded), and on data (report-level and, where applicable, row/field-level access). |
| FR-1.7 | System shall provide session management: token refresh, idle/expiry handling, and logout. |
| FR-1.8 | System shall provide full navigational chrome (header, nav menu, breadcrumbs as applicable) appropriate to a standalone portal. |

### 5.2 Mode 2 — Embedded Application

| ID | Requirement |
|---|---|
| FR-2.1 | System shall be loadable inside an `<iframe>` hosted by a third-party parent application. |
| FR-2.2 | System shall authenticate solely via a signed JWT supplied by the host (e.g., via URL parameter, `postMessage`, or iframe bootstrap config — exact transport to be determined in the Authentication spec), with no interactive login form rendered. |
| FR-2.3 | System shall validate the signed JWT (signature, expiry, audience/issuer as applicable) before rendering any report content, and shall fail closed (show an error state, not a login form) if validation fails. |
| FR-2.4 | System shall provide direct access to a specific report (deep link) as the sole rendered content — no dashboard, no report catalog/browse UI. |
| FR-2.5 | System shall render with no navigation chrome: no header, no side nav, no breadcrumbs, no app-level menu — only the report viewport and its own intrinsic controls (e.g., filters/export tied to that report, if applicable). |
| FR-2.6 | System shall derive the user's report-level authorization from claims embedded in the JWT (role/permissions), enforcing the same RBAC rules as Standalone mode against a shared authorization model. |
| FR-2.7 | System shall communicate its rendered size/state to the host where necessary for iframe layout (e.g., via `postMessage` resize events), without assuming the host provides any UI beyond the iframe container. |

### 5.3 Cross-Cutting / Platform

| ID | Requirement |
|---|---|
| FR-3.1 | Both modes shall share a single reporting rendering engine/component so a report behaves identically regardless of entry mode. |
| FR-3.2 | Both modes shall share a single RBAC/authorization model so permission logic is defined once and consumed by both shells. |
| FR-3.3 | System shall support runtime, configuration-driven theming (logo, color palette, typography tokens, app name) to enable white-label deployments without code changes. |
| FR-3.4 | System shall determine its operating mode (Standalone vs Embedded) at bootstrap (e.g., via route, host detection, or explicit bootstrap parameter) and load only the code/UI relevant to that mode. |
| FR-3.5 | System shall expose a documented contract (JWT claim shape, iframe bootstrap parameters) for host integrators (P5) to build against. |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | JWT signature verification, short-lived tokens, no sensitive data persisted in `localStorage` for embedded sessions beyond what's necessary; standalone session tokens handled per OWASP session management guidance; strict `X-Frame-Options`/`Content-Security-Policy` `frame-ancestors` allow-listing so only authorized hosts can embed. |
| **Performance** | Embedded mode initial render (first meaningful report paint) shall be materially faster/lighter than Standalone mode (target defined in a later performance spec) since it skips auth UI, dashboard, and nav bootstrap. Standalone dashboard shall meet standard enterprise SPA load-time expectations. |
| **Scalability** | Architecture shall support adding new report types, new tenants (white-label), and new roles without structural rework — additive configuration, not branching logic. |
| **Maintainability** | Single core codebase; mode-specific behavior isolated to thin shell layers; adheres to SOLID/DRY/Clean Architecture per project conventions. |
| **Accessibility** | Both modes shall meet WCAG 2.1 AA at minimum, including within the constrained embedded iframe context. |
| **Browser/Iframe Compatibility** | Embedded mode shall function correctly under common third-party-cookie-restricted browser environments (Safari ITP, Chrome third-party cookie deprecation) — auth via JWT (not cookies) is a deliberate mitigation. |
| **Internationalization** | UI text architecture shall not preclude future i18n (not necessarily implemented now, but not architecturally blocked). |
| **Observability** | Both modes shall support error/usage telemetry hooks (exact tooling TBD) sufficient to diagnose embedded integration issues reported by host integrators (P5). |
| **Configurability** | White-label theming and mode detection shall be driven by configuration/environment, not compile-time forks of the codebase. |

---

## 7. Success Criteria

| # | Criterion |
|---|---|
| SC1 | A single codebase/build produces both a fully-functional Standalone portal and an Embedded report surface, with no duplicated implementation of report rendering, RBAC, or theming logic. |
| SC2 | A host integrator (P5) can embed a report via iframe + signed JWT and see the correct, authorized report render with zero login prompts and zero visible app navigation. |
| SC3 | Standalone users see only the reports and admin functions their role permits; Embedded users see only the single report their JWT claims permit — verified against the same authorization model. |
| SC4 | A new visual brand (logo/colors/name) can be applied to either mode via configuration change alone, with no code modification, demonstrating white-label readiness. |
| SC5 | Invalid, expired, or tampered JWTs in Embedded mode are rejected with a clear error state and never fall back to rendering report data or a login form. |
| SC6 | All architecturally significant decisions made in service of this vision are captured as ADRs before implementation begins. |

---

## 8. Risks

| # | Risk | Impact | Likely Mitigation Direction |
|---|---|---|---|
| R1 | Divergence between Standalone and Embedded shells over time re-introduces duplicated logic, defeating the "one core" goal. | High | Enforce shared-core / thin-shell architecture via module boundaries and lint/architecture rules (detailed in Architecture spec). |
| R2 | JWT-based embedded auth trust boundary is misconfigured (e.g., missing issuer/audience checks, weak signature algorithm allowed), enabling forged embed access. | High | Strict JWT validation spec, allow-listed signing algorithms, `frame-ancestors` CSP, security review before launch. |
| R3 | White-label requirement is under-specified this early, leading to theming architecture that can't actually support future tenants without rework. | Medium | Treat theming as a first-class architectural concern now (design tokens, config schema) even though full white-label rollout is a non-goal for this phase. |
| R4 | RBAC model designed only for Standalone use fails to map cleanly onto JWT-claim-based authorization needed in Embedded mode. | Medium-High | Design a single authorization model consumed identically by both shells from the start (see FR-3.2). |
| R5 | Host integrators (P5) build against an undocumented/unstable embed contract, causing breakage on platform updates. | Medium | Version and document the JWT/bootstrap contract explicitly; treat it as a public API with compatibility guarantees. |
| R6 | Iframe embedding runs into third-party cookie or clickjacking-related browser restrictions in some host environments. | Medium | JWT-based (not cookie-based) auth for embedded mode; explicit CSP/X-Frame-Options strategy. |
| R7 | Scope creep from "future white-label" into full multi-tenant SaaS concerns (billing, tenant provisioning) inflates this phase's timeline. | Medium | Explicit non-goals (NG1, NG5) and phased roadmap; revisit as a separate initiative. |

---

## 9. Constraints

| # | Constraint |
|---|---|
| C1 | Must be built on Angular 20 using Standalone Components, Signals (preferred over RxJS where suitable), functional guards/interceptors, and `inject()` — no NgModules, no class-based guards/interceptors. |
| C2 | Must follow Spec Driven Development: this vision and all subsequent feature specs require assumptions/alternatives/risks/dependencies/acceptance criteria, and explicit approval before implementation. |
| C3 | Must follow SOLID, DRY, KISS, and Clean Architecture principles; must remain reusable as a platform for multiple enterprise products, not a bespoke single application. |
| C4 | Embedded mode is constrained to operate strictly within an iframe under a host application's control — it cannot assume top-level navigation or full-page real estate. |
| C5 | Embedded mode authentication is constrained to signed JWT hand-off from the host; it cannot assume access to the host's own session/cookies (cross-origin). |
| C6 | All architecturally significant decisions must be recorded as ADRs. |
| C7 | Backend/API contracts (auth issuance, report data, RBAC source of truth) are an external dependency to this frontend platform and are assumed to exist or be specified separately. |

---

## 10. Open Questions / Assumptions Requiring Confirmation

*(Carried forward into subsequent specs, not blocking this vision document, but flagged for traceability.)*

1. **Assumption:** Standalone authentication protocol (OIDC/SAML/custom) is not yet chosen — assumed to be addressed in a dedicated Authentication & Authorization spec.
2. **Assumption:** JWT transport mechanism into the iframe (URL param vs `postMessage` vs bootstrap config) is not yet chosen — assumed to be addressed in the Embedded Authentication spec.
3. **Assumption:** "Future white-label" implies config-driven theming and tenant identity, not per-tenant code forks — confirmed by requirement to avoid code duplication (G5, FR-3.3).
4. **Assumption:** RBAC roles/permission taxonomy is not yet defined — assumed to be addressed in a dedicated RBAC spec, but both shells must consume one shared model (FR-3.2).
5. **Assumption:** One Angular workspace (single build or shared-library + two shell apps) is preferred over two fully separate applications — assumed based on G1/G6/R1, to be finalized in the Architecture spec/ADR.

---

## 11. Next Steps

Pending your approval of this vision, candidate next specifications (each to follow the same spec format — assumptions, alternatives, risks, dependencies, acceptance criteria) are:

1. **Architecture Specification & ADR-0001** — shared-core / thin-shell workspace structure (single app with mode detection vs. multiple apps sharing libraries).
2. **Authentication & Session Spec** — Standalone login/session flow.
3. **Embedded Authentication Spec** — JWT contract, transport, validation, failure states.
4. **RBAC / Authorization Model Spec** — shared role/permission model for both shells.
5. **Theming & White-Label Spec** — design token architecture, configuration schema.

Let me know which to specify next, or if this vision needs revisions first.
