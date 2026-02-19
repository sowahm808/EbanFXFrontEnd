import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { UserService } from '../services/user.service';

export const kycGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.profile$.pipe(
    map((profile) => profile?.kycStatus === 'approved' ? true : router.createUrlTree(['/kyc'], { queryParams: { reason: 'approval_required' } }))
  );
};
