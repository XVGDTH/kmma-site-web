import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const studentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.currentUser()?.role;

  // ✅ Un apprenant connecté peut entrer
  if (role === 'apprenant') {
    return true;
  }

  // Les staffs ont leur propre espace
  if (role === 'admin' || role === 'formateur') {
    return router.createUrlTree(['/formateur/tableau-de-bord']);
  }

  // Non connecté → login avec retour automatique ici
  return router.createUrlTree(['/compte/connexion'], {
    queryParams: { redirect: '/compte/espace' },
  });
};