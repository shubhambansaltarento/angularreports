# Specifications Index

This folder is the source of truth for application requirements, architecture, security decisions, and acceptance criteria for the reporting application.

## Purpose

- `specs/` captures requirements before implementation.
- New features must be specified before code changes are made.
- Each specification should define clear requirements, constraints, and acceptance criteria.
- Test cases should be derived from the specification.
- Implementation must be validated against the specification.
- Important architecture, security, and iframe-related decisions must be documented here.
- Specifications must be updated when application behavior changes.
- The legacy `docs/` folder has been retired; all critical product and engineering decisions now live in `specs/`.

## Current scope

- Architecture: `architecture/architecture.md`
- Authentication: `authentication/authentication.md`
- Design library (Bootstrap): `design/design.md`
- Iframe embedding considerations: `iframe/iframe.md`
- Reports catalog and report behavior: `reports/reports.md`
- Shared table implementation: `table/table.md`
- Feature specs (application component, breadcrumbs, etc.): `features/`

## Working rules

1. Document requirements before introducing new behavior.
2. Record Open Decision or TBD when information is not yet confirmed.
3. Keep implementation aligned with the approved specification.
4. Preserve useful existing implementation and extend it incrementally.
5. Do not treat this folder as optional documentation; it is part of the engineering contract.
6. Prefer `specs/` over legacy docs as the canonical place for design and architecture history.

## Canonical design decisions carried forward

- Feature-based, layered application structure with shared infrastructure and isolated feature folders.
- Standalone Angular components and Angular 21 patterns preferred over older patterns.
- Shared report and table abstractions should be reused before feature-specific logic is duplicated.
- Authentication and iframe security decisions must be explicit, reviewed, and documented in `specs/authentication/` and `specs/iframe/`.
- The application may be opened directly or embedded; direct deep-link routes are required for iframe usage.
