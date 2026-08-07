import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding(): lets route `data` (report title/description) bind
    // directly onto ReportSearchOnlyPageComponent's inputs (see app.routes.ts) — one
    // shared component serves every report that has no table/data source wired up yet.
    provideRouter(routes, withComponentInputBinding()), provideClientHydration(withEventReplay())
  ]
};
