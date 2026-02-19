import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      const cloned = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(cloned);
    }),
    catchError((error) => {
      if (error.status === 401 && req.url.includes('/auth/logout')) {
        void router.navigateByUrl('/auth/login');
      }
      return throwError(() => error);
    })
  );
};
