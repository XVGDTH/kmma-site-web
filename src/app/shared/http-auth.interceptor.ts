import { HttpInterceptorFn } from '@angular/common/http';

/**
 * ✅ Intercepteur qui ajoute automatiquement le token Sanctum
 * à toutes les requêtes vers l'API Laravel.
 *
 * Le token est stocké dans localStorage['kmaa_token'].
 */
export const httpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('kmaa_token');

  // Si pas de token, on laisse passer la requête telle quelle
  if (!token) {
    return next(req);
  }

  // Si le token existe, on clone la requête en ajoutant le header Authorization
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return next(cloned);
};