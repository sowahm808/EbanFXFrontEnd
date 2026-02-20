import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.currentUser$.pipe(
    map((user) => {
      if (user || authService.hasStoredAuthToken()) {
        return true;
      }

      return router.createUrlTree(['/auth/login']);
    })
  );
};
