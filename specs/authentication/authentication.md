# Authentication Specification

## Status

Initial specification based on the current mocked dealer-context implementation and the architecture decisions carried forward from the previous project documentation. This is the canonical place for authentication decisions after the legacy `docs/` folder was retired.

## Scope

This specification covers the current assumptions, security constraints, and future implementation requirements for authentication and authorization in an iframe-based reporting application.

## Requirements

1. Authentication behavior must be explicitly documented before production usage.
2. The application may be loaded inside an iframe, so auth design must account for browser, cookie, and origin constraints.
3. Authentication-related HTTP logic should be centralized in an interceptor when the real auth flow is implemented.
4. Sensitive authentication data must never be exposed in frontend source code.
5. The app must not assume cookie, token, or origin behavior without a documented decision.
6. Access control should be permission-based and should not depend on ad hoc UI-only checks.
7. Auth and session decisions must remain compatible with deep-linked report routes and iframe embedding.

## Current implementation observations

- No production auth interceptor or guard exists yet.
- `src/app/shared/services/dealer-context/dealer-context.service.ts` provides static dealer identity values as a mock stand-in for auth-backed context.
- The current implementation is intentionally pragmatic and not a final authentication design.
- The app references a dealer identity API concept but has not yet implemented the real session or token flow.
- The platform is designed around route-driven access to report views and feature entry points, which means auth rules must be enforced consistently at the route and API boundary.

## Key decisions carried forward

### Token and session handling

- Short-lived access tokens are preferred for API access.
- Refresh tokens, if used, should not be stored in JavaScript-accessible browser storage.
- Cookie configuration and SameSite behavior must be reviewed explicitly.
- Auth expiry and unauthorized flows must be handled consistently.

### Iframe environment requirements

- iframe-based use must consider same-origin and cross-origin constraints.
- The app must avoid assumptions about cookie delivery or host trust without documented validation.
- Token delivery via a secure message-based flow is preferred over putting tokens in URLs.
- Origin validation is required before accepting trust decisions from the host environment.

### Authorization model

- Role-based assignments may exist as a convenience, but permission evaluation should be the actual runtime control point.
- Auth checks should not be duplicated across feature code paths.
- A shared authorization/service model should be used to evaluate required permissions consistently.

## Acceptance criteria

- Any future auth flow is documented in this specification before implementation.
- Auth handling differentiates between session expiry, unauthorized responses, and invalid origin assumptions.
- Security decisions include token strategy, cookie attributes, CORS policy, SameSite handling, and iframe restrictions.
- The application does not silently rely on browser credentials without documented behavior.
- Authentication and authorization decisions remain explicit and testable.

## Open decisions

- Real auth provider and token flow: Open Decision
- Session lifetime and refresh policy: Open Decision
- Cookie configuration and SameSite policy: Open Decision
- CSRF protection strategy: Open Decision
- Iframe-specific origin validation and postMessage strategy: Open Decision
- RBAC/authorization permissions model: TBD
- Whether a single embedded token or host-issued token model is required: Open Decision
