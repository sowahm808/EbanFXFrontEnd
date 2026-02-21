import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const hasRetriedTokenRefresh = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);

  const redirectToLoginIfNoSession = (error: unknown) =>
    from(authService.waitForAuthReady()).pipe(
      switchMap(() => {
        // After auth is ready, check again
        const user = authService.currentUserSignal();
        const hasSession = !!user || authService.hasStoredAuthToken();

        if (!hasSession) {
          authService.clearStoredAuth();
          void router.navigateByUrl('/auth/login');
        }

        return throwError(() => error);
      })
    );

  // Attach token helper (optionally force refresh)
  const attachTokenAndContinue = (token: string | null) => {
    const cloned = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next(cloned);
  };

  /**
   * IMPORTANT CHANGE:
   * If token is missing for API request, don't immediately treat it as unauthorized.
   * Wait for auth ready and attempt to get a fresh token once.
   */
  const handleMissingTokenForApi = () =>
    from(authService.waitForAuthReady()).pipe(
      switchMap(() => from(authService.getFreshIdToken())),
      switchMap((freshToken) => {
        if (!freshToken) {
          // now it's truly a missing session
          return redirectToLoginIfNoSession(
            new HttpErrorResponse({ status: 401, url: req.url, statusText: 'Missing token' })
          );
        }
        return attachTokenAndContinue(freshToken);
      })
    );

  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      if (isApiRequest && !token) {
        return handleMissingTokenForApi();
      }
      return attachTokenAndContinue(token);
    }),
    catchError((error: unknown) => {
      const httpErr = error as HttpErrorResponse;
      const isApi401 = isApiRequest && httpErr?.status === 401;

      // Retry exactly once with a forced refresh (for expired token / claims change)
      if (isApi401 && !req.context.get(hasRetriedTokenRefresh)) {
        return from(authService.getFreshIdToken()).pipe(
          switchMap((freshToken) => {
            if (!freshToken) {
              return redirectToLoginIfNoSession(error);
            }

            const retriedRequest = req.clone({
              context: req.context.set(hasRetriedTokenRefresh, true),
              setHeaders: { Authorization: `Bearer ${freshToken}` }
            });

            return next(retriedRequest);
          }),
          catchError((retryError) => redirectToLoginIfNoSession(retryError))
        );
      }

      if (isApi401) {
        return redirectToLoginIfNoSession(error);
      }

      return throwError(() => error);
    })
  );
};
