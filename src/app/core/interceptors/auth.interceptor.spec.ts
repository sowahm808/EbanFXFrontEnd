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
        { provide: AuthService, useValue: { getIdToken: () => Promise.resolve('abc-token') } },
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

  it('clears auth and redirects to login on 401 from API', (done) => {
    const clearStoredAuth = jasmine.createSpy('clearStoredAuth');
    const navigateByUrl = jasmine.createSpy('navigateByUrl');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getIdToken: () => Promise.resolve('abc-token'), clearStoredAuth } },
        { provide: Router, useValue: { navigateByUrl } }
      ]
    });

    const req = new HttpRequest('GET', `${environment.apiBaseUrl}/me`);
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401, url: req.url }));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        next: () => fail('expected error response'),
        error: () => {
          expect(clearStoredAuth).toHaveBeenCalled();
          expect(navigateByUrl).toHaveBeenCalledWith('/auth/login');
          done();
        }
      });
    });
  });
});
