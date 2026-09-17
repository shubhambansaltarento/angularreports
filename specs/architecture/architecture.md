# Architecture Specification

## Status

Initial specification derived from the existing Angular application structure and current implementation patterns. This document incorporates the important architectural decisions previously captured in the legacy documentation and keeps them in the canonical `specs/` set.

## Purpose

This specification defines the structure, layering approach, and architectural constraints for the reporting application. It is the source-of-truth definition for how features, shared UI, and domain concerns are organized.

## Scope

This document covers:
- feature-based app structure
- shared infrastructure vs. feature isolation
- route-driven access for reports
- reuse of shared report/search and table abstractions
- dependency and responsibility boundaries

## Architectural principles

1. Use a feature-first structure with business features isolated under `src/app/features`.
2. Keep shared, reusable UI and cross-cutting concerns under `src/app/shared`.
3. Prefer standalone Angular components and Angular 21 patterns.
4. Keep routes as the main entry points for feature navigation and direct deep links.
5. Preserve useful existing implementation and refactor incrementally rather than replacing working code.
6. Keep responsibilities clearly separated between feature logic, domain models, shared UI, and infrastructure.

## Current implementation observations

- The root application route table in `src/app/app.routes.ts` defines the home page and report routes.
- The reports home page lists the catalog of available reports.
- Report-specific config objects are used to describe route metadata and whether a report currently has a confirmed table implementation.
- The Dealer Ledger feature owns its own route children, service, store, and page-level components.
- The shared table component is generic and reusable across report features.
- Shared report search controls are reused across multiple reports.
- The application is intentionally structured to support both direct app entry and iframe-driven deep linking.

## Recommended structural shape

```text
src/
└── app/
    ├── core/
    ├── shared/
    └── features/
        ├── reports-home/
        ├── dealer-ledger/
        ├── goods-acknowledgement/
        └── ...
```

This matches the project’s current direction and allows new report features to be added without reorganizing the whole app.

## Dependency and responsibility rules

- Shared code should not contain feature-specific business rules.
- Feature code should not duplicate logic that already exists in shared UI/domain abstractions.
- Infrastructure concerns such as HTTP, session, token handling, and browser integration should remain separated from feature logic.
- Deterministic route selection and consistent metadata are required for report discovery and deep-link support.

## Acceptance criteria

- The project remains organized around business features and shared infrastructure.
- Reusable UI remains centralized in `src/app/shared`.
- Reports remain discoverable from the application home page or direct routes.
- New report features can be added without overhauling the existing structure.
- Patterns from existing implementation are preserved unless a specific change requires refactoring.
- Important design decisions are recorded in `specs/` and not scattered across legacy docs.

## Open decisions

- A formal `core/authentication` module has not yet been implemented; this remains a TBD item until the auth architecture is approved.
- Routing guards, authorization checks, and error boundaries are intentionally deferred pending the formal architecture specification.
- The final authorization and RBAC model remains open pending a confirmed design decision.
