// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from './auth.service';

// export const staffGuard: CanActivateFn = () => {
//   const auth = inject(AuthService);
//   const router = inject(Router);
//   const role = auth.currentUser()?.role;

//   if (role === 'admin' || role === 'formateur') return true;

//   return router.createUrlTree(['/compte/connexion']);
// };

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// ============================================================
// ✅ SIMULATION : vérifie le rôle depuis localStorage
// ============================================================
export const staffGuard: CanActivateFn = () => {
  const router = inject(Router);

  try {
    const raw = localStorage.getItem('kmaa_user');
    if (raw) {
      const user = JSON.parse(raw);
      const role = user?.role;

      // ✅ Admin ou formateur → OK
      if (role === 'admin' || role === 'formateur') {
        return true;
      }
    }
  } catch { /* ignore */ }

  // ❌ Pas le bon rôle → retour au login
  return router.createUrlTree(['/compte/connexion']);
};