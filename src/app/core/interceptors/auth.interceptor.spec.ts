import { HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  it('attaches bearer token when available', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getIdToken: () => Promise.resolve('abc-token'), getFreshIdToken: () => Promise.resolve('fresh-token') } },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } }
      ]
    });

    const req = new HttpRequest('GET', '/me');
    const next: HttpHandlerFn = (request) => {
      expect(request.headers.get('Authorization')).toBe('Bearer abc-token');
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        done();
      });
    });
  });

  it('retries once with a fresh token on API 401', (done) => {
    const clearStoredAuth = jasmine.createSpy('clearStoredAuth');
    const navigateByUrl = jasmine.createSpy('navigateByUrl');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            getIdToken: () => Promise.resolve('stale-token'),
            getFreshIdToken: () => Promise.resolve('fresh-token'),
            clearStoredAuth
          }
        },
        { provide: Router, useValue: { navigateByUrl } }
      ]
    });

    const req = new HttpRequest('GET', `${environment.apiBaseUrl}/me`);
    let calls = 0;
    const next: HttpHandlerFn = (request) => {
      calls += 1;
      if (calls === 1) {
        return throwError(() => new HttpErrorResponse({ status: 401, url: req.url }));
      }

      expect(request.headers.get('Authorization')).toBe('Bearer fresh-token');
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        next: () => {
          expect(calls).toBe(2);
          expect(clearStoredAuth).not.toHaveBeenCalled();
          expect(navigateByUrl).not.toHaveBeenCalled();
          done();
        },
        error: () => fail('expected successful retry response')
      });
    });
  });

  it('clears auth and redirects to login on 401 from API after refresh retry fails', (done) => {
    const clearStoredAuth = jasmine.createSpy('clearStoredAuth');
    const getFreshIdToken = jasmine.createSpy('getFreshIdToken').and.returnValue(Promise.resolve('fresh-token'));
    const navigateByUrl = jasmine.createSpy('navigateByUrl');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getIdToken: () => Promise.resolve('abc-token'), getFreshIdToken, clearStoredAuth } },
        { provide: Router, useValue: { navigateByUrl } }
      ]
    });

    const req = new HttpRequest('GET', `${environment.apiBaseUrl}/me`);
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401, url: req.url }));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        next: () => fail('expected error response'),
        error: () => {
          expect(getFreshIdToken).toHaveBeenCalled();
          expect(clearStoredAuth).toHaveBeenCalled();
          expect(navigateByUrl).toHaveBeenCalledWith('/auth/login');
          done();
        }
      });
    });
  });
});
