import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { UserService } from '../services/user.service';

export const roleGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.profile$.pipe(
    map((profile) => {
      if (!profile) {
        return router.createUrlTree(['/tabs/dashboard']);
      }
      return profile.role === 'admin' || profile.role === 'compliance'
        ? true
        : router.createUrlTree(['/tabs/dashboard']);
    })
  );
};
