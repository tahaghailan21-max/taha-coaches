import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/** Requires a logged-in user; otherwise redirects to /login. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.getCurrentUser();
  return user ? true : router.createUrlTree(['/login']);
};
