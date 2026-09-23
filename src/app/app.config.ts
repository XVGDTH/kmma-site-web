import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/auth.interceptor';
import { AuthService } from './shared/auth.service';


function initAuth(auth: AuthService) {
  return () => auth.refreshSession();
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // providers connexion vers les apis
  
    provideHttpClient(withInterceptors([authInterceptor])),

    // fichier connexion

     { provide: APP_INITIALIZER, useFactory: initAuth, deps: [AuthService], multi: true },
  
  ]
};
