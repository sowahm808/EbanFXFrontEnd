import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
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
      if (error.status === 401 && req.url.startsWith(environment.apiBaseUrl)) {
        authService.clearStoredAuth();
        void router.navigateByUrl('/auth/login');
      }
      return throwError(() => error);
    })
  );
};
