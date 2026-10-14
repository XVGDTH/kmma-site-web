// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from './auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const auth = inject(AuthService);
//   const router = inject(Router);

//   if (auth.isLoggedIn()) return true;

//   return router.createUrlTree(['/compte/connexion'], {
//     queryParams: { redirect: state.url },
//   });
// };


import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// ============================================================
// ✅ SIMULATION : vérifie juste localStorage['kmaa_user']
// Plus tard : remplacer par AuthService
// ============================================================
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  try {
    const raw = localStorage.getItem('kmaa_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.email) {
        return true;
      }
    }
  } catch { /* ignore */ }

  return router.createUrlTree(['/compte/connexion'], {
    queryParams: { redirect: state.url },
  });
};