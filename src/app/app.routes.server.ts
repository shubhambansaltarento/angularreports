import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Dealer Ledger is dynamic, per-user data (mock-backed for now) — not suited to
    // build-time prerendering, and its ':dealerCode' detail route has no fixed, enumerable
    // param set. Rendered client-side instead of prerendered.
    path: 'dealer-ledger/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
