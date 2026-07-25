import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Allows access only to users with the ADMIN role.
 * Waits for the current user to resolve so a hard refresh on /admin works.
 */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  let user = await auth.getCurrentUser();

  // The cached user may predate the role field — fall back to a server check.
  if (user && user.role === undefined) {
    user = await auth.refreshFromServer();
  }

  if (user?.role === 'ADMIN') return true;

  return router.createUrlTree([user ? '/' : '/login']);
};
