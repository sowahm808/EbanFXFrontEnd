import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const hasRetriedTokenRefresh = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const handleUnauthorized = (error: unknown) =>
    from(authService.waitForAuthReady()).pipe(
      switchMap(() => {
        const hasSession = !!authService.currentUserSignal() || authService.hasStoredAuthToken();
        if (!hasSession) {
          authService.clearStoredAuth();
          void router.navigateByUrl('/auth/login');
        }

        return throwError(() => error);
      })
    );

  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
      if (isApiRequest && !token) {
        return handleUnauthorized({ status: 401, url: req.url });
      }

      const cloned = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(cloned);
    }),
    catchError((error) => {
      const isApi401 = error.status === 401 && req.url.startsWith(environment.apiBaseUrl);

      if (isApi401 && !req.context.get(hasRetriedTokenRefresh)) {
        return from(authService.getFreshIdToken()).pipe(
          switchMap((freshToken) => {
            if (!freshToken) {
              return handleUnauthorized(error);
            }

            const retriedRequest = req.clone({
              context: req.context.set(hasRetriedTokenRefresh, true),
              setHeaders: { Authorization: `Bearer ${freshToken}` }
            });

            return next(retriedRequest);
          }),
          catchError((retryError) => handleUnauthorized(retryError))
        );
      }

      if (isApi401) {
        return handleUnauthorized(error);
      }

      return throwError(() => error);
    })
  );
};
