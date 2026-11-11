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
import { AuthService } from './auth.service';

export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.currentUser()?.role;

  if (role === 'admin' || role === 'formateur') return true;
  if (role === 'apprenant' || role === 'etudiant') {
    return router.createUrlTree(['/apprendre']);
  }
  return router.createUrlTree(['/compte/connexion']);
};