# ADR-0001: Layered Clean Architecture with Monorepo Workspace and Shared-Core / Thin-Shell Model

**Status:** Proposed — pending approval
**Date:** 2026-07-22
**Related:** [Product Vision](../product-vision.md), [Software Architecture Specification](../architecture/software-architecture-specification.md)

## Context

The platform must serve two modes (Standalone application, Embedded iframe application — see Product Vision §1–2) from what the Vision requires to be effectively one platform, not two divergent codebases (Vision G1, R1). It must also remain extensible to future shells and white-label tenants (Vision G5, G6) without architectural rework.

We need a workspace structure and layering discipline that:
1. Lets both shells reuse identical reporting, RBAC, and UI-kit logic.
2. Lets the Embedded shell ship a materially smaller bundle than Standalone (no login/dashboard/admin code).
3. Enforces boundaries so the two shells cannot silently diverge over time.
4. Scales to additional shells/tenants later without a rewrite.

## Decision

Adopt a **layered Clean Architecture** (Business layer at the center; Presentation, Routing, Data, Infrastructure, Configuration as surrounding layers; Core and Shared as cross-cutting composition/UI-kit layers) organized as a **monorepo workspace**: shared libraries per layer, consumed by two thin application shells (`shell-standalone`, `shell-embedded`) that act purely as composition roots.

Dependency direction follows the Dependency Rule: outer layers depend inward on Business through interfaces ("ports") that Business defines and Data implements; wiring happens via DI at each shell's composition root. Full layer responsibilities, folder structure, and the dependency matrix are specified in the [Software Architecture Specification](../architecture/software-architecture-specification.md).

Boundary enforcement (which layer may import which) must be encoded in tooling — e.g., Nx module-boundary tags, or an equivalent ESLint import-boundary configuration if a lighter-weight Angular CLI multi-project workspace is used instead of Nx — and must fail CI on violation. The specific tool is left to the implementation team to select against this constraint; it is not re-litigated per feature.

## Alternatives Considered

1. **Single app, runtime mode branching** — rejected: ships unused Standalone code into the Embedded bundle regardless of branching, and offers no compiler/lint-enforced boundary between modes.
2. **Two fully separate apps/repos, no shared libraries** — rejected: directly causes the logic-duplication risk the Vision explicitly calls out (R1); RBAC and report rendering would drift between the two over time.
3. **Micro-frontend / Module Federation per feature** — deferred, not rejected outright: adds real operational complexity (independent deploys, shared-dependency version skew) not justified by current requirements. Revisit only if a future requirement demands independent runtime deployability per feature or per tenant.
4. **Monorepo with layered libraries + thin shells (chosen)** — best satisfies reuse, boundary enforcement, and future extensibility with the least added operational complexity today.

## Consequences

**Positive:**
- One implementation of reporting/RBAC/UI-kit logic serves both modes (Vision SC1).
- Embedded shell can be built to include only what it needs, keeping it lean (Vision G7).
- Dependency boundaries are mechanically enforced, not just documented (mitigates Vision R1).
- New shells (e.g., a future mobile-web wrapper) or new tenants can be added as new composition roots without touching layer libraries (Vision G6).

**Negative / trade-offs:**
- Higher upfront workspace-setup complexity than a single app.
- Requires contributor discipline/onboarding around the Dependency Inversion pattern (Business defines ports, Data implements) — mitigated by documentation in the architecture spec (§18.2 class diagram) and PR review checklist.
- Monorepo tooling (whichever is chosen) becomes a project-wide dependency; upgrading or migrating it later is a non-trivial undertaking.

**Follow-up decisions required:**
- Concrete tool selection (Nx vs Angular CLI multi-project + custom ESLint boundaries) — an implementation detail within this ADR's scope, to be confirmed at build-out time.
- RBAC/Authorization Model spec must define the `AuthorizationPort` contract referenced in the architecture spec.
- Standalone and Embedded Authentication specs must define what populates `libs/business/auth` and `libs/infrastructure/jwt` respectively.
