# Dev Tooling — `ng serve` Silently Serves a Stale Bundle After Structural Changes (Disable HMR)

**Created:** 2026-09-17 08:29 AM

## Status

Implemented. `hmr: false` added to `angular.json`'s `serve` target.

## Purpose

Twice in this session, a browser tab open against `ng serve`
(`localhost:4200`) kept displaying stale UI/data (mocked
`DLR-001`/`Northgate Motors` instead of the real config API's values)
even though:

- The backend API was confirmed returning correct data (verified via
  DevTools Network tab).
- The relevant Angular code was confirmed correct via unit tests,
  including a test that specifically models the real async timing.
- A hard page refresh (not just re-navigating) immediately fixed the
  display with no code change.

This is a dev-tooling reliability issue, not an application bug — but
it's happened twice and cost real debugging time both times by looking
identical to a genuine reactivity/race bug. This spec proposes a
concrete fix to stop it recurring silently.

## Root cause

- Note on this project's actual `@angular/build` version: its `hmr`
  option's own schema documentation states HMR here is scoped to
  *"only global and component stylesheets"* — i.e., this build system's
  HMR cannot hot-swap TypeScript logic/templates at all, only CSS. So
  the specific mechanism isn't "HMR patched a component with a stale
  DI graph in place" (that class of failure applies to *other*
  Angular/webpack HMR implementations, not confirmed for this one).
- The more likely mechanism, given HMR here is CSS-only: Angular's
  **live-reload** (the `watch`/rebuild-and-refresh mechanism separate
  from HMR, enabled by default) is what's responsible for full-page
  reloads on TS/template changes — delivered over a WebSocket
  connection from the dev server to the browser tab. Over a long-running
  `ng serve` session with dozens of rebuilds (this session made an
  unusually large number of structural changes — new standalone
  components, new route-level DI providers, new lazy routes,
  deleted/renamed files), that WebSocket connection can silently drop
  or desync without the tab or terminal surfacing any visible error —
  the terminal still reports a clean rebuild, but the already-open tab
  never receives the reload signal and keeps running its old in-memory
  bundle indefinitely.
- A full page reload (hard refresh / re-navigating) always works
  because it re-requests the page and its bundle fresh over a new HTTP
  connection, independent of whatever state the old WebSocket
  connection was in.
- This is a plausible mechanism, not a fully proven one — Angular CLI
  doesn't expose direct visibility into live-reload WebSocket health
  from the browser tab to confirm it definitively. The practical fix
  below doesn't depend on pinning down the exact mechanism further.

## Scope

- `angular.json`'s `serve` target — disable HMR (`hmr: false`).
  Since this version's HMR only ever affects stylesheets, this is a
  low-risk simplification (one less moving part, guaranteed
  full-reload-only behavior for every kind of change including CSS)
  rather than a proven fix for the TS/template-staleness mechanism
  itself, whose true cause (a possibly-desynced live-reload WebSocket
  over a long dev session) isn't something app-level config can
  directly control.
- Documented procedural mitigation (not a code change): when
  stale-looking behavior is suspected during a long `ng serve` session
  despite correct code/API responses, hard-refresh the tab (or
  restart `ng serve`) before spending further time debugging as if
  it's an application bug.
- Out of scope: production builds (`ng build`) — entirely unaffected,
  `hmr` is a dev-server-only concept.
- Out of scope: diagnosing/fixing Angular CLI's live-reload WebSocket
  reliability itself — an upstream tooling concern, not something to
  work around in this app's own code.

## Requirements

1. Running `ng serve`/`npm start` never silently serves stale
   behavior after a file save — every change results in either a
   visible full-page reload or an explicit compilation error in the
   terminal, never a silent "looks compiled but isn't really applied"
   state.
2. No change to production build behavior or output.

## Acceptance criteria

- `angular.json`'s `serve.options` includes `"hmr": false` (or the
  equivalent per the installed `@angular/build` version's schema).
- After this change, saving a file during `ng serve` triggers a full
  browser reload of any open tab (confirmed by watching the Network
  tab show a fresh full page load, not a partial chunk swap) rather
  than an in-place patch.
- Documented in this spec (for future reference in this session/repo):
  if stale-looking behavior is ever suspected again despite correct
  code and a correct API response, the first troubleshooting step is
  a hard refresh — not further code changes — before concluding
  there's a real bug.

## Open decisions

- None — this is a single, low-risk dev-server configuration flag
  flip with no functional/production impact.
