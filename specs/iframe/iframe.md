# Iframe Usage Specification

## Status

Initial specification based on the route architecture and current home-page/report-route design.

## Scope

This document captures the current expectations for hosting the application inside an iframe and the routing conventions needed to support embedded report access.

## Requirements

1. The application may be opened directly or embedded in another host page.
2. Report routes should support deep linking so an iframe can load a single report without navigating through the catalog page.
3. Host integrations must avoid assuming that the app root home page is always visited.
4. Authentication and session handling in iframe scenarios must be explicitly reviewed for security and browser restrictions.

## Current implementation observations

- `src/app/app.routes.ts` defines a root catalog route and direct report routes.
- The home page is treated as the default entry page when the app is opened directly.
- Search-only report routes load the shared page for reports without a confirmed data source.
- Direct route access is the expected pattern for iframe-driven deep linking.

## Acceptance criteria

- A report route is navigable directly without requiring the reports home page.
- The app can support embedding without relying on the catalog page for report selection.
- Security decisions for iframe and cross-origin setup are documented in the authentication and security architecture.
- Route selection remains deterministic when the application is embedded in another page.

## Open decisions

- Whether the host page and embedded app share cookies or require token-based auth: Open Decision
- Whether message-based communication is required between host and iframe: Open Decision
- Whether origin allow-list validation will be enforced: Open Decision
