import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // ✅ Router avec restauration du scroll (nécessaire pour ton parcours)
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),

    // ❌ SUPPRIMÉ : provideHttpClient(withInterceptors([authInterceptor]))
    //    → à réactiver quand tu brancheras tes vraies APIs
    //
    // ❌ SUPPRIMÉ : { provide: APP_INITIALIZER, useFactory: initAuth, ... }
    //    → auth.refreshSession() appelait le backend au démarrage
    //
    // ❌ SUPPRIMÉ : import AuthService, authInterceptor
    //    → plus utilisés tant que tu es en simulation
  ],
};