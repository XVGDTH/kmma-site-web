import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isLoggedIn() || !auth.getToken()) {
    return router.createUrlTree(['/compte/connexion'], {
      queryParams: { redirect: state.url },
    });
  }
  return true;
};